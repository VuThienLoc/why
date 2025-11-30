import axios, { AxiosRequestConfig } from "axios";

class HttpClient {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.get(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.post(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.put(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.delete(url, config);
    return res.data;
  }
}

export default new HttpClient();
