import type { PlaylistPageData } from "./platlist";
import type { TrackPageData } from "./song";

export type RouterData = {
  loaderData?: {
    track_page?: TrackPageData;
    playlist_page?: PlaylistPageData;
  };
};

export type * from "./song";
export type * from "./platlist";
