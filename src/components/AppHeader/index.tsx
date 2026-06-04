import styles from "./index.module.scss";

type AppHeaderProps = {
  onBatchParse: () => void;
};

const AppHeader = ({ onBatchParse }: AppHeaderProps) => (
  <nav className={styles['topbar']} aria-label="页面导航">
    <div className={styles['brand']}>
      <span className={styles['brand-mark']} aria-hidden="true">
        <i className="ri-music-2-line" />
      </span>
      <span className={styles['brand-title']}>汽水音乐解析下载工具</span>
    </div>
    <div className={styles['topbar-actions']}>
      <button className={styles['pill-button']} type="button" aria-label="查看下载历史">
        <i className="ri-history-line" />
        历史
      </button>
      <button
        className={`${styles['pill-button']} ${styles['is-primary']}`}
        type="button"
        aria-label="批量解析音乐链接"
        onClick={onBatchParse}
      >
        <i className="ri-list-check-3" />
        批量解析
      </button>
    </div>
  </nav>
);

export default AppHeader;
