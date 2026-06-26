import axios, { type AxiosRequestConfig } from "axios";

const CORS_PROXY = "http://qiuyu520.fun/cors/?url=";

const request = axios.create({
  timeout: 10000,
});

request.interceptors.response.use(
  response => {
    const { status } = response;
    if (status !== 200) {
      console.log("response", response);
      throw new Error(`Request failed with status ${status}`);
    }
    return response.data;
  },
  error => Promise.reject(error)
);

export const get = <R = any, P = Record<string, any>>(url: string, params?: P): Promise<R> => {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  return request.get<P, R>(proxyUrl, { params });
};

export const post = <R = any, D = Record<string, any>>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<R> => {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  return request.post<D, R>(proxyUrl, data, config);
};

export default request;
