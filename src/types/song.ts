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

export type AudioWithLyricsOption = {
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

export type TrackPageData = {
  track_id?: string;
  audioWithLyricsOption?: AudioWithLyricsOption;
};

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
