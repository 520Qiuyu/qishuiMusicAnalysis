import { parseBlob } from "music-metadata";

import type { RouterData } from "../types";
import type { QishuiImage } from "../types/platlist";
import type { AudioFileFormat } from "../types/song";

/** 解析链接 */
export const parseLink = (link: string) => {
  const url = link.match(/https:\/\/[^\s]+/) ?? "";
  if (!url) {
    throw new Error("Invalid link");
  }
  return url[0];
};

/**
 * 从页面脚本中提取汽水音乐注入的路由数据。
 *
 * @example
 * const routerData = parseRouterData(doc.getElementsByTagName("script"));
 */
export const parseRouterData = (scripts: HTMLCollectionOf<HTMLScriptElement>) => {
  for (const script of scripts) {
    const content = script.textContent || script.innerText;
    if (!content.includes("_ROUTER_DATA")) {
      continue;
    }

    try {
      const match = content.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
      if (!match?.[1]) {
        continue;
      }

      return JSON.parse(match[1]) as RouterData;
    } catch (error) {
      console.error("解析script内容失败:", error);
    }
  }

  return null;
};

/**
 * 拼接汽水音乐图片资源地址。
 *
 * @example
 * const cover = getQishuiImageUrl(track.album?.url_cover);
 */
export const getQishuiImageUrl = (image?: QishuiImage | null) => {
  const imageBaseUrl = image?.urls?.find(Boolean) || "";
  if (!imageBaseUrl) {
    return "";
  }

  if (!image?.uri) {
    return imageBaseUrl;
  }

  return `${imageBaseUrl}${imageBaseUrl.endsWith("/") ? "" : "/"}${image.uri}~${image.template_prefix}-crop-center:720:720.jpg`;
};

/** 清理文件名 */
export const sanitizeFileName = (fileName: string) => fileName.replace(/[\\/:*?"<>|]/g, "_");

export type PromiseLimitTask<T> = () => Promise<T> | T;

export type PromiseLimitOptions = {
  /** 每个任务完成后等待的毫秒数 */
  wait?: number;
};

/**
 * 等待指定毫秒数。
 *
 * @example
 * await sleep(300);
 */
export const sleep = (time: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, Math.max(0, time));
  });

/**
 * 并发执行任务数组，并限制同一时间运行的最大数量。
 *
 * @example
 * const results = await promiseLimit([
 *   () => fetch("/api/1"),
 *   () => fetch("/api/2"),
 *   () => fetch("/api/3"),
 * ], 2, { wait: 300 });
 */
export const promiseLimit = async <T>(
  promiseArray: PromiseLimitTask<T>[],
  limit = 6,
  options: PromiseLimitOptions = {}
) => {
  const { wait = 0 } = options;

  if (!Array.isArray(promiseArray)) {
    throw new Error("第一个参数必须是数组");
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("并发限制必须是正整数");
  }

  if (promiseArray.length === 0) {
    return [];
  }

  const results: unknown[] = new Array(promiseArray.length);
  let currentIndex = 0;

  const runTask = async () => {
    while (currentIndex < promiseArray.length) {
      const taskIndex = currentIndex;
      currentIndex += 1;

      try {
        const task = promiseArray[taskIndex];
        if (typeof task !== "function") {
          throw new Error(`数组中索引为 ${taskIndex} 的元素不是函数`);
        }

        results[taskIndex] = await task();
      } catch (error) {
        results[taskIndex] = error;
      }

      if (wait > 0 && currentIndex < promiseArray.length) {
        await sleep(wait);
      }
    }
  };

  const tasksToStart = Math.min(limit, promiseArray.length);
  await Promise.all(Array.from({ length: tasksToStart }, () => runTask()));

  return results as Array<T | unknown>;
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
