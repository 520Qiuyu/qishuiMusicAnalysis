import { ctr } from "@noble/ciphers/aes.js";

export interface Mp4Box {
  offset: number;
  size: number;
  data: Uint8Array;
}

export interface DecryptDataResult {
  data: Uint8Array;
  decrypted: boolean;
  reason: string;
}

export interface DecryptBlobResult {
  blob: Blob;
  decrypted: boolean;
  reason: string;
}

const ENCA_BYTES = new TextEncoder().encode("enca");
const MP4A_BYTES = new TextEncoder().encode("mp4a");
const SPADE_PREFIX = new Uint8Array([0xfa, 0x55]);

const concatBytes = (...parts: Uint8Array[]) => {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
};

const readUInt16BE = (data: Uint8Array, offset: number) =>
  new DataView(data.buffer, data.byteOffset + offset, 2).getUint16(0, false);

const readUInt32BE = (data: Uint8Array, offset: number) =>
  new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, false);

const bytesToAscii = (data: Uint8Array) => String.fromCharCode(...data);

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const hexToBytes = (hex: string) => {
  const normalizedHex = hex.trim();
  const bytes = new Uint8Array(normalizedHex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(normalizedHex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
};

const indexOfBytes = (haystack: Uint8Array, needle: Uint8Array) => {
  if (!needle.length || haystack.length < needle.length) {
    return -1;
  }

  outer: for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        continue outer;
      }
    }

    return index;
  }

  return -1;
};

const decryptAesCtr = (data: Uint8Array, keyBytes: Uint8Array, iv: Uint8Array) =>
  ctr(keyBytes, iv).decrypt(data);

