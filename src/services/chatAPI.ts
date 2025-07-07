import {
  type ChatHistoryItem,
  type ChatRequestPayload,
  type ChatResponse,
  type ChatMessage,
} from "../types";

// 실제 API 엔드포인트 설정
// 사용자가 제공한 실제 API 엔드포인트로 변경
const CHATBOT_ENDPOINT = "https://ai.koihealth-live.com/text";

// 실제 API 사용 여부를 제어하는 플래그
const USE_REAL_API = true; // true로 설정하면 실제 API 사용, false면 Mock API 사용

// 개발 모드 감지 함수
const isDevelopmentMode = (): boolean => {
  // USE_REAL_API가 true면 개발 모드와 관계없이 실제 API 사용
  if (USE_REAL_API) return false;

  // 개발 환경 감지 방법들
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.port !== ""
  );
};

// 질문 키워드에 따른 맞춤형 응답 생성 (폴백용)
const generateContextualResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();

  // 증상 관련 키워드
  if (
    lowerQuestion.includes("아프") ||
    lowerQuestion.includes("통증") ||
    lowerQuestion.includes("아픈") ||
    lowerQuestion.includes("증상") ||
    lowerQuestion.includes("불편") ||
    lowerQuestion.includes("이상")
  ) {
    return `${question}에 대해 말씀해 주셔서 감사합니다. 

증상의 정도와 지속 기간을 파악하는 것이 중요합니다:
• 언제부터 이런 증상이 시작되었나요?
• 증상의 강도는 10점 만점에 몇 점 정도인지요?
• 특정 동작이나 시간대에 더 심해지나요?
• 다른 동반 증상은 없으신가요?

이런 정보를 바탕으로 더 구체적인 조언을 드릴 수 있습니다. 다만 심각한 증상이거나 지속적으로 악화된다면 반드시 병원 진료를 받으시기 바랍니다.`;
  }

  // 건강 관리 관련
  if (
    lowerQuestion.includes("건강") ||
    lowerQuestion.includes("관리") ||
    lowerQuestion.includes("예방") ||
    lowerQuestion.includes("운동") ||
    lowerQuestion.includes("식단")
  ) {
    return `건강 관리에 대한 관심을 가지고 계시는군요! 정말 좋은 자세입니다.

기본적인 건강 관리 원칙:
• **균형 잡힌 식단**: 다양한 영양소를 골고루 섭취
• **규칙적인 운동**: 주 3-4회, 30분 이상의 유산소 운동
• **충분한 수면**: 하루 7-8시간의 양질의 수면
• **스트레스 관리**: 명상, 취미 활동 등으로 스트레스 해소
• **정기 건강검진**: 연 1-2회 정기적인 건강상태 확인

특별히 관심 있는 부분이 있으시면 더 자세히 설명드리겠습니다.`;
  }

  // 약물 관련
  if (
    lowerQuestion.includes("약") ||
    lowerQuestion.includes("복용") ||
    lowerQuestion.includes("처방") ||
    lowerQuestion.includes("부작용") ||
    lowerQuestion.includes("의약품")
  ) {
    return `약물 관련 질문을 주셨군요. 안전한 복용을 위한 기본 원칙을 말씀드리겠습니다.

약물 복용 시 주의사항:
• **정확한 복용법**: 처방받은 용법·용량을 정확히 지키기
• **복용 시간**: 식전/식후 등 지정된 시간에 복용
• **상호작용 확인**: 다른 약물과의 병용 시 주의
• **부작용 모니터링**: 이상 반응 발생 시 즉시 의료진 상담
• **보관 방법**: 적절한 온도와 습도에서 보관

구체적인 약물에 대한 정보는 반드시 의사나 약사와 상담하시기 바랍니다.`;
  }

  // 응급상황 관련
  if (
    lowerQuestion.includes("응급") ||
    lowerQuestion.includes("위험") ||
    lowerQuestion.includes("심각") ||
    lowerQuestion.includes("갑자기") ||
    lowerQuestion.includes("응급실")
  ) {
    return `응급상황에 대해 문의하셨습니다. 즉시 대응이 필요할 수 있습니다.

**즉시 응급실 방문이 필요한 경우:**
• 의식 잃음, 호흡 곤란, 심한 흉통
• 심한 복통, 지속적인 구토
• 심한 외상, 골절 의심
• 알레르기 반응 (두드러기, 부종)

**응급 연락처:**
• 119 (응급의료서비스)
• 1339 (응급의료정보센터)

현재 응급상황이라면 즉시 119에 신고하거나 가까운 응급실로 가시기 바랍니다.`;
  }

  // 정신건강 관련
  if (
    lowerQuestion.includes("스트레스") ||
    lowerQuestion.includes("우울") ||
    lowerQuestion.includes("불안") ||
    lowerQuestion.includes("수면") ||
    lowerQuestion.includes("잠") ||
    lowerQuestion.includes("피로")
  ) {
    return `정신건강과 관련된 질문을 해주셨네요. 마음의 건강도 몸의 건강만큼 중요합니다.

**스트레스 관리 방법:**
• **규칙적인 생활**: 일정한 수면과 식사 패턴 유지
• **운동**: 가벼운 산책이나 요가로 몸과 마음 이완
• **취미 활동**: 좋아하는 활동으로 기분 전환
• **사회적 관계**: 가족, 친구들과의 소통
• **전문가 도움**: 필요시 상담사나 정신과 전문의 상담

만약 일상생활에 심각한 지장을 주는 정도라면 전문가의 도움을 받으시는 것을 권장드립니다.`;
  }

  // 기본 응답
  return `${question}에 대해 질문해 주셔서 감사합니다.

건강과 관련된 모든 문제는 개인차가 크기 때문에, 정확한 진단과 치료를 위해서는 반드시 의료 전문가와 상담하시는 것이 중요합니다.

제가 제공하는 정보는 일반적인 건강 지식과 참고 사항이며, 의학적 진단이나 치료를 대체할 수 없습니다.

더 구체적인 질문이 있으시면 언제든 말씀해 주세요. 도움이 되도록 최선을 다하겠습니다.`;
};

