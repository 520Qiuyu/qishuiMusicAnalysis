import type { CSSProperties } from "react";
import { useAppStore } from "@/store";
import styles from "./index.module.scss";

const waveHeights = [
  18, 28, 14, 34, 22, 38, 16, 30, 22, 36, 18, 26, 38, 16, 30, 22, 34, 18, 28, 14, 32, 20, 36, 18,
];

const HeroSection = () => {
  const { currentMusic } = useAppStore();

  return (
    <header className={styles["hero"]}>
      <div>
        <div className={styles["eyebrow"]}>
          <i
            className="ri-sparkling-2-line"
            aria-hidden="true"
          />
          汽水音乐链接解析
        </div>
        <h1 className={styles["hero-title"]}>
          粘贴分享链接，快速获取<span>音乐资源</span>。
        </h1>
        <p className={styles["hero-desc"]}>
          支持识别汽水音乐分享内容，解析歌曲信息、封面与播放地址，让试听、下载和历史管理都更清晰顺手
          。
        </p>
      </div>

      <aside
        className={styles["hero-panel"]}
        aria-label="播放预览装饰卡片">
        <div className={styles["floating-card"]}>
          <div className={styles["mini-cover-row"]}>
            {currentMusic?.cover ? (
              <img
                className={styles["mini-cover"]}
                src={currentMusic.cover}
                alt={`${currentMusic.title || "音乐"}封面`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={styles["mini-cover"]}
                aria-hidden="true"
              />
            )}
            <div>
              <p className={styles["mini-title"]}>{currentMusic?.title}</p>
              <p className={styles["mini-meta"]}>
                {currentMusic?.artist} / {currentMusic?.album} · 解析完成
              </p>
            </div>
          </div>
          <div
            className={styles["wave"]}
            aria-hidden="true">
            {waveHeights.map((height, index) => (
              <span
                key={`${height}-${index}`}
                style={{ "--height": `${height}px` } as CSSProperties}
              />
            ))}
          </div>
          <i
            className={`ri-music-2-line ${styles["hero-panel__watermark"]}`}
            aria-hidden="true"
          />
        </div>
      </aside>
    </header>
  );
};

export default HeroSection;
