import axios from "axios";

const isProduction = import.meta.env.PROD;
console.log("isProduction", isProduction);

const API_BASE_URL = isProduction ? "http://qiuyu520.fun/qishuiParse/api" : "/api";

const serverRequest = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export type TrackV2Payload = {
  track_id: string;
  media_type?: string;
  queue_type?: string;
  scene_name?: string;
};

export type TrackV2Result = {
  url: string;
  playAuth: string;
  playAuthID: string;
  isEncrypted: boolean;
};

type TrackV2Response = {
  ok: boolean;
  data?: TrackV2Result;
  message?: string;
};

/**
 * 通过本地服务端获取汽水音乐完整版音频信息。
 *
 * @example
 * const result = await fetchTrackV2({ track_id: "7497192086862071809" });
 */
export const fetchTrackV2 = async (payload: TrackV2Payload) => {
  const response = await serverRequest.post<TrackV2Response>("/track/v2", payload);

  if (!response.data?.ok || !response.data.data) {
    throw new Error(response.data?.message || "获取完整版音频失败");
  }

  return response.data.data;
};
