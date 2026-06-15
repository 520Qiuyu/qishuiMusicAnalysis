import type { PlaylistMusicInfo, PlaylistTrack } from "../types/platlist";
import { getQishuiImageUrl, parseRouterData } from ".";

export const getQishuiMusicUrl = (id: string) => {
  return `https://music.douyin.com/qishui/share/track?track_id=${id}`;
};

const formatPlaylistArtists = (artists?: PlaylistTrack["artists"]) => {
  const artistNames = artists?.map(artist => artist.name).filter(Boolean) || [];

  return artistNames.length > 0 ? artistNames.join(" / ") : "未知歌手";
};

/**
 * 将歌单曲目结构转换为页面可复用的音乐信息。
 *
 * @example
 * const musicInfo = formatPlaylistMusicInfo(media.entity?.track);
 */
const formatPlaylistMusicInfo = (track?: PlaylistTrack): PlaylistMusicInfo | null => {
  if (!track) {
    return null;
  }

  return {
    id: track.id,
    title: track.name || "未知歌曲",
    artist: formatPlaylistArtists(track.artists),
    album: track.album?.name || "未知专辑",
    cover: getQishuiImageUrl(track.album?.url_cover) || "https://via.placeholder.com/120",
    duration: track.duration,
    previewDuration: track.preview?.duration,
    collectCount: track.stats?.count_collected,
    commentCount: track.stats?.count_comment,
    shareCount: track.stats?.count_shared,
  };
};

/**
 * 解析歌单信息。
 *
 * @example
 * const playlistInfo = await parsePlaylistInfo(html);
 */
export const parsePlaylistInfo = async (html: string) => {
  if (!html) {
    throw new Error("请传入页面 HTML 内容");
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const scripts = doc.getElementsByTagName("script");

  const routerData = parseRouterData(scripts);
  console.log('routerData',routerData)
  const playlistPage = routerData?.loaderData?.playlist_page;
  if (!playlistPage?.playlistInfo) {
    throw new Error("未找到歌单信息");
  }

  const rawPlaylistInfo = playlistPage.playlistInfo;
  const tracks =
    playlistPage.medias
      ?.map(media => formatPlaylistMusicInfo(media.entity?.track))
      .filter((track): track is PlaylistMusicInfo => Boolean(track)) || [];

  return {
    id: rawPlaylistInfo.id,
    title: rawPlaylistInfo.title || rawPlaylistInfo.public_title || "未知歌单",
    cover: getQishuiImageUrl(rawPlaylistInfo.url_cover) || "https://via.placeholder.com/120",
    owner: rawPlaylistInfo.owner?.nickname || rawPlaylistInfo.owner?.public_name || "未知用户",
    countTracks: rawPlaylistInfo.count_tracks || rawPlaylistInfo.resource_cnt?.track_cnt || tracks.length,
    tracks,
  };
};
