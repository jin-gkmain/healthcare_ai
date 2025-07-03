export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatHistoryItem {
  inputs: string;
  outputs: string;
}

export interface ChatRequestPayload {
  history: ChatHistoryItem[];
  question: string;
  category: string;
  model: string;
  prompt: string;
  multiquery: boolean;
  streaming: boolean;
}

export interface ChatResponse {
  answer: string;
  status?: string;
  error?: string;
}

// 복약정보 API 관련 타입 정의
export interface Disease {
  disease: string;
  definition: string;
  cause: string;
  symptom: string;
}

export interface Medicine {
  medicine: string;
  effects: string;
  usage: string;
  caution: string;
}

export interface MedicationAPIResponse {
  disease?: Disease[];
  medicine?: Medicine[];
  answer?: string;
  text?: string;
  apiVersion?: string;
  processedAt?: string;
  imageInfo?: {
    fileName: string;
    processed: boolean;
  };
  questionInfo?: {
    question: string;
    category: string;
  };
  [key: string]: any;
}