// 스트리밍 응답을 위한 Mock 함수 (폴백용)
const simulateStreamingResponse = async (
  question: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    console.log("🎭 Mock 스트리밍 시작 (폴백):", question.substring(0, 50));

    const response = generateContextualResponse(question);

    // 문장 단위로 나누어 더 자연스러운 스트리밍 구현
    const sentences = response.split(/([.!?。])/);

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (!sentence) continue;

      // 문장 부호가 아닌 경우에만 글자별로 스트리밍
      if (sentence.match(/[.!?。]/)) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        onChunk(sentence);
      } else {
        // 글자별로 스트리밍
        for (let j = 0; j < sentence.length; j++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 20 + Math.random() * 30)
          );
          onChunk(sentence[j]);
        }
      }
    }

    console.log("✅ Mock 스트리밍 완료");
    setTimeout(() => {
      onComplete();
    }, 300);
  } catch (error) {
    console.error("❌ Mock 스트리밍 오류:", error);
    onError(error as Error);
  }
};

// 스트리밍 API 호출 함수
export const fetchChatbotResponseStream = async (
  history: ChatHistoryItem[],
  question: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  const payload: ChatRequestPayload = {
    history,
    question,
    category: "A",
    model: "gpt-4o-mini",
    prompt: "",
    multiquery: false,
    streaming: true,
  };

  console.log("🚀 스트리밍 채팅 API 요청 시작:", {
    endpoint: CHATBOT_ENDPOINT,
    useRealAPI: USE_REAL_API,
    isDevelopment: isDevelopmentMode(),
    historyLength: history.length,
    question: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
    payload: { ...payload, history: `[${history.length} items]` },
  });

  // Mock API 사용 조건
  if (isDevelopmentMode()) {
    console.log("🎭 Mock 스트리밍 API 사용 - 개발 모드");
    return simulateStreamingResponse(question, onChunk, onComplete, onError);
  }

  try {
    console.log("🌐 실제 API 호출 시도");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("응답 스트림을 읽을 수 없습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedData = false;

    console.log("📡 스트리밍 응답 수신 시작");

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ 스트리밍 완료 (done=true)");
          if (!receivedData) {
            throw new Error("서버로부터 응답을 받지 못했습니다.");
          }
          break;
        }

        receivedData = true;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "") continue;

          console.log("📥 수신된 라인:", trimmedLine.substring(0, 100));

          try {
            // Server-Sent Events 형식 처리
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.slice(6);

              if (data === "[DONE]") {
                console.log("🏁 스트리밍 종료 신호 수신");
                onComplete();
                return;
              }

              const parsed = JSON.parse(data);

              // 다양한 API 응답 형식 지원
              let content = "";
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                content = parsed.choices[0].delta.content;
              } else if (parsed.content) {
                content = parsed.content;
              } else if (parsed.answer) {
                content = parsed.answer;
              } else if (typeof parsed === "string") {
                content = parsed;
              }

              if (content) {
                onChunk(content);
              }
            }
            // 일반 JSON 라인 처리
            else if (trimmedLine.startsWith("{")) {
              const parsed = JSON.parse(trimmedLine);
              let content = "";

              if (parsed.content) {
                content = parsed.content;
              } else if (parsed.answer) {
                content = parsed.answer;
              } else if (parsed.delta?.content) {
                content = parsed.delta.content;
              }

              if (content) {
                onChunk(content);
              }
            }
            // 순수 텍스트 라인
            else if (trimmedLine.length > 0) {
              onChunk(trimmedLine);
            }
          } catch (parseError) {
            console.warn("⚠️ 라인 파싱 오류 (계속 진행):", parseError);
            // 파싱 실패 시에도 원본 텍스트를 전달
            if (trimmedLine.length > 0 && !trimmedLine.startsWith("data:")) {
              onChunk(trimmedLine);
            }
          }
        }
      }

      // 자연스러운 완료 처리
      setTimeout(() => {
        onComplete();
      }, 200);
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("❌ 스트리밍 API 오류:", error);

    // 네트워크 오류나 CORS 오류 시 Mock API로 폴백
    if (
      error instanceof TypeError &&
      (error.message.includes("fetch") ||
        error.message.includes("CORS") ||
        error.message.includes("NetworkError"))
    ) {
      console.warn("⚠️ 네트워크/CORS 오류, Mock API로 대체");
      return simulateStreamingResponse(question, onChunk, onComplete, onError);
    }

    // 타임아웃 오류
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("⚠️ 요청 타임아웃, Mock API로 대체");
      return simulateStreamingResponse(question, onChunk, onComplete, onError);
    }

    // 기타 오류 처리
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(
        new Error(
          "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        )
      );
    }
  }
};

