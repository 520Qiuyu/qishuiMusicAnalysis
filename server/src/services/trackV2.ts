import { env } from "../config/env";

export type TrackV2Query = Record<string, string>;
export type TrackV2Data = Record<string, unknown>;

export type TrackV2Result = {
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  url?: string;
  format?: string;
  lrc?: string;
  lrcContent?: string;
  playAuth?: string;
  playAuthID?: string;
};

export type QishuiImage = {
  uri?: string;
  urls?: string[];
  template_prefix?: string;
};

const USER_AGENT = "LunaPC/3.4.0(388267242)";

const defaultQuery: Record<string, string> = {
  aid: "386088",
  app_name: "luna_pc",
  region: "cn",
  geo_region: "cn",
  os_region: "cn",
  sim_region: "",
  device_id: env.deviceId,
  cdid: "",
  iid: "3717874987061322",
  version_name: "3.4.0",
  version_code: "30040000",
  channel: "ug",
  build_mode: "master",
  network_carrier: "",
  ac: "wifi",
  tz_name: "Asia/Shanghai",
  resolution: "",
  device_platform: "windows",
  device_type: "Windows",
  os_version: "Windows 11 Pro",
  fp: env.deviceId,
};

const defaultData = {
  media_type: "track",
  queue_type: "favorite_track_playlist",
  scene_name: "undefined",
};

const getQishuiHeaders = () => ({
  "User-Agent": USER_AGENT,
  "Content-Type": "application/json; charset=utf-8",
  "x-helios": env.xHelios,
  "x-medusa": env.xMedusa,
  Cookie: env.cookie,
});

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

/**
 * 请求汽水音乐 track_v2 接口并解析完整版音频信息。
 *
 * @example
 * const result = await fetchTrackV2({}, { track_id: "7497192086862071809" });
 */
export const fetchTrackV2 = async (
  query: TrackV2Query = {},
  data: TrackV2Data = {}
): Promise<TrackV2Result> => {
  const trackUrl = `https://api.qishui.com/luna/pc/track_v2?${new URLSearchParams({
    ...defaultQuery,
    ...query,
  }).toString()}`;

  const trackResponse = await fetch(trackUrl, {
    method: "POST",
    headers: getQishuiHeaders(),
    body: JSON.stringify({ ...defaultData, ...data }),
  });

  if (!trackResponse.ok) {
    throw new Error(`track_v2 请求失败: ${trackResponse.status}`);
  }

  const trackData = await trackResponse.json();
  console.log("trackData", trackData);
  const musicInfo: TrackV2Result = {
    title: trackData?.track?.name,
    artist: trackData?.track?.artists[0]?.name,
    album: trackData?.track?.album?.name,
    cover: getQishuiImageUrl(trackData?.track?.album?.url_cover),
  };
  const urlPlayerInfo = trackData?.track_player?.url_player_info;

  if (!urlPlayerInfo) {
    throw new Error("未解析音频信息");
  }

  const playInfoResponse = await fetch(urlPlayerInfo, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!playInfoResponse.ok) {
    throw new Error(`播放信息请求失败: ${playInfoResponse.status}`);
  }

  const playInfoData = await playInfoResponse.json();
  const audioList = playInfoData?.Result?.Data?.PlayInfoList;

  if (!audioList?.length) {
    throw new Error("未找到音频信息");
  }

  const audio = audioList[0];
  const audioUrl = audio.MainPlayUrl || audio.BackupPlayUrl;
  const playAuth = audio.PlayAuth;
  const playAuthID = audio.PlayAuthID;

  if (!audioUrl) {
    throw new Error("未找到音频地址");
  }

  return {
    ...musicInfo,
    url: audioUrl,
    playAuth,
    playAuthID,
  };
};
