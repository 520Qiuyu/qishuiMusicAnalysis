import styles from "./index.module.scss";

const featureList = [
  {
    icon: "ri-list-check-3",
    title: "批量解析队列",
    description: "后续可将多条分享链接加入队列，用 Ant Design Table 展示状态。",
  },
  {
    icon: "ri-folder-music-line",
    title: "音乐资料管理",
    description: "支持封面、歌手、专辑、音质等元信息查看与收藏。",
  },
  {
    icon: "ri-settings-3-line",
    title: "下载偏好设置",
    description: "预留格式、音质、命名规则等配置入口，便于功能扩展。",
  },
];

const FeatureSection = () => (
  <section className={styles['feature-row']} aria-label="后续功能扩展方向">
    {featureList.map(feature => (
      <article className={styles['feature-card']} key={feature.title}>
        <i className={`${feature.icon} ${styles['feature-icon']}`} aria-hidden="true" />
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </article>
    ))}
  </section>
);

export default FeatureSection;
