import { sanitizeFileName } from "./index";

export const downloadFile = async (url: string, fileName: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeFileName(fileName);
  a.click();
  a.remove();
};

export const getFileBlob = async (url: string) => {
  const res = await fetch(url, {
    referrerPolicy: "no-referrer",
    mode: "cors",
  });
  if (!res.ok) throw new Error("下载失败，请稍后重试");
  const blob = await res.blob();
  return blob;
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = sanitizeFileName(fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

export const downloadTextFile = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  downloadFile(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
};
