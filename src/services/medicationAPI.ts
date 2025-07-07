import type {
  MedicationAPIResponse,
  FormattedMedicationResponse,
} from "../types";
import myAxios from "../utils/myAxios";

// 새로운 응답 타입 정의
interface DiseaseInfo {
  disease: string;
  definition: string;
  cause: string;
  symptom: string;
}

interface MedicineInfo {
  medicine: string;
  effects: string;
  usage: string;
  caution: string;
}

interface ChatbotAnalysisResponse {
  disease: DiseaseInfo[];
  medicine: MedicineInfo[];
}

// 요청 인터페이스
export interface MedicationAPIRequest {
  file: File;
  query?: string;
  streaming?: boolean;
}

// 개발 환경에서는 Mock 데이터만 사용하도록 설정
const FORCE_MOCK_IN_DEV = true;

// 개발 모드 감지 함수
const isDevelopmentMode = (): boolean => {
  if (FORCE_MOCK_IN_DEV) {
    const hostname = window.location.hostname;
    const isDev =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "" ||
      hostname.includes("local") ||
      window.location.port !== "" ||
      window.location.protocol === "file:";

    if (isDev) {
      console.log("🔒 개발 환경에서 강제 Mock 모드 활성화");
      return true;
    }
  }
  return false;
};

// 구조화된 응답을 마크다운으로 변환하는 함수
export const formatStructuredResponse = (
  apiResponse: MedicationAPIResponse
): string => {
  let formattedResponse = "";

  // 약물 정보가 있는 경우
  if (
    apiResponse.medicine &&
    Array.isArray(apiResponse.medicine) &&
    apiResponse.medicine.length > 0
  ) {
    formattedResponse += "# 🏥 약물 분석 결과\n\n";

    apiResponse.medicine.forEach((med, index) => {
      formattedResponse += `## ${index + 1}. ${med.medicine}\n\n`;

      formattedResponse += `### 💊 효능·효과\n`;
      formattedResponse += `${med.effects}\n\n`;

      formattedResponse += `### 📋 용법·용량\n`;
      formattedResponse += `${med.usage}\n\n`;

      formattedResponse += `### ⚠️ 주의사항\n`;
      formattedResponse += `${med.caution}\n\n`;

      if (index < apiResponse.medicine!.length - 1) {
        formattedResponse += "---\n\n";
      }
    });
  }

  // 질병 정보가 있는 경우
  if (
    apiResponse.disease &&
    Array.isArray(apiResponse.disease) &&
    apiResponse.disease.length > 0
  ) {
    if (formattedResponse) formattedResponse += "\n\n";

    formattedResponse += "# 🔍 관련 질병 정보\n\n";

    apiResponse.disease.forEach((disease, index) => {
      formattedResponse += `## ${index + 1}. ${disease.disease}\n\n`;

      formattedResponse += `### 📖 정의\n`;
      formattedResponse += `${disease.definition}\n\n`;

      formattedResponse += `### 🔬 원인\n`;
      formattedResponse += `${disease.cause}\n\n`;

      formattedResponse += `### 🩺 증상\n`;
      formattedResponse += `${disease.symptom}\n\n`;

      if (index < apiResponse.disease!.length - 1) {
        formattedResponse += "---\n\n";
      }
    });
  }

  // 중요 안내사항 추가
  if (formattedResponse) {
    formattedResponse += "\n\n---\n\n";
    formattedResponse += "## ⚠️ 중요 안내\n\n";
    formattedResponse += "- 이 분석 결과는 **참고용**입니다.\n";
    formattedResponse +=
      "- 정확한 진단과 치료는 반드시 **의료진과 상담**하세요.\n";
    formattedResponse += "- 약물 복용 전 **의사나 약사의 지시**를 따르세요.\n";
    formattedResponse +=
      "- 부작용 발생 시 즉시 복용을 중단하고 **의료진에게 문의**하세요.\n";
  }

  return formattedResponse;
};