class SpadeDecryptor {
  private static bitCount(value: number) {
    let current = value >>> 0;
    current -= (current >>> 1) & 0x55555555;
    current = (current & 0x33333333) + ((current >>> 2) & 0x33333333);
    return (((current + (current >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
  }

  private static decodeBase36(value: number) {
    if (value >= 48 && value <= 57) return value - 48;
    if (value >= 97 && value <= 122) return value - 97 + 10;
    return 0xff;
  }

  private static decryptSpadeInner(spadeKeyBytes: Uint8Array) {
    const result = new Uint8Array(spadeKeyBytes.length);
    const buff = concatBytes(SPADE_PREFIX, spadeKeyBytes);

    for (let index = 0; index < result.length; index += 1) {
      const raw = (spadeKeyBytes[index] ^ buff[index]) - SpadeDecryptor.bitCount(index) - 21;
      result[index] = raw >= 0 ? raw : ((raw % 255) + 255) % 255;
    }

    return result;
  }

  static extractKey(playAuth: string) {
    const bytes = base64ToBytes(playAuth);
    if (bytes.length < 3) return null;

    const paddingLength = (bytes[0] ^ bytes[1] ^ bytes[2]) - 48;
    if (bytes.length < paddingLength + 2) return null;

    const tmpBuff = SpadeDecryptor.decryptSpadeInner(bytes.subarray(1, bytes.length - paddingLength));
    if (!tmpBuff.length) return null;

    const endIndex = 1 + (bytes.length - paddingLength - 2) - SpadeDecryptor.decodeBase36(tmpBuff[0]);
    return new TextDecoder().decode(tmpBuff.subarray(1, endIndex));
  }
}

/**
 * 解密汽水音乐 Soda 加密的 m4a/mp4 音频数据。
 *
 * @example
 * const blob = await fetch(audioUrl).then(res => res.blob());
 * const { blob: decryptedBlob } = await SodaAudioDecryptor.decryptBlob(blob, playAuth);
 */
export class SodaAudioDecryptor {
  static findBox(data: Uint8Array, boxType: string, start = 0, end = data.length): Mp4Box | null {
    let position = start;

    while (position + 8 <= end) {
      const size = readUInt32BE(data, position);
      if (size < 8 || position + size > data.length) break;

      const currentType = bytesToAscii(data.subarray(position + 4, position + 8));
      if (currentType === boxType) {
        return {
          offset: position,
          size,
          data: data.subarray(position + 8, position + size),
        };
      }

      position += size;
    }

    return null;
  }

  static async decryptData(fileData: Uint8Array, playAuth: string): Promise<DecryptDataResult> {
    const hexKey = SpadeDecryptor.extractKey(playAuth);
    if (!hexKey) {
      return { data: fileData, decrypted: false, reason: "playAuth key extraction failed" };
    }

    const moov = SodaAudioDecryptor.findBox(fileData, "moov");
    if (!moov) return { data: fileData, decrypted: false, reason: "moov box not found" };

    let senc = SodaAudioDecryptor.findBox(fileData, "senc", moov.offset + 8, moov.offset + moov.size);
    const trak = SodaAudioDecryptor.findBox(fileData, "trak", moov.offset + 8, moov.offset + moov.size);
    if (!trak) return { data: fileData, decrypted: false, reason: "trak box not found" };

    const mdia = SodaAudioDecryptor.findBox(fileData, "mdia", trak.offset + 8, trak.offset + trak.size);
    if (!mdia) return { data: fileData, decrypted: false, reason: "mdia box not found" };

    const minf = SodaAudioDecryptor.findBox(fileData, "minf", mdia.offset + 8, mdia.offset + mdia.size);
    if (!minf) return { data: fileData, decrypted: false, reason: "minf box not found" };

    const stbl = SodaAudioDecryptor.findBox(fileData, "stbl", minf.offset + 8, minf.offset + minf.size);
    if (!stbl) return { data: fileData, decrypted: false, reason: "stbl box not found" };

    const stsz = SodaAudioDecryptor.findBox(fileData, "stsz", stbl.offset + 8, stbl.offset + stbl.size);
    if (!stsz) return { data: fileData, decrypted: false, reason: "stsz box not found" };

    const stszData = stsz.data;
    const sampleSizeFixed = readUInt32BE(stszData, 4);
    const sampleCount = readUInt32BE(stszData, 8);
    const sampleSizes = sampleSizeFixed
      ? Array.from({ length: sampleCount }, () => sampleSizeFixed)
      : Array.from({ length: sampleCount }, (_, index) => readUInt32BE(stszData, 12 + index * 4));

    if (!senc) {
      senc = SodaAudioDecryptor.findBox(fileData, "senc", stbl.offset + 8, stbl.offset + stbl.size);
      if (!senc) return { data: fileData, decrypted: false, reason: "senc box not found" };
    }

    const sencData = senc.data;
    const sencFlags = readUInt32BE(sencData, 0) & 0x00ffffff;
    const sencSampleCount = readUInt32BE(sencData, 4);
    const ivs: Uint8Array[] = [];
    let sencPtr = 8;

    for (let index = 0; index < sencSampleCount; index += 1) {
      ivs.push(concatBytes(sencData.subarray(sencPtr, sencPtr + 8), new Uint8Array(8)));
      sencPtr += 8;

      if ((sencFlags & 0x02) !== 0) {
        const subCount = readUInt16BE(sencData, sencPtr);
        sencPtr += 2 + subCount * 6;
      }
    }

    const mdat = SodaAudioDecryptor.findBox(fileData, "mdat");
    if (!mdat) return { data: fileData, decrypted: false, reason: "mdat box not found" };

    const output = new Uint8Array(fileData);
    const keyBytes = hexToBytes(hexKey);
    const decryptedMdatParts: Uint8Array[] = [];
    let readPtr = mdat.offset + 8;

    for (let index = 0; index < sampleSizes.length; index += 1) {
      const sample = fileData.subarray(readPtr, readPtr + sampleSizes[index]);
      if (index < ivs.length) {
        decryptedMdatParts.push(decryptAesCtr(sample, keyBytes, ivs[index]));
      } else {
        decryptedMdatParts.push(sample);
      }
      readPtr += sampleSizes[index];
    }

    const decryptedMdat = concatBytes(...decryptedMdatParts);
    if (decryptedMdat.length === mdat.size - 8) {
      output.set(decryptedMdat, mdat.offset + 8);
    }

    const stsd = SodaAudioDecryptor.findBox(output, "stsd", stbl.offset + 8, stbl.offset + stbl.size);
    if (stsd) {
      const originalStsd = output.subarray(stsd.offset, stsd.offset + stsd.size);
      const encaIndex = indexOfBytes(originalStsd, ENCA_BYTES);
      if (encaIndex >= 0) {
        output.set(MP4A_BYTES, stsd.offset + encaIndex);
      }
    }

    return { data: output, decrypted: true, reason: "decrypted" };
  }

  /**
   * 解密浏览器中的音频 Blob。
   *
   * @example
   * const encryptedBlob = await getFileBlob(audioUrl);
   * const { blob } = await SodaAudioDecryptor.decryptBlob(encryptedBlob, playAuth);
   */
  static async decryptBlob(blob: Blob, playAuth: string): Promise<DecryptBlobResult> {
    const fileData = new Uint8Array(await blob.arrayBuffer());
    const result = await SodaAudioDecryptor.decryptData(fileData, playAuth);
    return {
      blob: new Blob([new Uint8Array(result.data)], { type: blob.type || "audio/mp4" }),
      decrypted: result.decrypted,
      reason: result.reason,
    };
  }
}
