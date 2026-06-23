import { useAppStore } from "@/store";
import { downloadTextFile, getFileBlob } from "@/utils/download";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import styles from "./index.module.scss";
import { SodaAudioDecryptor } from "@/utils/sodaDecryptor";

type MusicResultCardProps = {
  onDownload: () => void;
};

const MusicResultCard = ({ onDownload }: MusicResultCardProps) => {
  const { currentMusic, parsing, audioRef } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const isBuffering = loading || buffering;

  // 缓冲歌曲
  const loadSong = async () => {
    try {
      if (!currentMusic?.url) return;
      setLoading(true);
      let blob = await getFileBlob(currentMusic.url);
      if (currentMusic.playAuth) {
        const { blob: decryptedBlob } = await SodaAudioDecryptor.decryptBlob(
          blob,
          currentMusic.playAuth
        );
        blob = decryptedBlob;
      }
      const blobUrl = URL.createObjectURL(blob);
      audioRef.current!.src = blobUrl;
      audioRef.current!.load();
      return blobUrl;
    } catch (error) {
      console.error("音频加载失败:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSong();
  }, [currentMusic?.url]);

  /** 播放进度百分比 */
  const progressPercent = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  // 播放或暂停
  const handleTogglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !currentMusic?.url) {
      return;
    }

    if (audio.paused) {
      try {
        setBuffering(true);
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("播放失败:", error);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  // 加载元数据
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setDuration(audio.duration || 0);
    setBuffering(false);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime || 0);
  };

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }

    const nextTime = (Number(event.target.value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setBuffering(false);
  };

  const handleBufferingStart = () => {
    setBuffering(true);
  };

  const handleBufferingEnd = () => {
    setBuffering(false);
  };

  const handleDownloadTxtLyric = () => {
    if (!currentMusic?.lrcContent) {
      return;
    }
    const { title, artist } = currentMusic;
    downloadTextFile(currentMusic.lrcContent, `${title || "歌词"} - ${artist || "未知歌手"}.txt`);
  };

  const handleDownloadLrcLyric = () => {
    if (!currentMusic?.lrc) {
      return;
    }
    const { title, artist } = currentMusic;
    downloadTextFile(currentMusic.lrc, `${title || "歌词"} - ${artist || "未知歌手"}.lrc`);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffering(false);
  }, [currentMusic?.url]);

  return (
    <section
      className={`${styles["card"]} ${styles["music-card"]}`}
      aria-label="音乐解析结果">
      <div className={styles["cover-wrap"]}>
        <div
          className={styles["cover"]}
          aria-label="歌曲封面占位图">
          {currentMusic?.cover ? (
            <img
              src={currentMusic.cover}
              alt={`${currentMusic.title || "音乐"}封面`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <i
              className="ri-music-2-fill"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      <div>
        <div className={styles["song-kicker"]}>
          <span
            className={styles["status-dot"]}
            aria-hidden="true"
          />
          {parsing ? "解析中" : "解析完成"}
        </div>
        <h2 className={styles["song-title"]}>{currentMusic?.title}</h2>
        <p className={styles["song-meta"]}>
          <span>{currentMusic?.artist}</span>
          <span>{currentMusic?.album}</span>
          <span>{currentMusic?.format} · 320kbps</span>
        </p>
        <div
          className={styles["player"]}
          aria-label="音乐播放器">
          <audio
            ref={audioRef}
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onWaiting={handleBufferingStart}
            onStalled={handleBufferingStart}
            onSeeking={handleBufferingStart}
            onCanPlay={handleBufferingEnd}
            onPlaying={handleBufferingEnd}
          />
          <button
            className={styles["icon-button"]}
            type="button"
            aria-label={isPlaying ? "暂停播放" : "播放音乐"}
            disabled={!currentMusic?.url || loading}
            onClick={handleTogglePlay}>
            <i
              className={
                isBuffering ? "ri-loader-4-line" : isPlaying ? "ri-pause-line" : "ri-play-fill"
              }
              aria-hidden="true"
            />
          </button>
          <div
            className={styles["progress"]}
            aria-label="播放进度">
            <div
              className={styles["progress-fill"]}
              style={{ width: `${progressPercent}%` }}
            />
            <input
              className={styles["progress-input"]}
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent}
              aria-label="调整播放进度"
              disabled={!duration}
              onChange={handleProgressChange}
            />
          </div>
          {isBuffering && <span className={styles["buffering-text"]}>缓冲中...</span>}
          <span className={styles["time"]}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
      <div className={styles["download-actions"]}>
        <button
          className={styles["download-button"]}
          type="button"
          aria-label="下载当前歌曲"
          onClick={onDownload}>
          <i
            className="ri-download-2-line"
            aria-hidden="true"
          />
          下载
        </button>
        <button
          className={`${styles["download-button"]} ${styles["is-secondary"]}`}
          type="button"
          aria-label="下载 TXT 歌词"
          disabled={!currentMusic?.lrcContent}
          onClick={handleDownloadTxtLyric}>
          <i
            className="ri-file-text-line"
            aria-hidden="true"
          />
          TXT
        </button>
        <button
          className={`${styles["download-button"]} ${styles["is-secondary"]}`}
          type="button"
          aria-label="下载 LRC 歌词"
          disabled={!currentMusic?.lrc}
          onClick={handleDownloadLrcLyric}>
          <i
            className="ri-file-list-3-line"
            aria-hidden="true"
          />
          LRC
        </button>
      </div>
    </section>
  );
};

export default MusicResultCard;

/** 格式化显示时间 */
const formatTime = (time: number) => {
  if (!Number.isFinite(time) || time <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
