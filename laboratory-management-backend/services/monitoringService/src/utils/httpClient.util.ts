import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

class HttpClient {
  private static instance: HttpClient;

  private constructor() {}

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    const config: AxiosRequestConfig = {
      headers,
      timeout: 10000,
    };

    const response: AxiosResponse<T> = await axios.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      headers,
      timeout: 10000,
    };

    const response: AxiosResponse<T> = await axios.post(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      headers,
      timeout: 10000,
    };

    const response: AxiosResponse<T> = await axios.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    const config: AxiosRequestConfig = {
      headers,
      timeout: 10000,
    };

    const response: AxiosResponse<T> = await axios.delete(url, config);
    return response.data;
  }
}

export default HttpClient.getInstance();
