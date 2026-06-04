import { useAppStore } from "../../store";
import styles from "./index.module.scss";

const statusText = {
  pending: "等待中",
  downloading: "下载中",
  completed: "已完成",
  error: "下载失败",
};

const DownloadPanels = () => {
  const { downloadQueue, history } = useAppStore();

  return (
    <aside className={styles['side-stack']}>
      <section className={`${styles['card']} ${styles['panel']}`} aria-label="下载管理">
        <div className={styles['section-head']}>
          <div>
            <h2 className={styles['section-title']}>下载管理</h2>
            <p className={styles['section-subtitle']}>实时查看队列与进度</p>
          </div>
          <span className={styles['status-dot']} aria-hidden="true" />
        </div>
        <div className={styles['download-list']}>
          {downloadQueue.length > 0 ? (
            downloadQueue.map(task => (
              <article className={styles['task-item']} key={task.id}>
                <div className={styles['task-main']}>
                  <div>
                    <div className={styles['task-name']}>{task.name}</div>
                    <div className={styles['task-meta']}>
                      {task.size} · {statusText[task.status]} {task.progress}%
                    </div>
                    {task.errorMessage && <div className={styles['task-error']}>{task.errorMessage}</div>}
                  </div>
                  <div className={styles['task-actions']}>
                    <span className={`${styles['task-status']} ${styles[`is-${task.status}`]}`}>
                      {statusText[task.status]}
                    </span>
                  </div>
                </div>
                <div className={styles['progress']} aria-hidden="true">
                  <div className={styles['progress-fill']} style={{ width: `${task.progress}%` }} />
                </div>
              </article>
            ))
          ) : (
            <div className={styles['empty-state']}>暂无下载任务</div>
          )}
        </div>
      </section>

      <section className={`${styles['card']} ${styles['panel']}`} aria-label="下载历史">
        <div className={styles['section-head']}>
          <div>
            <h2 className={styles['section-title']}>下载历史</h2>
            <p className={styles['section-subtitle']}>最多保留最近 50 条</p>
          </div>
        </div>
        <div className={styles['history-list']}>
          {history.length > 0 ? (
            history.map((musicInfo, index) => (
              <article className={styles['history-item']} key={`${musicInfo.title}-${musicInfo.artist}-${index}`}>
                <div>
                  <div className={styles['history-name']}>
                    {musicInfo.title || "未知歌曲"} - {musicInfo.artist || "未知歌手"}
                  </div>
                  <div className={styles['history-meta']}>已保存</div>
                </div>
                <i className="ri-check-line" aria-hidden="true" />
              </article>
            ))
          ) : (
            <div className={styles['empty-state']}>暂无下载历史</div>
          )}
        </div>
      </section>
    </aside>
  );
};

export default DownloadPanels;
