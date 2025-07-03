// 간단한 axios 스타일 HTTP 클라이언트
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface AxiosRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

class MyAxios {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const headers = new Headers({
      ...this.defaultHeaders,
      ...config.headers,
    });

    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
    if (data && !(data instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }

    const requestInit: RequestInit = {
      method,
      headers,
      signal: config.signal,
    };

    if (data) {
      if (data instanceof FormData) {
        requestInit.body = data;
      } else if (typeof data === 'object') {
        requestInit.body = JSON.stringify(data);
      } else {
        requestInit.body = data;
      }
    }

    try {
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | undefined;

      if (config.timeout) {
        timeoutId = setTimeout(() => controller.abort(), config.timeout);
        if (!config.signal) {
          requestInit.signal = controller.signal;
        }
      }

      const response = await fetch(fullUrl, requestInit);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 응답 데이터 파싱
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = (await response.text()) as unknown as T;
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      console.error(`MyAxios ${method} request failed:`, error);
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }
}

// 기본 인스턴스 생성 및 export
const myAxios = new MyAxios('', {
  'Accept': 'application/json',
});

export default myAxios;

// 개별 메서드들도 export (편의를 위해)
export const { get, post, put, delete: del, patch } = myAxios;

// 타입들도 export
export type { AxiosResponse, AxiosRequestConfig };