// 백업용 일반 API 호출 함수
export const fetchChatbotResponse = async (
  history: ChatHistoryItem[],
  question: string
): Promise<string> => {
  const payload: ChatRequestPayload = {
    history,
    question,
    category: "A",
    model: "gpt-4o-mini",
    prompt: "",
    multiquery: false,
    streaming: false,
  };

  console.log("🚀 일반 채팅 API 요청:", {
    endpoint: CHATBOT_ENDPOINT,
    useRealAPI: USE_REAL_API,
    isDevelopment: isDevelopmentMode(),
    historyLength: history.length,
    question: question.substring(0, 50) + "...",
  });

  // Mock 응답 (개발/폴백용)
  if (isDevelopmentMode()) {
    console.log("🎭 Mock API 사용 - 개발 모드");

    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 2000)
    );

    return generateContextualResponse(question);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `서버 오류: ${response.status}. 잠시 후 다시 시도해주세요.`
      );
    }

    const data = (await response.json()) as ChatResponse;

    if (data && data.answer) {
      console.log("✅ API 응답 수신 완료");
      return data.answer;
    }

    throw new Error("API 응답에서 answer를 찾을 수 없습니다.");
  } catch (error) {
    console.error("❌ 일반 API 오류:", error);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("네트워크 연결을 확인해주세요.");
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  }
};