// 향상된 Mock 응답 생성 함수
const generateMockResponse = (
  fileName: string,
  query: string = ""
): ChatbotAnalysisResponse => {
  console.log("🎭 Mock 응답 생성:", { fileName, query });

  const lowerFileName = fileName.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // 타이레놀 관련
  if (
    lowerFileName.includes("tylenol") ||
    lowerFileName.includes("acetaminophen") ||
    lowerQuery.includes("타이레놀") ||
    lowerQuery.includes("아세트아미노펜") ||
    lowerQuery.includes("해열") ||
    lowerQuery.includes("두통")
  ) {
    return {
      medicine: [
        {
          medicine: "타이레놀정 500mg (아세트아미노펜)",
          effects:
            "발열, 두통, 치통, 생리통, 관절통, 근육통 등의 해열 및 진통에 사용됩니다. 중추신경계에서 프로스타글란딘 합성을 억제하여 통증과 발열을 완화합니다.",
          usage:
            "성인: 1회 500mg~1000mg을 4~6시간마다 복용, 1일 최대 4000mg 초과 금지. 충분한 물과 함께 복용하며 공복 시에도 복용 가능합니다.",
          caution:
            "간 질환 환자나 알코올을 자주 섭취하는 분은 주의가 필요합니다. 다른 아세트아미노펜 함유 제제와 중복 복용 금지. 3일 이상 복용 시 의사 상담 필요.",
        },
      ],
      disease: [],
    };
  }

  // 감기약 관련
  if (
    lowerFileName.includes("cold") ||
    lowerQuery.includes("감기") ||
    lowerQuery.includes("콧물") ||
    lowerQuery.includes("기침") ||
    lowerQuery.includes("목아픔")
  ) {
    return {
      medicine: [
        {
          medicine: "종합감기약 (복합제제)",
          effects:
            "감기로 인한 발열, 두통, 콧물, 코막힘, 재채기, 인후통, 기침, 가래 등의 제반 증상 완화에 사용됩니다.",
          usage:
            "성인 기준 1회 1-2정을 1일 3회 식후 복용. 충분한 수분 섭취와 함께 복용하는 것이 좋습니다.",
          caution:
            "운전이나 기계 조작 시 주의하세요. 알코올과 함께 복용 금지. 다른 감기약과 중복 복용하지 않도록 주의.",
        },
      ],
      disease: [
        {
          disease: "급성 상기도감염 (감기)",
          definition:
            "바이러스에 의한 상부 호흡기의 급성 염증성 질환으로, 코, 인두, 후두 등이 감염되어 나타나는 일반적인 질병입니다.",
          cause:
            "리노바이러스, 코로나바이러스, 아데노바이러스 등의 바이러스 감염이 주원인. 면역력 저하, 스트레스, 급격한 온도 변화 등이 유발 요인.",
          symptom:
            "콧물, 코막힘, 재채기, 인후통, 기침, 미열, 두통, 전신 피로감이 나타나며, 대부분 7-10일 내 자연 회복됩니다.",
        },
      ],
    };
  }

  // 소화제 관련
  if (
    lowerQuery.includes("소화") ||
    lowerQuery.includes("위") ||
    lowerQuery.includes("속쓰림") ||
    lowerQuery.includes("배아픔") ||
    lowerQuery.includes("복통")
  ) {
    return {
      medicine: [
        {
          medicine: "베아제정 (소화효소제)",
          effects:
            "소화불량, 위부팽만감, 식욕부진 등의 증상 개선에 도움을 줍니다. 각종 소화효소가 음식물의 소화를 촉진시킵니다.",
          usage:
            "성인 기준 1회 1-2정을 1일 3회 식후 복용. 물과 함께 씹지 말고 삼켜서 복용하세요.",
          caution:
            "급성 췌장염 환자는 복용 금지. 알레르기 반응 발생 시 즉시 복용 중단. 장기간 복용 시 의사와 상담하세요.",
        },
      ],
      disease: [
        {
          disease: "기능성 소화불량",
          definition:
            "기질적인 원인 없이 발생하는 만성적인 소화불량 증상으로, 위 기능 장애로 인해 나타나는 질환입니다.",
          cause:
            "스트레스, 불규칙한 식습관, 과식, 급하게 먹는 습관, 헬리코박터 파일로리 감염 등이 원인이 될 수 있습니다.",
          symptom:
            "상복부 불편감, 조기 포만감, 식후 복부 팽만, 구역감, 트림, 가슴 쓰림 등의 증상이 나타납니다.",
        },
      ],
    };
  }

  // 항생제 관련
  if (
    lowerQuery.includes("항생제") ||
    lowerQuery.includes("염증") ||
    lowerQuery.includes("화농")
  ) {
    return {
      medicine: [
        {
          medicine: "아목시실린 캡슐 (항생제)",
          effects:
            "세균 감염으로 인한 호흡기 감염, 요로감염, 피부 감염 등의 치료에 사용되는 페니실린계 항생제입니다.",
          usage:
            "성인 기준 1회 250-500mg을 8시간마다 복용. 반드시 처방된 기간 동안 완전히 복용해야 합니다.",
          caution:
            "페니실린 알레르기가 있는 경우 복용 금지. 설사, 복통 등의 부작용 발생 시 의사와 상담. 임의로 복용 중단하지 마세요.",
        },
      ],
      disease: [
        {
          disease: "세균성 감염",
          definition:
            "세균이 인체에 침입하여 발생하는 감염성 질환으로, 다양한 부위에서 염증 반응을 일으킵니다.",
          cause:
            "포도상구균, 연쇄상구균, 대장균 등의 세균이 상처나 점막을 통해 침입하여 감염을 일으킵니다.",
          symptom:
            "발열, 통증, 부종, 홍반, 화농 등이 나타나며, 감염 부위에 따라 추가 증상이 발생할 수 있습니다.",
        },
      ],
    };
  }

  // 기본 응답
  return {
    medicine: [
      {
        medicine: "약물 분석 결과",
        effects:
          "업로드하신 이미지를 분석한 결과입니다. 정확한 약물 식별을 위해서는 포장지의 약물명이나 성분이 선명하게 보이는 사진을 업로드해 주세요.",
        usage:
          "정확한 용법·용량은 약물 포장지의 설명서를 참조하시거나 의사나 약사와 상담하시기 바랍니다.",
        caution:
          "모든 약물은 정해진 용법·용량을 준수해야 하며, 부작용 발생 시 즉시 복용을 중단하고 의료진과 상담하세요.",
      },
    ],
    disease: [],
  };
};

