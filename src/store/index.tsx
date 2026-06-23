import { useLocalStorageState } from "ahooks";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

export type MusicInfo = {
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  url?: string;
  format?: string;
  lrc?: string;
  lrcContent?: string;
  playAuth?: string;
  playAuthID?: string;
};

export type DownloadTaskStatus = "pending" | "downloading" | "completed" | "error";

export type DownloadTask = {
  id: string;
  musicInfo: MusicInfo;
  name: string;
  size: string;
  progress: number;
  status: DownloadTaskStatus;
  errorMessage?: string;
  createdAt: number;
};

type AppStoreState = {
  /** 当前解析\播放音乐 */
  currentMusic: MusicInfo | null;
  /** 解析中 */
  parsing: boolean;
  /** 历史记录 */
  history: MusicInfo[];
  /** 下载队列 */
  downloadQueue: DownloadTask[];
  /** 音乐播放实例 */
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

type AppStoreContextValue = AppStoreState & {
  setCurrentMusic: (musicInfo: MusicInfo | null) => void;
  setParsing: (parsing: boolean) => void;
  resetMusic: () => void;
  addToHistory: (musicInfo: MusicInfo) => void;
  addToDownloadQueue: (task: DownloadTask) => void;
  updateDownloadTask: (taskId: string, task: Partial<DownloadTask>) => void;
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);
const HISTORY_STORAGE_KEY = "qishui_music_history";
const DOWNLOAD_QUEUE_STORAGE_KEY = "qishui_music_download_queue";

const normalizeDownloadQueue = (downloadQueue: DownloadTask[]) =>
  downloadQueue.map(task => {
    if (task.status === "pending" || task.status === "downloading") {
      return {
        ...task,
        status: "error" as const,
        errorMessage: "页面刷新后下载已中断，请重新下载",
      };
    }

    return task;
  });

export const StoreProvider = ({ children }: PropsWithChildren) => {
  // 当前播放\解析音乐
  const [currentMusic, setCurrentMusic] = useState<MusicInfo | null>(null);
  // 解析中
  const [parsing, setParsing] = useState(false);
  // 历史记录
  const [history = [], setHistory] = useLocalStorageState<MusicInfo[]>(HISTORY_STORAGE_KEY, {
    defaultValue: [],
  });
  // 下载队列
  const [downloadQueue = [], setDownloadQueue] = useLocalStorageState<DownloadTask[]>(
    DOWNLOAD_QUEUE_STORAGE_KEY,
    {
      defaultValue: [],
      serializer: value => JSON.stringify(value),
      deserializer: value => normalizeDownloadQueue(JSON.parse(value) as DownloadTask[]),
    }
  );
  // 音乐播放实例
  const audioRef = useRef<HTMLAudioElement>(null);

  const resetMusic = useCallback(() => {
    setCurrentMusic(null);
    setHistory([]);
    setDownloadQueue([]);
  }, [setDownloadQueue, setHistory]);

  const addToHistory = useCallback(
    (musicInfo: MusicInfo) => {
      setHistory(prevHistory => [musicInfo, ...(prevHistory || [])].slice(0, 50));
    },
    [setHistory]
  );

  const addToDownloadQueue = useCallback(
    (task: DownloadTask) => {
      setDownloadQueue(prevQueue => [task, ...(prevQueue || [])]);
    },
    [setDownloadQueue]
  );

  const updateDownloadTask = useCallback(
    (taskId: string, task: Partial<DownloadTask>) => {
      setDownloadQueue(prevQueue =>
        (prevQueue || []).map(downloadTask =>
          downloadTask.id === taskId ? { ...downloadTask, ...task } : downloadTask
        )
      );
    },
    [setDownloadQueue]
  );

  return (
    <AppStoreContext.Provider
      value={{
        currentMusic,
        parsing,
        history,
        downloadQueue,
        audioRef,
        setCurrentMusic,
        setParsing,
        resetMusic,
        addToHistory,
        addToDownloadQueue,
        updateDownloadTask,
      }}>
      {children}
    </AppStoreContext.Provider>
  );
};

/**
 * 获取全局应用状态。
 *
 * @example
 * const { currentMusic, setCurrentMusic } = useAppStore();
 */
export const useAppStore = () => {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error("useAppStore must be used within StoreProvider");
  }

  return context;
};