// 채팅 메시지를 API 히스토리 형식으로 변환
export const convertToAPIHistory = (
  messages: ChatMessage[]
): ChatHistoryItem[] => {
  const history: ChatHistoryItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.type === "user") {
      const nextMessage = messages[i + 1];
      if (nextMessage && nextMessage.type === "ai") {
        history.push({
          inputs: message.content,
          outputs: nextMessage.content,
        });
      }
    }
  }

  console.log("🔄 API 히스토리 변환 완료:", {
    originalMessages: messages.length,
    historyItems: history.length,
  });

  return history;
};

// API 연결 상태 확인 함수
export const checkAPIHealth = async (): Promise<boolean> => {
  if (isDevelopmentMode()) {
    return false; // Mock 모드
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: "OPTIONS",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// 음성 질문 전용 API 함수
export const fetchVoiceResponse = async (question: string): Promise<string> => {
  console.log("🎤 음성 질문 API 호출:", question);

  try {
    // 음성 질문을 위한 간소화된 히스토리 (대화 맥락 없이 단일 질문)
    const voiceHistory: ChatHistoryItem[] = [];

    const payload: ChatRequestPayload = {
      history: voiceHistory,
      question: question,
      category: "A",
      model: "gpt-4o-mini",
      prompt: "",
      multiquery: false,
      streaming: false,
    };

    console.log("🎤 음성 API 요청 데이터:", {
      endpoint: CHATBOT_ENDPOINT,
      question: question.substring(0, 50) + "...",
      historyLength: voiceHistory.length,
    });

    // Mock 응답 (개발/폴백용)
    if (isDevelopmentMode()) {
      console.log("🎭 음성 Mock API 사용");
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1500)
      );
      return generateContextualResponse(question);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await fetch(CHATBOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `서버 오류: ${response.status}. 잠시 후 다시 시도해주세요.`
      );
    }

    const data = (await response.json()) as ChatResponse;

    if (data && data.answer) {
      console.log(
        "✅ 음성 API 응답 수신 완료:",
        data.answer.substring(0, 100) + "..."
      );
      return data.answer;
    }

    throw new Error("음성 API 응답에서 answer를 찾을 수 없습니다.");
  } catch (error: unknown) {
    console.error("🎤 음성 API 오류:", error);

    // 음성 전용 에러 처리 및 폴백
    if (error instanceof DOMException && error.name === "AbortError") {
      // 타임아웃 시 폴백 응답
      const fallbackResponse = `"${question}"에 대한 답변을 준비하는 중입니다. 잠시 후 다시 질문해주세요.`;
      console.log("🎤 음성 타임아웃 폴백 응답:", fallbackResponse);
      return fallbackResponse;
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      // 네트워크 오류 시 폴백 응답
      const fallbackResponse = "네트워크 연결을 확인하고 다시 질문해주세요.";
      console.log("🎤 음성 네트워크 오류 폴백 응답:", fallbackResponse);
      return fallbackResponse;
    } else {
      // 기타 오류 시 컨텍스트 기반 응답 제공
      const fallbackResponse = generateContextualResponse(question);
      console.log(
        "🎤 음성 일반 오류 폴백 응답 사용:",
        fallbackResponse.substring(0, 100) + "..."
      );
      return fallbackResponse;
    }
  }
};

// API 설정 정보 확인 함수 (디버깅용)
export const getAPIConfig = () => {
  return {
    endpoint: CHATBOT_ENDPOINT,
    useRealAPI: USE_REAL_API,
    isDevelopmentMode: isDevelopmentMode(),
    currentMode: isDevelopmentMode() ? "Mock API" : "Real API",
  };
};