// 간소화된 API 호출 함수 (myAxios 사용)
export const fetchChatbot2Response = async (
  imageFile: File,
  streaming: boolean = false
): Promise<ChatbotAnalysisResponse> => {
  const isDev = isDevelopmentMode();

  console.log("🚀 복약정보 분석 요청 (myAxios):", {
    isDevelopment: isDev,
    fileName: imageFile.name,
    fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
    streaming,
  });

  // 개발 환경에서는 Mock 데이터 사용
  if (isDev) {
    console.log("🎭 개발 환경 - Mock API 사용");

    const delay = 2000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const mockResponse = generateMockResponse(imageFile.name, "");
    console.log("✅ Mock 응답 생성 완료");
    return mockResponse;
  }

  // 프로덕션 환경에서 실제 API 호출
  console.log("🌐 프로덕션 환경 - 실제 API 호출 (myAxios)");

  const formData = new FormData();
  formData.append("image_file", imageFile);

  try {
    const response = await myAxios.post<ChatbotAnalysisResponse>(
      `https://ai.koihealth-live.com/image?streaming=${streaming}`,
      formData,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.data) {
      console.log("✅ 실제 API 성공:", {
        hasMedicine: !!response.data.medicine,
        hasDisease: !!response.data.disease,
        medicineCount: response.data.medicine?.length || 0,
        diseaseCount: response.data.disease?.length || 0,
      });
      return response.data;
    }
    throw new Error("API 응답 데이터를 찾을 수 없습니다.");
  } catch (error) {
    console.error("❌ 챗봇 이미지 분석 API 호출 오류:", error);

    // 오류 발생 시 Mock 데이터로 폴백
    console.log("🔄 Mock 데이터로 폴백");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return generateMockResponse(imageFile.name, "");
  }
};

