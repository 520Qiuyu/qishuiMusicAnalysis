/**
 * 汽水音乐解析下载工具 - 主脚本
 * 负责：链接解析、流式下载、进度与历史管理、DOM 事件绑定
 */

/**
 * @typedef {Object} MusicInfo
 * @property {string} title - 音乐标题
 * @property {string} artist - 艺术家
 * @property {string} album - 专辑名称
 * @property {string} cover - 封面图片URL
 * @property {string} url - 音乐文件URL
 */

/**
 * @typedef {Object} DownloadTask
 * @property {string} id - 下载任务ID
 * @property {string} name - 音乐名称
 * @property {number} size - 文件大小
 * @property {number} progress - 下载进度（0-100）
 * @property {string} status - 下载状态（pending/downloading/paused/completed/error）
 */

// ========== 状态与 DOM 引用 ==========

/** 全局状态：当前曲目、下载任务 Map、历史列表 */
const state = {
  /** @type {MusicInfo|null} */
  currentMusic: null,
  /** @type {Map<string, DownloadTask>} */
  downloads: new Map(),
  /** @type {MusicInfo[]} */
  history: [],
};

/**
 * 页面关键 DOM 元素缓存，避免重复 querySelector
 * @type {Object}
 * @property {HTMLInputElement} musicLink - 音乐分享链接输入框
 * @property {HTMLButtonElement} parseButton - 解析按钮
 * @property {HTMLElement} parseStatus - 解析状态展示区域（含 loading 图标与文案）
 * @property {HTMLElement} musicInfoSection - 音乐信息展示区块（封面、标题、歌手、专辑、播放器）
 * @property {HTMLImageElement} musicCover - 音乐封面图
 * @property {HTMLElement} musicTitle - 歌曲标题
 * @property {HTMLElement} musicArtist - 歌手名
 * @property {HTMLElement} musicAlbum - 专辑名
 * @property {HTMLAudioElement} musicPlayer - 音频播放器
 * @property {HTMLButtonElement} downloadButton - 下载按钮
 * @property {HTMLElement} downloadList - 下载任务列表容器
 * @property {HTMLElement} historyList - 下载历史列表容器
 * @property {HTMLTemplateElement} downloadItemTemplate - 单条下载项的模板节点
 */
const elements = {
  musicLink: document.getElementById("musicLink"),
  parseButton: document.getElementById("parseButton"),
  parseStatus: document.getElementById("parseStatus"),
  musicInfoSection: document.querySelector(".music-info-section"),
  musicCover: document.getElementById("musicCover"),
  musicTitle: document.getElementById("musicTitle"),
  musicArtist: document.getElementById("musicArtist"),
  musicAlbum: document.getElementById("musicAlbum"),
  musicPlayer: document.getElementById("musicPlayer"),
  downloadButton: document.getElementById("downloadButton"),
  downloadList: document.getElementById("downloadList"),
  historyList: document.getElementById("historyList"),
  downloadItemTemplate: document.getElementById("downloadItemTemplate"),
};

// ========== 启动时恢复历史记录 ==========

const savedHistory = localStorage.getItem("downloadHistory");
if (savedHistory) {
  try {
    state.history = JSON.parse(savedHistory);
    state.history.forEach(historyItem => {
      const historyItemElement = document.createElement("div");
      historyItemElement.className = "download-item";
      historyItemElement.innerHTML = `
                <div class="download-item-info">
                    <span class="download-name">${historyItem.title} - ${historyItem.artist}</span>
                    <span class="download-size">${new Date(
                      historyItem.downloadDate
                    ).toLocaleString()}</span>
                </div>
            `;
      elements.historyList.appendChild(historyItemElement);
    });
  } catch (error) {
    console.error("加载历史记录失败:", error);
    state.history = [];
  }
}

// ========== 解析逻辑 ==========

/**
 * 解析汽水音乐分享链接，从页面 HTML 中提取 _ROUTER_DATA 得到歌曲信息与音频地址
 * @param {string} link - 音乐分享链接（可含前后文案，会正则提取 https 链接）
 * @returns {Promise<MusicInfo>} 歌曲信息，含 title/artist/album/cover/url
 * @throws {Error} 请求失败、未找到音乐信息或解析异常时抛出
 */
