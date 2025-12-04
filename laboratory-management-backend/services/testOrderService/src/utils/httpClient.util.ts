import axios, { AxiosRequestConfig } from "axios";

class HttpClient {
  private defaultTimeout = 30000; // 30 giây

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.get(url, { timeout: this.defaultTimeout, ...config });
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.post(url, data, { timeout: this.defaultTimeout, ...config });
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.put(url, data, { timeout: this.defaultTimeout, ...config });
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.delete(url, { timeout: this.defaultTimeout, ...config });
    return res.data;
  }
}

export default new HttpClient();
