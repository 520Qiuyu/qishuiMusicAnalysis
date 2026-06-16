import type { MusicInfo } from "../store";

export type QishuiImage = {
  uri?: string;
  urls?: string[];
  template_prefix?: string;
};

export type PlaylistTrackArtist = {
  name?: string;
};

export type PlaylistTrack = {
  id?: string;
  album?: {
    name?: string;
    url_cover?: QishuiImage;
  };
  artists?: PlaylistTrackArtist[];
  duration?: number; // 歌曲总时长
  preview?: {
    duration?: number; // 歌曲预览时长
  };
  limited_free_info?: Record<string, unknown> | null;
  name?: string;
  stats?: {
    count_collected?: number;
    count_comment?: number;
    count_shared?: number;
  };
};

export type PlaylistMedia = {
  id?: string;
  entity?: {
    track?: PlaylistTrack;
  };
};

export type RawPlaylistInfo = {
  id?: string;
  title?: string;
  public_title?: string;
  url_cover?: QishuiImage;
  count_tracks?: number;
  resource_cnt?: {
    track_cnt?: number;
  };
  owner?: {
    nickname?: string;
    public_name?: string;
  };
};

export type PlaylistPageData = {
  medias?: PlaylistMedia[];
  playlistInfo?: RawPlaylistInfo;
};

export type PlaylistMusicInfo = MusicInfo & {
  id?: string;
  duration?: number;
  previewDuration?: number;
  isPreviewOnly?: boolean;
  collectCount?: number;
  commentCount?: number;
  shareCount?: number;
};

export type PlaylistInfo = {
  id?: string;
  title: string;
  cover: string;
  owner: string;
  countTracks: number;
  tracks: PlaylistMusicInfo[];
};
