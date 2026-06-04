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
export const parseMusicInfo = (html: string) => {
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
            musicInfo = {
              ...musicInfo,
              title,
              artist,
              album,
              cover,
              url,
              lrc,
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

export const sanitizeFileName = (fileName: string) => fileName.replace(/[\\/:*?"<>|]/g, "_");
