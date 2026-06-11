import type { MusicInfo } from "../store";
import { parseLink, parseMusicInfo } from "../utils";
import { get } from "./request";

/**
 *  解析汽水音乐分享链接，从页面 HTML 中提取 _ROUTER_DATA 得到歌曲信息与音频地址
 */
export const parseMusicLink = async (link: string) => {
  // 1、解析出链接
  const url = parseLink(link);
  // 2、请求页面
  const html = await get<string>(url);
  // 3、解析页面
  const musicInfo = parseMusicInfo(html);
  // 4、返回音乐信息
  return musicInfo;
};
