import { ConfigProvider, message } from "antd";
import { useRef } from "react";
import styles from "./App.module.scss";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import DownloadPanels from "./components/DownloadPanels";
import FeatureSection from "./components/FeatureSection";
import HeroSection from "./components/HeroSection/index";
import MusicResultCard from "./components/MusicResultCard";
import ParseSection from "./components/ParseSection";
import PlaylistParseModal, {
  type PlaylistParseModalRef,
  type PlaylistParseValues,
} from "./components/PlaylistParseModal";
import { parseMusicLink, parsePlaylistLink } from "./services/api";
import { StoreProvider, useAppStore, type DownloadTask, type MusicInfo } from "./store";
import { getFileFormat } from "./utils";
import { downloadBlob, downloadEncryptedAudio } from "./utils/download";

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) {
    return "未知大小";
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const createDownloadTask = (musicInfo: MusicInfo): DownloadTask => {
  const title = musicInfo.title || "未知歌曲";
  const artist = musicInfo.artist || "未知歌手";

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    musicInfo,
    name: `${title} - ${artist}`,
    size: "未知大小",
    progress: 0,
    status: "pending",
    createdAt: Date.now(),
  };
};

const AppContent = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const playlistParseModalRef = useRef<PlaylistParseModalRef>(null);
  const {
    currentMusic,
    parsing,
    setCurrentMusic,
    setParsing,
    addToDownloadQueue,
    updateDownloadTask,
    addToHistory,
  } = useAppStore();

  /** 解析音乐链接 */
  const handleParse = async ({ musicLink }: { musicLink: string }) => {
    try {
      setParsing(true);
      const musicInfo = (await parseMusicLink(musicLink)) as MusicInfo;
      setCurrentMusic(musicInfo);
      console.log("musicInfo", musicInfo);
      addToHistory(musicInfo);
      messageApi.success("解析完成，已更新音乐信息");
    } catch (error) {
      console.log("error", error);
      messageApi.error(error instanceof Error ? error.message : "解析失败，请稍后重试");
    } finally {
      setParsing(false);
    }
  };

  const handleDownload = async () => {
    if (!currentMusic?.url) {
      messageApi.warning("请先解析音乐链接");
      return;
    }

    const task = createDownloadTask(currentMusic);
    addToDownloadQueue(task);
    messageApi.info("已加入下载队列");

    try {
      updateDownloadTask(task.id, { status: "downloading" });

      const response = await fetch(currentMusic.url, {
        referrerPolicy: "no-referrer",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("下载失败，请稍后重试");
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      updateDownloadTask(task.id, { size: formatFileSize(contentLength) });

      // 如果 response.body 不存在，就不能用后面的 response.body.getReader() 去边下载边更新进度，只能退回到一次性 response.blob() 下载完整文件。
      if (!response.body) {
        const blob = await response.blob();
        const { ext } = await getFileFormat(blob);
        debugger;
        if (currentMusic.playAuth) {
          downloadEncryptedAudio(blob, currentMusic.playAuth, `${task.name}.${ext}`);
        } else {
          downloadBlob(blob, `${task.name}.${ext}`);
        }

        updateDownloadTask(task.id, {
          progress: 100,
          size: formatFileSize(blob.size),
          status: "completed",
        });
        messageApi.success("下载完成");
        return;
      }

      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        const chunk = new Uint8Array(value.byteLength);
        chunk.set(value);
        chunks.push(chunk.buffer);
        receivedLength += value.length;

        if (contentLength) {
          updateDownloadTask(task.id, {
            progress: Number(((receivedLength / contentLength) * 100).toFixed(2)),
          });
        }
      }

      const contentType = response.headers.get("content-type") || "audio/mpeg";
      const blob = new Blob(chunks, { type: contentType });
      const { ext } = await getFileFormat(blob);
      debugger;
      if (currentMusic.playAuth) {
        downloadEncryptedAudio(blob, currentMusic.playAuth, `${task.name}.${ext}`);
      } else {
        downloadBlob(blob, `${task.name}.${ext}`);
      }

      updateDownloadTask(task.id, {
        progress: 100,
        size: formatFileSize(contentLength || blob.size),
        status: "completed",
      });
      messageApi.success("下载完成");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "下载失败，请稍后重试";
      updateDownloadTask(task.id, {
        status: "error",
        errorMessage,
      });
      messageApi.error(errorMessage);
    }
  };

  const handleOpenPlaylistModal = () => {
    playlistParseModalRef.current?.open();
  };

  const handleParsePlaylist = async ({ playlistLink }: PlaylistParseValues) => {
    try {
      const playlistInfo = await parsePlaylistLink(playlistLink);
      console.log("playlistInfo", playlistInfo);
      messageApi.success(`歌单解析完成：${playlistInfo.title}，共 ${playlistInfo.countTracks} 首`);
      return playlistInfo;
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "歌单解析失败，请稍后重试");
      throw error;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0071e3",
          borderRadius: 16,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        },
      }}>
      {contextHolder}
      <div className={styles["page-shell"]}>
        <AppHeader onBatchParse={handleOpenPlaylistModal} />

        <HeroSection />

        <main className={styles["app-grid"]}>
          <ParseSection
            loading={parsing}
            onParse={handleParse}
          />

          <div className={styles["content-grid"]}>
            {currentMusic && <MusicResultCard onDownload={handleDownload} />}
            <DownloadPanels />
          </div>

          <FeatureSection />
        </main>

        <AppFooter />
      </div>

      {/* 歌单解析弹窗 */}
      <PlaylistParseModal
        ref={playlistParseModalRef}
        onParse={handleParsePlaylist}
      />
    </ConfigProvider>
  );
};

const App = () => (
  <StoreProvider>
    <AppContent />
  </StoreProvider>
);

export default App;
