import { parseMusicInfo } from "@/utils/song";
import { Button, Form, Input, message, Modal } from "antd";
import { forwardRef, useState } from "react";
import { useVisible } from "../../hooks/useVisible";
import { get } from "../../services/request";
import type { MusicInfo } from "../../store";
import type { PlaylistInfo, PlaylistMusicInfo } from "../../types/platlist";
import { getFileFormat, promiseLimit } from "../../utils";
import { downloadBlob, downloadTextFile, getFileBlob } from "../../utils/download";
import { getQishuiMusicUrl } from "../../utils/platlist";
import styles from "./index.module.scss";
import { useLocalStorageState } from "ahooks";

export type PlaylistParseValues = {
  playlistLink: string;
};

export type PlaylistParseModalRef = {
  open: () => void;
  close: () => void;
};

type PlaylistParseModalProps = {
  onParse: (values: PlaylistParseValues) => Promise<PlaylistInfo>;
};

type BatchAction = "parseAll" | "downloadAll" | "downloadAllLrc" | "downloadAllTxt";
type SongAction = "parse" | "download" | "downloadLrc" | "downloadTxt";

const defaultValues: PlaylistParseValues = {
  playlistLink: "歌单｜我喜欢 https://qishui.douyin.com/s/iQgxdHx2/ @汽水音乐",
};