async function parseMusicLink(link) {
  try {
    // 从输入中提取首个 https 链接
    const url = link.match(/https:\/\/[^\s]+/)[0];
    const corsProxy = "http://qiuyu520.fun/cors/?url=";
    const proxyUrl = corsProxy + encodeURIComponent(url);

    const response = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
      },
    });
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = doc.getElementsByTagName("script");
    let musicData = null;

    // 遍历页面 script，查找汽水音乐注入的 _ROUTER_DATA
    for (const script of scripts) {
      const content = script.textContent || script.innerText;
      if (content.includes("_ROUTER_DATA")) {
        try {
          const match = content.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
          if (match && match[1]) {
            const jsonData = JSON.parse(match[1]);
            const musicInfo = jsonData?.loaderData?.track_page || {};
            const { audioWithLyricsOption } = musicInfo;
            if (musicInfo) {
              musicData = {
                title: audioWithLyricsOption.trackName || "未知歌曲",
                artist: audioWithLyricsOption.artistName || "未知歌手",
                album: audioWithLyricsOption.trackInfo.album.name || "未知专辑",
                cover: audioWithLyricsOption.coverURL || "https://via.placeholder.com/120",
                url: audioWithLyricsOption.url
                  ? encodeURI(decodeURI(audioWithLyricsOption.url))
                  : "",
              };

              // 异步拉取音频为 Blob 并填入播放器，避免 referrer 限制
              fetch(musicData.url, {
                referrerPolicy: "no-referrer",
                mode: "cors",
              })
                .then(res => {
                  if (!res.ok) throw new Error("音频加载失败");
                  return res.blob();
                })
                .then(blob => {
                  const blobUrl = URL.createObjectURL(blob);
                  elements.musicPlayer.querySelector("source").src = blobUrl;
                  elements.musicPlayer.load();
                })
                .catch(err => {
                  console.error("音频加载失败:", err);
                });

              return musicData;
            }
          }
        } catch (error) {
          console.error("解析script内容失败:", error);
        }
      }
    }

    if (!musicData) {
      throw new Error("未找到音乐信息");
    }

    throw new Error("无法解析音乐信息");
  } catch (error) {
    console.error("解析链接失败:", error);
    throw new Error(`解析失败: ${error.message}`);
  }
}

// ========== 下载逻辑 ==========

/**
 * 创建下载任务并流式下载音频，支持暂停/取消，完成后触发浏览器保存并写入历史
 * @param {MusicInfo} musicInfo - 当前要下载的歌曲信息（需含 url）
 * @returns {Promise<void>}
 */
async function startDownload(musicInfo) {
  if (!musicInfo || !musicInfo.url) return;

  const taskId = Date.now().toString();
  const task = {
    id: taskId,
    name: `${musicInfo.title} - ${musicInfo.artist}`,
    size: "未知大小",
    progress: 0,
    status: "downloading",
  };
  state.downloads.set(taskId, task);

  // 用模板生成一条下载项并绑定暂停/取消
  const template = elements.downloadItemTemplate;
  const downloadItem = document.importNode(template.content, true).querySelector(".download-item");
  downloadItem.dataset.taskId = taskId;

  downloadItem.querySelector(".download-name").textContent = task.name;
  downloadItem.querySelector(".download-size").textContent = task.size;

  const pauseButton = downloadItem.querySelector(".pause-button");
  const cancelButton = downloadItem.querySelector(".cancel-button");
  pauseButton.addEventListener("click", () => pauseDownload(taskId));
  cancelButton.addEventListener("click", () => cancelDownload(taskId));

  elements.downloadList.appendChild(downloadItem);

  try {
    const response = await fetch(musicInfo.url, {
      referrerPolicy: "no-referrer",
      mode: "cors",
    });

    if (!response.ok) throw new Error("下载失败");

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      task.size = `${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)} MB`;
      downloadItem.querySelector(".download-size").textContent = task.size;
    }

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks = [];

    // 流式读取，按进度更新 UI，并响应暂停/取消
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        updateDownloadProgress(taskId, 100);
        break;
      }

      receivedLength += value.length;
      chunks.push(value);
      if (contentLength) {
        const progress = (receivedLength / parseInt(contentLength)) * 100;
        updateDownloadProgress(taskId, progress && progress.toFixed(2));
      }

      const currentTask = state.downloads.get(taskId);
      if (currentTask.status === "cancelled") {
        reader.cancel();
        break;
      }
      if (currentTask.status === "paused") {
        // 暂停时轮询等待恢复或取消
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            const task = state.downloads.get(taskId);
            if (task.status === "downloading" || task.status === "cancelled") {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }
    }

    // 未取消则组装 Blob 并触发浏览器下载
    if (state.downloads.get(taskId).status !== "cancelled") {
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${musicInfo.title} - ${musicInfo.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("下载出错:", error);
    task.status = "error";
    state.downloads.set(taskId, task);
    const progressText = downloadItem.querySelector(".progress-text");
    if (progressText) progressText.textContent = "下载失败";
  }
}

/**
 * 更新指定任务的进度并刷新对应 DOM；进度到 100 时标记完成并写入历史
 * @param {string} taskId - 下载任务ID
 * @param {number} progress - 下载进度（0-100）
 */
