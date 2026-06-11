import { parseBlob } from "music-metadata";

import type { MusicInfo } from "../store";

export type KrcLyricWord = {
  text: string;
  startMs: number;
  endMs: number;
};

export type KrcLyricSentence = {
  text: string;
  startMs: number;
  endMs: number;
  words: KrcLyricWord[];
  type?: string;
};

export type KrcLyrics = {
  lyricType: "krc";
  sentences: KrcLyricSentence[];
};

type AudioWithLyricsOption = {
  trackName?: string;
  artistName?: string;
  trackInfo?: {
    album?: {
      name?: string;
    };
  };
  coverURL?: string;
  url?: string;
  lyrics?: KrcLyrics;
};

/** 解析链接 */
export const parseLink = (link: string) => {
  const url = link.match(/https:\/\/[^\s]+/) ?? "";
  if (!url) {
    throw new Error("Invalid link");
  }
  return url[0];
};

const formatLrcTime = (timeMs: number) => {
  const normalizedTimeMs = Number.isFinite(timeMs) ? Math.max(timeMs, 0) : 0;
  const minutes = Math.floor(normalizedTimeMs / 60000);
  const seconds = Math.floor((normalizedTimeMs % 60000) / 1000);
  const centiseconds = Math.floor((normalizedTimeMs % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(
    centiseconds
  ).padStart(2, "0")}`;
};

/**
 * 将汽水音乐返回的 krc 歌词结构转换为标准 lrc 文本。
 *
 * @example
 * const lrc = parseLrc({
 *   lyricType: "krc",
 *   sentences: [{ text: "一点", startMs: 1200, endMs: 2500, words: [] }],
 * });
 */
export const parseLrc = (lyrics?: KrcLyrics | null) => {
  if (!lyrics?.sentences?.length) {
    return "";
  }

  return lyrics.sentences
    .filter(sentence => sentence.text)
    .map(sentence => `[${formatLrcTime(sentence.startMs)}]${sentence.text}`)
    .join("\n");
};

/** 解析音乐信息 */
export const parseMusicInfo = async (html: string) => {
  if (!html) {
    throw new Error("请传入页面 HTML 内容");
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const scripts = doc.getElementsByTagName("script");
  const lrcs = doc.querySelectorAll(".ssr-lyric");
  console.log("lrcs", lrcs);

  let musicInfo: MusicInfo | null = {
    lrcContent: [...lrcs].map(lrc => lrc.textContent || "").join("\n"),
  };

  for (const script of scripts) {
    const content = script.textContent || script.innerText;
    if (content.includes("_ROUTER_DATA")) {
      try {
        const match = content.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
        if (match && match[1]) {
          const jsonData = JSON.parse(match[1]);
          const infoData = jsonData?.loaderData?.track_page || {};
          const { audioWithLyricsOption } = infoData as {
            audioWithLyricsOption?: AudioWithLyricsOption;
          };
          if (audioWithLyricsOption) {
            const title = audioWithLyricsOption.trackName || "未知歌曲";
            const artist = audioWithLyricsOption.artistName || "未知歌手";
            const album = audioWithLyricsOption.trackInfo?.album?.name || "未知专辑";
            const cover = audioWithLyricsOption.coverURL || "https://via.placeholder.com/120";
            const url = audioWithLyricsOption.url
              ? encodeURI(decodeURI(audioWithLyricsOption.url))
              : "";
            const lrc = `[ti:${title}]\n[ar:${artist}]\n${parseLrc(audioWithLyricsOption.lyrics)}`;
            let format = "mp3";
            try {
              const { ext } = await getAudioFormatFromNetwork(url);
              format = ext;
            } catch (error) {
              console.error("获取音频格式失败:", error);
            }
            musicInfo = {
              ...musicInfo,
              title,
              artist,
              album,
              cover,
              url,
              lrc,
              format,
            };
            return musicInfo;
          }
        }
      } catch (error) {
        console.error("解析script内容失败:", error);
      }
    }
  }
  if (!musicInfo) {
    throw new Error("未找到音乐信息");
  }

  return musicInfo;
};

/** 清理文件名 */
export const sanitizeFileName = (fileName: string) => fileName.replace(/[\\/:*?"<>|]/g, "_");

export type AudioFileFormat = {
  /** 文件扩展名，不包含点，例如 mp3、m4a */
  ext: string;
  /** Blob 或解析结果中的 MIME 类型 */
  mimeType: string;
  /** music-metadata 识别出的容器类型 */
  container?: string;
  /** music-metadata 识别出的编码类型 */
  codec?: string;
};

const getExtensionByMimeType = (mimeType?: string) => {
  const normalizedMimeType = mimeType?.toLowerCase() || "";

  if (normalizedMimeType.includes("mpeg") || normalizedMimeType.includes("mp3")) return "mp3";
  if (normalizedMimeType.includes("mp4") || normalizedMimeType.includes("m4a")) return "m4a";
  if (normalizedMimeType.includes("aac")) return "aac";
  if (normalizedMimeType.includes("flac")) return "flac";
  if (normalizedMimeType.includes("ogg")) return "ogg";
  if (normalizedMimeType.includes("wav")) return "wav";
  if (normalizedMimeType.includes("webm")) return "webm";

  return "";
};

const getExtensionByContainer = (container?: string) => {
  const normalizedContainer = container?.toLowerCase() || "";

  if (normalizedContainer.includes("mpeg")) return "mp3";
  if (normalizedContainer.includes("mp4") || normalizedContainer.includes("m4a")) return "m4a";
  if (normalizedContainer.includes("aac")) return "aac";
  if (normalizedContainer.includes("flac")) return "flac";
  if (normalizedContainer.includes("ogg")) return "ogg";
  if (normalizedContainer.includes("wave") || normalizedContainer.includes("wav")) return "wav";
  if (normalizedContainer.includes("webm")) return "webm";

  return "";
};

/** 获取文件格式 */
export const getFileFormat = async (blob: Blob): Promise<AudioFileFormat> => {
  try {
    const metadata = await parseBlob(blob, { duration: false });
    console.log("metadata", metadata);
    const mimeType =
      blob.type || getMimeTypeByExtension(getExtensionByContainer(metadata.format.container));
    const ext =
      getExtensionByContainer(metadata.format.container) ||
      getExtensionByMimeType(mimeType) ||
      "mp3";

    return {
      ext,
      mimeType,
      container: metadata.format.container,
      codec: metadata.format.codec,
    };
  } catch (error) {
    console.error("解析音频格式失败:", error);
    const ext = getExtensionByMimeType(blob.type) || "mp3";

    return {
      ext,
      mimeType: blob.type || getMimeTypeByExtension(ext),
    };
  }
};

/** 从网络获取音频格式 */
export const getAudioFormatFromNetwork = async (url: string) => {
  const res = await fetch(url, {
    referrerPolicy: "no-referrer",
    mode: "cors",
  });
  if (!res.ok) throw new Error("获取音频格式失败");
  const blob = await res.blob();
  return getFileFormat(blob);
};

const getMimeTypeByExtension = (ext: string) => {
  const mimeTypeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    ogg: "audio/ogg",
    wav: "audio/wav",
    webm: "audio/webm",
  };

  return mimeTypeMap[ext] || "application/octet-stream";
};
