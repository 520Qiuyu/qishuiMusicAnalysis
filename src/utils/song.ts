import { getAudioFormatFromNetwork, parseRouterData } from ".";
import { fetchTrackV2 } from "@/services/server";
import type { MusicInfo } from "../store";
import type { KrcLyrics } from "../types/song";

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

/**
 * 解析音乐信息。
 *
 * @example
 * const musicInfo = await parseMusicInfo(html);
 */
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

  const routerData = parseRouterData(scripts);
  console.log("routerData", routerData);

  const audioWithLyricsOption = routerData?.loaderData?.track_page?.audioWithLyricsOption;
  if (audioWithLyricsOption) {
    const title = audioWithLyricsOption.trackName || "未知歌曲";
    const artist = audioWithLyricsOption.artistName || "未知歌手";
    const album = audioWithLyricsOption.trackInfo?.album?.name || "未知专辑";
    const cover = audioWithLyricsOption.coverURL || "https://via.placeholder.com/120";
    const url = audioWithLyricsOption.url ? encodeURI(decodeURI(audioWithLyricsOption.url)) : "";
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

    // 尝试获取完整版链接
    try {
      const trackId = routerData?.loaderData?.track_page?.track_id;
      if (trackId) {
        const fullInfo = await fetchTrackV2({ track_id: trackId });
        console.log("fullInfo", fullInfo);
        if (fullInfo.url) {
          musicInfo = {
            ...musicInfo,
            ...fullInfo,
          };
        }
      }
    } catch (error) {
      console.error("获取完整版链接失败:", error);
    }

    return musicInfo;
  }

  if (!musicInfo) {
    throw new Error("未找到音乐信息");
  }

  return musicInfo;
};