const formatDuration = (duration?: number) => {
  if (!Number.isFinite(duration) || !duration) {
    return "--:--";
  }

  const durationSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getTrackKey = (track: PlaylistMusicInfo, index: number) =>
  `${track.id || track.title || "track"}-${index}`;

const getSongActionKey = (track: PlaylistMusicInfo, index: number, action: SongAction) =>
  `${getTrackKey(track, index)}-${action}`;

const PlaylistParseModal = forwardRef<PlaylistParseModalRef, PlaylistParseModalProps>(
  ({ onParse }, ref) => {
    const [form] = Form.useForm<PlaylistParseValues>();
    const [initValues] = useLocalStorageState<PlaylistParseValues>("playlist-parse-modal-values", {
      defaultValue: defaultValues,
    });
    const [parsing, setParsing] = useState(false);
    const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
    const [parsedMusicInfoMap, setParsedMusicInfoMap] = useState<Record<string, MusicInfo | null>>(
      {}
    );
    const [batchLoading, setBatchLoading] = useState<BatchAction | null>(null);
    const [songActionLoadingIds, setSongActionLoadingIds] = useState<string[]>([]);
    const parsedCount =
      playlistInfo?.tracks.filter((track, index) => parsedMusicInfoMap[getTrackKey(track, index)])
        .length || 0;
    const playlistModal = useVisible(
      {
        onReset: () => {
          form.resetFields();
          setPlaylistInfo(null);
          setParsedMusicInfoMap({});
          setBatchLoading(null);
          setSongActionLoadingIds([]);
        },
      },
      ref
    );

    const handleParsePlaylist = async () => {
      try {
        const values = await form.validateFields();
        setParsing(true);
        const nextPlaylistInfo = await onParse(values);
        setPlaylistInfo(nextPlaylistInfo);
        setParsedMusicInfoMap({});
      } catch (error) {
        console.error("解析歌单失败:", error);
      } finally {
        setParsing(false);
      }
    };

    const handleBatchAction = async (action: BatchAction, task: () => Promise<void> | void) => {
      try {
        setBatchLoading(action);
        await task();
      } catch (error) {
        console.error("批量操作失败:", error);
        message.error(error instanceof Error ? error.message : "批量操作失败，请稍后重试");
      } finally {
        setBatchLoading(null);
      }
    };

    const getPlaylistTasks = (task: (track: PlaylistMusicInfo, index: number) => Promise<void>) => {
      if (!playlistInfo?.tracks.length) {
        throw new Error("暂无歌曲数据，请先解析歌单");
      }

      return playlistInfo.tracks.map((track, index) => () => task(track, index));
    };

    const getFailedTaskCount = (results: unknown[]) =>
      results.filter(result => result instanceof Error).length;

    const handleParseAll = async () => {
      await handleBatchAction("parseAll", async () => {
        const results = await promiseLimit(getPlaylistTasks(handleParseSong), 4, { wait: 200 });
        const failedCount = getFailedTaskCount(results);
        if (failedCount > 0) {
          message.warning(`解析完成，${failedCount} 首失败`);
          return;
        }
        message.success("全部解析任务已完成");
      });
    };

    const handleDownloadAll = async () => {
      await handleBatchAction("downloadAll", async () => {
        const results = await promiseLimit(getPlaylistTasks(handleDownloadSong), 4, { wait: 200 });
        const failedCount = getFailedTaskCount(results);
        if (failedCount > 0) {
          message.warning(`下载完成，${failedCount} 首失败`);
          return;
        }
        message.success("全部下载任务已完成");
      });
    };

    const handleDownloadAllLrc = async () => {
      await handleBatchAction("downloadAllLrc", async () => {
        const results = await promiseLimit(getPlaylistTasks(handleDownloadSongLrc), 4, {
          wait: 200,
        });
        const failedCount = getFailedTaskCount(results);
        if (failedCount > 0) {
          message.warning(`LRC 歌词下载完成，${failedCount} 首失败`);
          return;
        }
        message.success("全部 LRC 歌词下载任务已完成");
      });
    };

    const handleDownloadAllTxt = async () => {
      await handleBatchAction("downloadAllTxt", async () => {
        const results = await promiseLimit(getPlaylistTasks(handleDownloadSongTxt), 4, {
          wait: 200,
        });
        const failedCount = getFailedTaskCount(results);
        if (failedCount > 0) {
          message.warning(`TXT 歌词下载完成，${failedCount} 首失败`);
          return;
        }
        message.success("全部 TXT 歌词下载任务已完成");
      });
    };

    const handleSongAction = async (
      track: PlaylistMusicInfo,
      index: number,
      action: SongAction,
      task: () => Promise<void> | void
    ) => {
      const loadingKey = getSongActionKey(track, index, action);
      try {
        setSongActionLoadingIds(prev => (prev.includes(loadingKey) ? prev : [...prev, loadingKey]));
        await task();
      } catch (error) {
        console.error("歌曲操作失败:", error);
        message.error(error instanceof Error ? error.message : "歌曲操作失败，请稍后重试");
      } finally {
        setSongActionLoadingIds(prev => prev.filter(id => id !== loadingKey));
      }
    };

    const getParsedMusicInfo = (track: PlaylistMusicInfo, index: number) => {
      return parsedMusicInfoMap[getTrackKey(track, index)] || null;
    };

    const resolveParsedMusicInfo = async (track: PlaylistMusicInfo, index: number) => {
      const trackKey = getTrackKey(track, index);
      const parsedMusicInfo = getParsedMusicInfo(track, index);
      if (parsedMusicInfo) {
        return parsedMusicInfo;
      }

      if (!track.id) {
        throw new Error("歌曲 ID 不存在");
      }

      const musicUrl = getQishuiMusicUrl(track.id);
      const html = await get<string>(musicUrl);
      const musicInfo = await parseMusicInfo(html);
      setParsedMusicInfoMap(prev => ({ ...prev, [trackKey]: musicInfo || null }));

      return musicInfo;
    };

    const handleParseSong = async (track: PlaylistMusicInfo, index: number) => {
      await handleSongAction(track, index, "parse", async () => {
        const musicInfo = await resolveParsedMusicInfo(track, index);
        console.log("musicInfo", musicInfo);
        message.success(`解析完成：${musicInfo.title || track.title || "未知歌曲"}`);
      });
    };

    const handleDownloadSong = async (track: PlaylistMusicInfo, index: number) => {
      await handleSongAction(track, index, "download", async () => {
        const musicInfo = await resolveParsedMusicInfo(track, index);
        if (!musicInfo.url) {
          throw new Error("音频地址不存在，请重新解析");
        }
        debugger;
        const blob = await getFileBlob(musicInfo.url);
        const { ext } = await getFileFormat(blob);
        const title = musicInfo.title || track.title || "未知歌曲";
        const artist = musicInfo.artist || track.artist || "未知歌手";
        const fileName = `${title} - ${artist}.${ext}`;
        console.log("fileName", fileName);
        downloadBlob(blob, fileName);
        setParsedMusicInfoMap(prev => ({
          ...prev,
          [getTrackKey(track, index)]: {
            ...musicInfo,
            format: ext,
          },
        }));
        message.success(`下载完成：${title}`);
      });
    };

    const handleDownloadSongLrc = async (track: PlaylistMusicInfo, index: number) => {
      await handleSongAction(track, index, "downloadLrc", async () => {
        const musicInfo = await resolveParsedMusicInfo(track, index);
        if (!musicInfo.lrc) {
          throw new Error("暂无 LRC 歌词");
        }

        const title = musicInfo.title || track.title || "歌词";
        const artist = musicInfo.artist || track.artist || "未知歌手";
        downloadTextFile(musicInfo.lrc, `${title} - ${artist}.lrc`);
        message.success(`LRC 歌词下载完成：${title}`);
      });
    };

    const handleDownloadSongTxt = async (track: PlaylistMusicInfo, index: number) => {
      await handleSongAction(track, index, "downloadTxt", async () => {
        const musicInfo = await resolveParsedMusicInfo(track, index);
        if (!musicInfo.lrcContent) {
          throw new Error("暂无 TXT 歌词");
        }

        const title = musicInfo.title || track.title || "歌词";
        const artist = musicInfo.artist || track.artist || "未知歌手";
        downloadTextFile(musicInfo.lrcContent, `${title} - ${artist}.txt`);
        message.success(`TXT 歌词下载完成：${title}`);
      });
    };

    return (
      <Modal
        className={styles["playlist-modal"]}
        title="歌单解析"
        open={playlistModal.visible}
        footer={null}
        centered
        width={860}
        onCancel={playlistModal.close}>
        <p className={styles["modal-description"]}>
          粘贴汽水音乐歌单分享链接，解析后会读取歌单信息。
        </p>
        <Form
          className={styles["playlist-form"]}
          form={form}
          initialValues={initValues}
          onFinish={handleParsePlaylist}>
          <Form.Item
            className={styles["form-item"]}
            name="playlistLink"
            rules={[{ required: true, message: "请输入歌单分享链接" }]}>
            <Input
              className={styles["playlist-input"]}
              prefix={
                <i
                  className="ri-link-m"
                  aria-hidden="true"
                />
              }
              placeholder="粘贴汽水音乐歌单分享链接"
              aria-label="歌单分享链接"
              allowClear
            />
          </Form.Item>
          <Button
            className={styles["parse-button"]}
            htmlType="submit"
            aria-label="解析歌单"
            loading={parsing}>
            <i
              className="ri-list-check-3"
              aria-hidden="true"
            />
            解析歌单
          </Button>
        </Form>
        {playlistInfo && (
          <section
            className={styles["playlist-result"]}
            aria-label="歌单解析结果">
            <div className={styles["playlist-summary"]}>
              <div className={styles["playlist-cover"]}>
                {playlistInfo.cover ? (
                  <img
                    src={playlistInfo.cover}
                    alt={`${playlistInfo.title}封面`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <i
                    className="ri-list-music-line"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className={styles["playlist-main"]}>
                <span className={styles["playlist-kicker"]}>
                  已解析 {parsedCount} / {playlistInfo.tracks.length} 首
                </span>
                <h3 className={styles["playlist-title"]}>{playlistInfo.title}</h3>
                <p className={styles["playlist-meta"]}>
                  {playlistInfo.owner} · {playlistInfo.countTracks} 首
                </p>
              </div>
            </div>

            <div
              className={styles["batch-actions"]}
              aria-label="歌单批量操作">
              <Button
                className={`${styles["batch-button"]} ${styles["is-strong"]}`}
                htmlType="button"
                aria-label="解析歌单全部歌曲"
                loading={batchLoading === "parseAll"}
                onClick={handleParseAll}>
                <i
                  className="ri-flashlight-line"
                  aria-hidden="true"
                />
                全部解析
              </Button>
              <Button
                className={styles["batch-button"]}
                htmlType="button"
                aria-label="下载歌单全部歌曲"
                loading={batchLoading === "downloadAll"}
                onClick={handleDownloadAll}>
                <i
                  className="ri-download-cloud-2-line"
                  aria-hidden="true"
                />
                全部下载
              </Button>
              <Button
                className={styles["batch-button"]}
                htmlType="button"
                aria-label="下载全部 LRC 歌词"
                loading={batchLoading === "downloadAllLrc"}
                onClick={handleDownloadAllLrc}>
                <i
                  className="ri-file-list-3-line"
                  aria-hidden="true"
                />
                下载全部lrc歌词
              </Button>
              <Button
                className={styles["batch-button"]}
                htmlType="button"
                aria-label="下载全部 TXT 歌词"
                loading={batchLoading === "downloadAllTxt"}
                onClick={handleDownloadAllTxt}>
                <i
                  className="ri-file-text-line"
                  aria-hidden="true"
                />
                下载全部txt歌词
              </Button>
            </div>

            <div className={styles["song-list"]}>
              {playlistInfo.tracks.length > 0 ? (
                playlistInfo.tracks.map((track: PlaylistMusicInfo, index) => {
                  const parsedMusicInfo = getParsedMusicInfo(track, index);
                  const isSongParsed = Boolean(parsedMusicInfo);
                  const songTitle = parsedMusicInfo?.title || track.title || "未知歌曲";
                  const songArtist = parsedMusicInfo?.artist || track.artist || "未知歌手";
                  const songAlbum = parsedMusicInfo?.album || track.album || "未知专辑";
                  const songCover = parsedMusicInfo?.cover || track.cover;
                  // 是否是预览歌曲
                  const isPreviewSong = Boolean(
                    track.isPreviewOnly &&
                    track.previewDuration &&
                    track.duration &&
                    track.previewDuration < track.duration
                  );
                  const displayDuration = isPreviewSong ? track.previewDuration : track.duration;

                  return (
                    <article
                      className={`${styles["song-item"]} ${isSongParsed ? styles["is-parsed"] : ""}`}
                      key={getTrackKey(track, index)}>
                      {isPreviewSong && <span className={styles["preview-badge"]}>试听</span>}
                      <div className={styles["song-rank"]}>
                        <span className={styles["song-index"]}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`${styles["song-state"]} ${
                            isSongParsed ? styles["is-state-parsed"] : styles["is-state-pending"]
                          }`}>
                          {isSongParsed ? "已解析" : "待解析"}
                        </span>
                      </div>
                      <div className={styles["song-cover"]}>
                        {songCover ? (
                          <img
                            src={songCover}
                            alt={`${songTitle}封面`}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <i
                            className="ri-music-2-line"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className={styles["song-main"]}>
                        <div className={styles["song-title-row"]}>
                          <h4 className={styles["song-title"]}>{songTitle}</h4>
                          {isSongParsed && (
                            <span className={styles["song-format"]}>
                              {parsedMusicInfo?.format || "audio"}
                            </span>
                          )}
                        </div>
                        <p className={styles["song-meta"]}>
                          {songArtist} · {songAlbum} · {formatDuration(displayDuration)}
                        </p>
                        {isSongParsed && (
                          <div className={styles["song-data-row"]}>
                            <span>{parsedMusicInfo?.url ? "音频已就绪" : "暂无音频"}</span>
                            <span>{parsedMusicInfo?.lrc ? "LRC 已就绪" : "暂无 LRC"}</span>
                            <span>{parsedMusicInfo?.lrcContent ? "TXT 已就绪" : "暂无 TXT"}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles["song-actions"]}>
                        {/* 操作按钮 */}
                        <Button
                          className={styles["song-action-button"]}
                          htmlType="button"
                          aria-label={`解析 ${songTitle}`}
                          loading={songActionLoadingIds.includes(
                            getSongActionKey(track, index, "parse")
                          )}
                          onClick={() => handleParseSong(track, index)}>
                          解析
                        </Button>
                        <Button
                          className={styles["song-action-button"]}
                          htmlType="button"
                          aria-label={`下载 ${songTitle}`}
                          loading={songActionLoadingIds.includes(
                            getSongActionKey(track, index, "download")
                          )}
                          onClick={() => handleDownloadSong(track, index)}>
                          下载
                        </Button>
                        <Button
                          className={styles["song-action-button"]}
                          htmlType="button"
                          aria-label={`下载 ${songTitle} 的 LRC 歌词`}
                          loading={songActionLoadingIds.includes(
                            getSongActionKey(track, index, "downloadLrc")
                          )}
                          onClick={() => handleDownloadSongLrc(track, index)}>
                          LRC
                        </Button>
                        <Button
                          className={styles["song-action-button"]}
                          htmlType="button"
                          aria-label={`下载 ${songTitle} 的 TXT 歌词`}
                          loading={songActionLoadingIds.includes(
                            getSongActionKey(track, index, "downloadTxt")
                          )}
                          onClick={() => handleDownloadSongTxt(track, index)}>
                          TXT
                        </Button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles["empty-state"]}>暂无歌曲数据</div>
              )}
            </div>
          </section>
        )}
      </Modal>
    );
  }
);

PlaylistParseModal.displayName = "PlaylistParseModal";

export default PlaylistParseModal;