function updateDownloadProgress(taskId, progress) {
  const task = state.downloads.get(taskId);
  if (!task) return;

  task.progress = Math.min(100, Math.max(0, progress));
  state.downloads.set(taskId, task);

  const downloadItem = document.querySelector(`[data-task-id="${taskId}"]`);
  if (downloadItem) {
    const progressFill = downloadItem.querySelector(".progress-fill");
    const progressText = downloadItem.querySelector(".progress-text");
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;

    if (progress >= 100) {
      task.status = "completed";
      state.downloads.set(taskId, task);
      addToHistory(state.currentMusic); // 仅完成时写入历史，避免重复
    }
  }
}

/**
 * 切换任务的暂停/继续状态，并更新按钮图标
 * @param {string} taskId - 下载任务ID
 */
function pauseDownload(taskId) {
  const task = state.downloads.get(taskId);
  if (!task) return;

  task.status = task.status === "paused" ? "downloading" : "paused";
  state.downloads.set(taskId, task);

  const downloadItem = document.querySelector(`[data-task-id="${taskId}"]`);
  if (downloadItem) {
    const pauseButton = downloadItem.querySelector(".pause-button i");
    if (pauseButton) {
      pauseButton.className = task.status === "paused" ? "ri-play-line" : "ri-pause-line";
    }
  }
}

/**
 * 取消下载：标记任务为已取消、移除列表节点并从 state.downloads 中删除
 * @param {string} taskId - 下载任务ID
 */
function cancelDownload(taskId) {
  const task = state.downloads.get(taskId);
  if (!task) return;

  task.status = "cancelled";
  state.downloads.set(taskId, task);

  const downloadItem = document.querySelector(`[data-task-id="${taskId}"]`);
  if (downloadItem) {
    downloadItem.remove();
  }

  state.downloads.delete(taskId);
}

/**
 * 将一次下载记录写入 state.history 与 localStorage，并在「下载历史」区域插入一条 DOM
 * 最多保留 50 条，超出则删除最旧一条
 * @param {MusicInfo} musicInfo - 本次下载的歌曲信息
 */
function addToHistory(musicInfo) {
  if (!musicInfo) return;

  const historyItem = {
    id: Date.now().toString(),
    title: musicInfo.title,
    artist: musicInfo.artist,
    cover: musicInfo.cover,
    downloadDate: new Date().toISOString(),
  };

  state.history.unshift(historyItem);

  if (state.history.length > 50) {
    state.history.pop();
  }

  localStorage.setItem("downloadHistory", JSON.stringify(state.history));

  // 在历史列表顶部插入一条
  const historyList = document.getElementById("historyList");
  if (historyList) {
    const historyItemElement = document.createElement("div");
    historyItemElement.className = "download-item";
    historyItemElement.innerHTML = `
            <div class="download-item-info">
                <span class="download-name">${historyItem.title} - ${historyItem.artist}</span>
                <span class="download-size">${new Date(
                  historyItem.downloadDate
                ).toLocaleString()}</span>
            </div>
        `;
    historyList.insertBefore(historyItemElement, historyList.firstChild);
  }
}

// ========== 事件绑定 ==========

elements.parseButton.addEventListener("click", async () => {
  const link = elements.musicLink.value.trim();
  if (!link) {
    alert("请输入音乐分享链接");
    return;
  }

  try {
    elements.parseStatus.classList.remove("hidden");
    const musicInfo = await parseMusicLink(link);
    state.currentMusic = musicInfo;
    updateMusicInfoDisplay(musicInfo);
  } catch (error) {
    alert(`解析失败：${error.message}`);
  } finally {
    elements.parseStatus.classList.add("hidden");
  }
});

elements.downloadButton.addEventListener("click", handleDownloadClick);

/**
 * 下载按钮点击：无当前曲目时提示，否则调用 startDownload（历史在完成时由 updateDownloadProgress 写入）
 */
async function handleDownloadClick() {
  if (!state.currentMusic) {
    alert("请先解析音乐链接");
    return;
  }
  try {
    await startDownload(state.currentMusic);
  } catch (error) {
    alert(`下载失败：${error.message}`);
  }
}

/**
 * 将解析得到的歌曲信息填入封面、标题、歌手、专辑并显示该区块
 * @param {MusicInfo} musicInfo - 音乐信息
 */
function updateMusicInfoDisplay(musicInfo) {
  elements.musicCover.src = musicInfo.cover;
  elements.musicTitle.textContent = musicInfo.title;
  elements.musicArtist.textContent = musicInfo.artist;
  elements.musicAlbum.textContent = musicInfo.album;
  elements.musicInfoSection.classList.remove("hidden");
}

// ========== 入口 ==========

/** 应用启动入口（当前仅打日志，历史恢复已在脚本顶部执行） */
function init() {
  console.log("应用初始化完成");
}

init();