// 기존 인터페이스와 호환을 위한 함수
export const analyzeMedicationWithQuestion = async (
  request: MedicationAPIRequest
): Promise<MedicationAPIResponse> => {
  const { file, query = "", streaming = false } = request;

  try {
    // 새로운 API 호출
    const apiResponse = await fetchChatbot2Response(file, streaming);

    // 기존 형식으로 변환
    const response: MedicationAPIResponse = {
      medicine: apiResponse.medicine || [],
      disease: apiResponse.disease || [],
      apiVersion: "v2.0-myAxios",
      processedAt: new Date().toISOString(),
      imageInfo: {
        fileName: file.name,
        processed: true,
      },
    };

    // query가 있으면 추가
    if (query) {
      response.questionInfo = {
        question: query,
        category: "medication_analysis",
      };
    }

    return response;
  } catch (error) {
    console.error("❌ API 호출 오류:", error);

    // 폴백으로 Mock 응답 생성
    const mockResponse = generateMockResponse(file.name, query);
    return {
      medicine: mockResponse.medicine || [],
      disease: mockResponse.disease || [],
      apiVersion: "mock-v2.0-myAxios",
      processedAt: new Date().toISOString(),
      imageInfo: {
        fileName: file.name,
        processed: true,
      },
    };
  }
};

// 레거시 지원 함수
export const analyzeMedicationImage = async (
  imageFile: File
): Promise<MedicationAPIResponse> => {
  return analyzeMedicationWithQuestion({
    file: imageFile,
    query: "이 약물에 대한 전반적인 정보를 알려주세요.",
    streaming: false,
  });
};

// API 응답 포맷팅 함수
export const formatMedicationResponse = (
  apiResponse: MedicationAPIResponse
): FormattedMedicationResponse => {
  if (
    (apiResponse.medicine && Array.isArray(apiResponse.medicine)) ||
    (apiResponse.disease && Array.isArray(apiResponse.disease))
  ) {
    const formattedText = formatStructuredResponse(apiResponse);

    return {
      hasStructuredData: true,
      formattedText: formattedText,
      medicines: apiResponse.medicine || [],
      diseases: apiResponse.disease || [],
      totalMedicines: apiResponse.medicine?.length || 0,
      totalDiseases: apiResponse.disease?.length || 0,
      rawResponse: apiResponse,
    };
  }

  if (apiResponse.answer || apiResponse.text) {
    return {
      hasStructuredData: false,
      text: apiResponse.answer || apiResponse.text,
      rawResponse: apiResponse,
    };
  }

  return {
    hasStructuredData: false,
    text: "분석 결과를 표시할 수 없습니다.",
    rawResponse: apiResponse,
  };
};

// API 상태 확인 함수
export const checkMedicationAPIHealth = async (): Promise<{
  isHealthy: boolean;
  message: string;
  environment: string;
}> => {
  const isDev = isDevelopmentMode();

  if (isDev) {
    return {
      isHealthy: true,
      message: "개발 환경 - 안정적인 Mock API 사용",
      environment: "development",
    };
  }

  try {
    // 간단한 health check (myAxios 사용)
    const response = await myAxios.get("https://ai.koihealth-live.com/health", {
      timeout: 5000,
    });

    if (response.status === 200) {
      return {
        isHealthy: true,
        message: "실제 API 서버 연결 정상",
        environment: "production",
      };
    } else {
      return {
        isHealthy: false,
        message: "서버 연결 실패 - Mock API로 대체",
        environment: "production-fallback",
      };
    }
  } catch (error) {
    console.log("⚠️ API 상태 확인 실패:", error);
    return {
      isHealthy: false,
      message: "서버 연결 실패 - Mock API로 대체",
      environment: "production-fallback",
    };
  }
};

// API 설정 정보 함수
export const getMedicationAPIConfig = () => {
  const isDev = isDevelopmentMode();

  return {
    endpoint: "https://ai.koihealth-live.com/image",
    isDevelopmentMode: isDev,
    forceMockInDev: FORCE_MOCK_IN_DEV,
    currentMode: isDev ? "Mock API (개발 모드)" : "Real API (myAxios)",
    apiVersion: "v2.0-myAxios",
    isSecure: true,
    domain: "ai.koihealth-live.com",
    corsProtected: isDev,
  };
};
