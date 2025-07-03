import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Settings,
  Pause,
  Play,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wifi,
  Speaker,
  ChevronDown,
  Chrome,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { fetchVoiceResponse } from "../../../ai_health_care3/src/services/chatAPI";

// 마이크 권한 상태 타입
type PermissionState = "granted" | "denied" | "prompt" | "unknown";

// SpeechRecognition 타입 정의
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// 모바일 브라우저 감지 타입
interface BrowserSupport {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  userAgent: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
}

// 음성 설정 타입
interface VoiceSettings {
  selectedVoice: string;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

// 기본 음성 설정
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  selectedVoice: "",
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
  lang: "ko-KR",
};

export function VoiceQuestion() {
  // 상태 관리
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastResponse, setLastResponse] = useState(""); // AI 응답 저장
  const [error, setError] = useState<string | null>(null);

  // 마이크 권한 관련 상태
  const [micPermission, setMicPermission] =
    useState<PermissionState>("unknown");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  // Web API 상태
  const [recognition, setRecognition] =
    useState<SpeechRecognitionInstance | null>(null);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(
    null
  );
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // 모바일 음성 재생 관련 상태 - iOS + Android 공통
  const [speechPlaybackFailed, setSpeechPlaybackFailed] = useState(false);
  const [manualPlayEnabled, setManualPlayEnabled] = useState(false);
  const [mobileSpeechReady, setMobileSpeechReady] = useState(false); // 모바일 음성 완전 준비 상태

  // 음성 설정 상태
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    DEFAULT_VOICE_SETTINGS
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 제어 레퍼런스 - 모바일 공통
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isButtonPressedRef = useRef(false);
  const shouldProcessRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const isMouseDownRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const userGestureActiveRef = useRef(false); // 모바일 공통 사용자 제스처 추적
  const mobileSpeechActivatedRef = useRef(false); // 모바일 공통 음성 활성화 상태
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 제스처 유지 타이머

  // 음성 설정 로컬 스토리지 키
  const VOICE_SETTINGS_KEY = "voice-question-settings";

  // 브라우저 지원 감지 함수 (모바일 최적화)
  const detectBrowserSupport = useCallback((): BrowserSupport => {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);

    // 음성 인식 지원 확인 (모바일 고려)
    const speechRecognition = !!(
      (
        window as unknown as {
          SpeechRecognition?: unknown;
          webkitSpeechRecognition?: unknown;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: unknown;
          webkitSpeechRecognition?: unknown;
        }
      ).webkitSpeechRecognition
    );

    // 음성 합성 지원 확인
    const speechSynthesis = "speechSynthesis" in window;

    const support: BrowserSupport = {
      speechRecognition,
      speechSynthesis,
      userAgent,
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
    };

    console.log("🔍 브라우저 지원 감지:", support);
    return support;
  }, []);

  // 음성 설정 저장
  const saveVoiceSettings = useCallback((settings: VoiceSettings) => {
    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
      console.log("💾 음성 설정 저장됨:", settings);
    } catch (error) {
      console.warn("❌ 음성 설정 저장 실패:", error);
    }
  }, []);

  // 음성 설정 불러오기
  const loadVoiceSettings = useCallback((): VoiceSettings => {
    try {
      const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        console.log("📂 음성 설정 불러옴:", settings);
        return { ...DEFAULT_VOICE_SETTINGS, ...settings };
      }
    } catch (error) {
      console.warn("❌ 음성 설정 불러오기 실패:", error);
    }
    return DEFAULT_VOICE_SETTINGS;
  }, []);

  // 음성 설정 변경 핸들러
  const handleVoiceSettingChange = useCallback(
    (key: keyof VoiceSettings, value: string | number) => {
      const newSettings = { ...voiceSettings, [key]: value };
      setVoiceSettings(newSettings);
      saveVoiceSettings(newSettings);
      console.log(`🔧 음성 설정 변경: ${key} = ${value}`);
    },
    [voiceSettings, saveVoiceSettings]
  );

  // 강화된 사용자 제스처 유지 함수 (모바일 공통)
  const maintainUserGesture = useCallback(() => {
    if (!browserSupport?.isMobile) return;

    userGestureActiveRef.current = true;
    const platform = browserSupport.isIOS
      ? "iOS"
      : browserSupport.isAndroid
      ? "Android"
      : "Mobile";
    console.log(`📱 ${platform} 사용자 제스처 컨텍스트 활성화`);

    // 기존 타이머 정리
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }

    // 제스처 컨텍스트를 30초간 유지 (API 응답까지 충분한 시간)
    gestureTimeoutRef.current = setTimeout(() => {
      userGestureActiveRef.current = false;
      console.log(`📱 ${platform} 사용자 제스처 컨텍스트 만료`);
    }, 30000);
  }, [browserSupport]);

  // 모바일 음성 합성 강화된 초기화 함수 (iOS + Android 공통)
  const fullyActivateMobileSpeech = useCallback(async (): Promise<boolean> => {
    if (!browserSupport?.isMobile || mobileSpeechActivatedRef.current) {
      return mobileSpeechActivatedRef.current;
    }

    const platform = browserSupport.isIOS
      ? "iOS"
      : browserSupport.isAndroid
      ? "Android"
      : "Mobile";
    console.log(`📱 ${platform} 음성 합성 강화 초기화 시작`);

    return new Promise((resolve) => {
      try {
        // 1단계: 사용자 제스처 유지
        maintainUserGesture();

        // 2단계: 첫 번째 활성화 음성 (매우 짧고 조용하게)
        const activationUtterance = new SpeechSynthesisUtterance("");
        activationUtterance.volume = 0.01;
        activationUtterance.rate = 3.0;
        activationUtterance.pitch = 0.5;

        let activationComplete = false;

        activationUtterance.onstart = () => {
          console.log(`📱 ${platform} 1단계 활성화 음성 시작`);
          speechSynthesis.cancel(); // 즉시 중단

          if (!activationComplete) {
            activationComplete = true;

            // 3단계: 실제 테스트 음성으로 완전 활성화
            setTimeout(() => {
              const testUtterance = new SpeechSynthesisUtterance("테스트");
              testUtterance.volume = 0.01;
              testUtterance.rate = 2.0;

              // 설정된 음성 적용
              if (voiceSettings.selectedVoice && availableVoices.length > 0) {
                const selectedVoice = availableVoices.find(
                  (v) => v.name === voiceSettings.selectedVoice
                );
                if (selectedVoice) {
                  testUtterance.voice = selectedVoice;
                  console.log(
                    `📱 ${platform} 설정된 음성으로 테스트:`,
                    selectedVoice.name
                  );
                }
              } else {
                // 플랫폼별 기본 음성 선택
                const defaultVoice = availableVoices.find((voice) => {
                  if (browserSupport.isIOS) {
                    return (
                      voice.name.includes("유나") ||
                      voice.name.includes("수진") ||
                      voice.lang.includes("ko")
                    );
                  } else if (browserSupport.isAndroid) {
                    return (
                      voice.lang.includes("ko") ||
                      voice.name.toLowerCase().includes("korean")
                    );
                  }
                  return voice.lang.includes("ko");
                });

                if (defaultVoice) {
                  testUtterance.voice = defaultVoice;
                  console.log(
                    `📱 ${platform} 기본 음성 선택:`,
                    defaultVoice.name
                  );
                }
              }

              testUtterance.onstart = () => {
                console.log(`📱 ${platform} 2단계 테스트 음성 시작`);
                mobileSpeechActivatedRef.current = true;
                setMobileSpeechReady(true);

                setTimeout(() => {
                  speechSynthesis.cancel(); // 테스트 음성 중단
                  console.log(`✅ ${platform} 음성 합성 완전 활성화 완료`);
                  resolve(true);
                }, 100);
              };

              testUtterance.onerror = () => {
                console.warn(`⚠️ ${platform} 2단계 테스트 음성 실패`);
                resolve(false);
              };

              speechSynthesis.speak(testUtterance);
            }, 50);
          }
        };

        activationUtterance.onerror = () => {
          console.warn(`⚠️ ${platform} 1단계 활성화 음성 실패`);
          if (!activationComplete) {
            activationComplete = true;
            resolve(false);
          }
        };

        // 타임아웃 보호
        setTimeout(() => {
          if (!activationComplete) {
            activationComplete = true;
            console.warn(`⚠️ ${platform} 음성 활성화 타임아웃`);
            resolve(false);
          }
        }, 2000);

        speechSynthesis.speak(activationUtterance);
      } catch (error) {
        console.error(`❌ ${platform} 음성 합성 초기화 오류:`, error);
        resolve(false);
      }
    });
  }, [browserSupport, voiceSettings, availableVoices, maintainUserGesture]);

  // 음성 목록 로딩 (모바일 최적화)
  useEffect(() => {
    if (!browserSupport?.speechSynthesis) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log("🔊 사용 가능한 음성:", voices.length, "개");

      if (voices.length > 0) {
        setAvailableVoices(voices);
        setVoicesLoaded(true);

        // 플랫폼별 한국어 음성 로깅
        if (browserSupport.isMobile) {
          const koreanVoices = voices.filter(
            (voice) =>
              voice.lang.toLowerCase().includes("ko") ||
              voice.name.toLowerCase().includes("korean") ||
              voice.lang.toLowerCase().includes("kr") ||
              voice.name.includes("유나") ||
              voice.name.includes("수진") ||
              voice.name.includes("서현")
          );

          const platform = browserSupport.isIOS
            ? "iOS"
            : browserSupport.isAndroid
            ? "Android"
            : "Mobile";
          console.log(
            `📱 ${platform} 한국어 음성들:`,
            koreanVoices.map((v) => `${v.name} (${v.lang})`)
          );

          // 플랫폼별 최적 음성 찾기
          let optimalVoice = null;
          if (browserSupport.isIOS) {
            optimalVoice =
              voices.find((voice) => voice.name.includes("유나")) ||
              voices.find((voice) => voice.name.includes("수진"));
          } else if (browserSupport.isAndroid) {
            optimalVoice =
              voices.find((voice) => voice.lang.includes("ko-KR")) ||
              voices.find((voice) =>
                voice.name.toLowerCase().includes("korean")
              );
          }

          if (optimalVoice) {
            console.log(
              `📱 ${platform} 최적 음성 발견:`,
              optimalVoice.name,
              optimalVoice.lang
            );
            // 기본 설정되어 있지 않다면 설정
            if (!voiceSettings.selectedVoice && optimalVoice.name) {
              handleVoiceSettingChange("selectedVoice", optimalVoice.name);
            }
          }
        }
      }
    };

    // 즉시 로드 시도
    loadVoices();

    // 음성 목록 변경 시 다시 로드 (모바일에서 중요)
    speechSynthesis.onvoiceschanged = () => {
      console.log("🔊 음성 목록 변경됨 (모바일 최적화)");
      loadVoices();
    };

    // 모바일에서는 일정 시간 후에도 재시도
    if (browserSupport.isMobile) {
      const platform = browserSupport.isIOS
        ? "iOS"
        : browserSupport.isAndroid
        ? "Android"
        : "Mobile";

      const retryTimer = setTimeout(() => {
        if (!voicesLoaded) {
          console.log(`📱 ${platform} 음성 로드 재시도`);
          loadVoices();
        }
      }, 1000);

      const retryTimer2 = setTimeout(() => {
        if (!voicesLoaded) {
          console.log(`📱 ${platform} 음성 로드 재시도 2`);
          loadVoices();
        }
      }, 3000);

      return () => {
        clearTimeout(retryTimer);
        clearTimeout(retryTimer2);
      };
    }
  }, [
    browserSupport,
    voicesLoaded,
    voiceSettings.selectedVoice,
    handleVoiceSettingChange,
  ]);

  // 브라우저 지원 초기화
  useEffect(() => {
    const support = detectBrowserSupport();
    setBrowserSupport(support);

    // 음성 설정 불러오기
    const savedSettings = loadVoiceSettings();
    setVoiceSettings(savedSettings);

    // 모바일 브라우저별 특별 처리
    if (support.isMobile) {
      if (support.isIOS && support.isSafari && !support.speechRecognition) {
        setError(
          "iOS Safari는 음성 인식을 지원하지 않습니다. Chrome 앱을 사용해주세요."
        );
      } else if (
        support.isAndroid &&
        !support.isChrome &&
        !support.speechRecognition
      ) {
        setError(
          "Android에서는 Chrome 브라우저를 사용하시면 더 좋은 음성 인식 성능을 얻을 수 있습니다."
        );
      }
    }
  }, [detectBrowserSupport, loadVoiceSettings]);

  // 마이크 권한 확인 함수 (모바일 최적화)
  const checkMicrophonePermission =
    useCallback(async (): Promise<PermissionState> => {
      console.log("🔐 마이크 권한 확인 중... (모바일)");

      try {
        // 모바일에서 더 안전한 권한 확인
        if ("permissions" in navigator && "query" in navigator.permissions) {
          try {
            const permissionStatus = await navigator.permissions.query({
              name: "microphone" as PermissionName,
            });
            console.log(
              "🔐 Permissions API 결과 (모바일):",
              permissionStatus.state
            );
            return permissionStatus.state as PermissionState;
          } catch {
            console.log(
              "🔐 Permissions API 실패 (모바일), getUserMedia로 폴백"
            );
          }
        }

        // 모바일 브라우저에서 getUserMedia로 확인
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          stream.getTracks().forEach((track) => track.stop()); // 즉시 중지
          console.log("🔐 getUserMedia 성공 (모바일) - 권한 있음");
          return "granted";
        } catch (error: unknown) {
          const err = error as { name?: string };
          console.log("🔐 getUserMedia 실패 (모바일):", err.name);
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            return "denied";
          }
          return "prompt";
        }
      } catch (error) {
        console.error("🔐 권한 확인 오류 (모바일):", error);
        return "unknown";
      }
    }, []);

  // 마이크 권한 요청 함수 (모바일 최적화)
  const requestMicrophonePermission =
    useCallback(async (): Promise<PermissionState> => {
      console.log("🔐 마이크 권한 요청 중... (모바일)");
      setIsCheckingPermission(true);

      try {
        // 사용자 제스처 표시 (모바일 요구사항)
        maintainUserGesture();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // 모바일 최적화 설정
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        stream.getTracks().forEach((track) => track.stop()); // 즉시 중지
        console.log("✅ 마이크 권한 허용됨 (모바일)");
        setMicPermission("granted");
        setIsCheckingPermission(false);

        // 모바일에서 권한 허용 시 음성 합성 완전 활성화
        if (browserSupport?.isMobile) {
          setTimeout(async () => {
            const success = await fullyActivateMobileSpeech();
            const platform = browserSupport.isIOS
              ? "iOS"
              : browserSupport.isAndroid
              ? "Android"
              : "Mobile";
            console.log(
              `📱 ${platform} 권한 허용 후 음성 활성화 결과:`,
              success
            );
          }, 100);
        }

        return "granted";
      } catch (error: any) {
        console.error("❌ 마이크 권한 거부됨 (모바일):", error.name);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setMicPermission("denied");
          setIsCheckingPermission(false);
          return "denied";
        }
        setMicPermission("unknown");
        setIsCheckingPermission(false);
        return "unknown";
      }
    }, [browserSupport, fullyActivateMobileSpeech, maintainUserGesture]);

  // 전역 이벤트 리스너 설정 (모바일 최적화)
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isMouseDownRef.current) {
        console.log("🖱️ 전역 마우스 UP 감지 (모바일)");
        isMouseDownRef.current = false;
        isButtonPressedRef.current = false;

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        if (isListening) {
          console.log("🛑 전역 마우스 UP으로 인한 음성 인식 중지 (모바일)");
          stopListening();
        }
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isTouchActiveRef.current) {
        console.log("👆 전역 터치 END 감지 (모바일)");

        // 모바일 햅틱 피드백 (지원되는 경우)
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate(50); // 짧은 진동
          } catch (err) {
            console.log("진동 지원 안됨");
          }
        }

        isTouchActiveRef.current = false;
        isButtonPressedRef.current = false;

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        if (isListening) {
          console.log("🛑 전역 터치 END로 인한 음성 인식 중지 (모바일)");
          stopListening();
        }
      }
    };

    const handleGlobalTouchCancel = (e: TouchEvent) => {
      if (isTouchActiveRef.current) {
        console.log("👆 전역 터치 CANCEL 감지 (모바일)");
        isTouchActiveRef.current = false;
        isButtonPressedRef.current = false;

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        if (isListening) {
          console.log("🛑 전역 터치 CANCEL로 인한 음성 인식 중지 (모바일)");
          stopListening();
        }
      }
    };

    // 전역 이벤트 리스너 등록
    document.addEventListener("mouseup", handleGlobalMouseUp, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd, {
      passive: false,
    });
    document.addEventListener("touchcancel", handleGlobalTouchCancel, {
      passive: false,
    });

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchcancel", handleGlobalTouchCancel);
    };
  }, [isListening]);

  // 음성 인식 초기화 함수 분리
  const initializeSpeechRecognition = useCallback(() => {
    if (!browserSupport?.speechRecognition || micPermission !== "granted") {
      console.log("음성 인식 초기화 조건 불충족");
      return;
    }

    const SpeechRecognition =
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
          SpeechRecognition?: new () => SpeechRecognitionInstance;
        }
      ).webkitSpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
          SpeechRecognition?: new () => SpeechRecognitionInstance;
        }
      ).SpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition not available");
      return;
    }

    const recognitionInstance = new SpeechRecognition();

    // 모바일 최적화 음성 인식 설정
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = voiceSettings.lang;
    recognitionInstance.maxAlternatives = 1;

    // 모바일 성능 최적화
    if (browserSupport.isMobile) {
      recognitionInstance.continuous = true; // 모바일에서 더 안정적
      recognitionInstance.interimResults = true;
    }

    // 음성 인식 결과 처리
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      console.log(
        "📝 음성 인식 결과 이벤트 (모바일):",
        event.results.length,
        "개 결과"
      );

      let interimTranscript = "";
      let finalTranscriptText = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(
          `📝 결과 ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`
        );

        if (event.results[i].isFinal) {
          finalTranscriptText += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscriptText + interimTranscript;
      currentTranscriptRef.current = fullTranscript;
      setTranscription(fullTranscript);

      if (finalTranscriptText) {
        finalTranscriptRef.current += finalTranscriptText;
        setFinalTranscript((prev) => prev + finalTranscriptText);
        console.log(
          "✅ 최종 확정 텍스트 누적 (모바일):",
          finalTranscriptRef.current
        );
      }
    };

    // 음성 인식 시작
    recognitionInstance.onstart = () => {
      console.log("🎤 음성 인식 시작됨 (모바일)");
      setIsListening(true);
      setError(null);

      setTranscription("");
      setFinalTranscript("");
      currentTranscriptRef.current = "";
      finalTranscriptRef.current = "";
      console.log("🧹 음성 인식 텍스트 초기화 완료 (모바일)");
    };

    // 음성 인식 종료
    recognitionInstance.onend = () => {
      console.log("🎤 음성 인식 종료됨 (모바일)");
      setIsListening(false);

      if (shouldProcessRef.current) {
        console.log("🚀 API 호출 조건 확인 중... (모바일)");

        let textToProcess = "";

        if (finalTranscriptRef.current.trim()) {
          textToProcess = finalTranscriptRef.current.trim();
          console.log("✅ 최종 확정 텍스트 사용 (모바일):", textToProcess);
        } else if (currentTranscriptRef.current.trim()) {
          textToProcess = currentTranscriptRef.current.trim();
          console.log("✅ 현재 전체 텍스트 사용 (모바일):", textToProcess);
        } else if (finalTranscript.trim()) {
          textToProcess = finalTranscript.trim();
          console.log("✅ 상태 finalTranscript 사용 (모바일):", textToProcess);
        } else if (transcription.trim()) {
          textToProcess = transcription.trim();
          console.log("✅ 상태 transcription 사용 (모바일):", textToProcess);
        }

        if (textToProcess) {
          console.log("🚀 음성 API 호출 시작 (모바일):", textToProcess);
          processVoiceQuestion(textToProcess);
        } else {
          console.warn("❌ 처리할 텍스트가 없음 (모바일)");
          setError("음성이 인식되지 않았습니다. 더 명확하게 말씀해 주세요.");
        }

        shouldProcessRef.current = false;
      }
    };

    // 음성 인식 오류 처리 (모바일 최적화)
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("❌ 음성 인식 오류 (모바일):", event.error, event);

      let errorMessage = "음성 인식 오류가 발생했습니다.";
      switch (event.error) {
        case "no-speech":
          errorMessage = browserSupport.isMobile
            ? "음성이 감지되지 않았습니다. 마이크에 가까이 대고 다시 시도해주세요."
            : "음성이 감지되지 않았습니다. 다시 시도해주세요.";
          break;
        case "audio-capture":
          errorMessage = "마이크 접근 권한이 필요합니다.";
          break;
        case "not-allowed":
          errorMessage = browserSupport.isMobile
            ? "마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요."
            : "마이크 권한이 거부되었습니다. 설정에서 허용해주세요.";
          setMicPermission("denied");
          break;
        case "network":
          errorMessage = browserSupport.isMobile
            ? "네트워크 연결을 확인해주세요. Wi-Fi 또는 모바일 데이터를 확인하세요."
            : "네트워크 오류가 발생했습니다.";
          break;
        case "aborted":
          console.log("👆 사용자가 음성 인식을 중단했습니다 (모바일).");
          return;
      }

      setError(errorMessage);
      setIsListening(false);
      shouldProcessRef.current = false;
    };

    setRecognition(recognitionInstance);
    recognitionRef.current = recognitionInstance;
    console.log("🎤 음성 인식 초기화 완료 (새로운 인스턴스)");
  }, [
    browserSupport,
    micPermission,
    voiceSettings.lang,
    finalTranscript,
    transcription,
    processVoiceQuestion,
  ]);

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    const initializePermissions = async () => {
      const permission = await checkMicrophonePermission();
      setMicPermission(permission);
      console.log("🔐 초기 마이크 권한 상태 (모바일):", permission);
    };

    initializePermissions();
  }, [checkMicrophonePermission]);

  // Web Speech API 초기화 (모바일 최적화)
  useEffect(() => {
    if (!browserSupport) return;

    // 모바일 브라우저 호환성 확인
    if (browserSupport.isMobile && !browserSupport.speechRecognition) {
      if (browserSupport.isIOS && browserSupport.isSafari) {
        setError(
          "iOS Safari는 음성 인식을 지원하지 않습니다. Chrome 앱을 사용해주세요."
        );
      } else if (browserSupport.isAndroid) {
        setError(
          "Android에서는 Chrome 브라우저를 사용하시면 더 좋은 음성 인식 성능을 얻을 수 있습니다."
        );
      } else {
        setError("이 브라우저는 음성 인식을 지원하지 않습니다.");
      }
      return;
    }

    // 마이크 권한이 허용된 경우에만 음성 인식 초기화
    if (micPermission === "granted" && browserSupport.speechRecognition) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("🧹 Recognition cleanup (모바일):", error);
        }
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [micPermission, browserSupport, initializeSpeechRecognition]);

  // 강화된 음성 질문 처리 함수 (모바일 공통)
  const processVoiceQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) {
        console.warn("❌ 빈 질문으로 API 호출 시도 (모바일)");
        return;
      }

      const platform = browserSupport?.isIOS
        ? "iOS"
        : browserSupport?.isAndroid
        ? "Android"
        : "Mobile";
      console.log(`📱 ${platform} 음성 질문 처리 시작:`, question);
      setIsProcessing(true);
      setError(null);
      setLastQuestion(question);
      setSpeechPlaybackFailed(false);
      setManualPlayEnabled(false);

      setTranscription("");
      setFinalTranscript("");
      currentTranscriptRef.current = "";
      finalTranscriptRef.current = "";

      try {
        console.log("📞 fetchVoiceResponse 호출... (모바일)");

        // 강화된 사용자 제스처 유지 (API 호출 중에도)
        if (browserSupport?.isMobile) {
          maintainUserGesture();
          console.log(`📱 ${platform} API 호출 중 사용자 제스처 유지 활성화`);
        }

        const aiResponse = await fetchVoiceResponse(question);

        console.log(
          `✅ ${platform} 음성 AI 답변 받음:`,
          aiResponse.substring(0, 100) + "..."
        );

        setIsProcessing(false);
        setLastResponse(aiResponse); // 응답 저장

        // 모바일에서 강화된 자동 음성 재생 시도
        if (browserSupport?.isMobile) {
          console.log(`📱 ${platform} 강화된 음성 재생 시도`);
          console.log(
            `📱 ${platform} - 사용자 제스처 활성:`,
            userGestureActiveRef.current
          );
          console.log(
            `📱 ${platform} - 음성 합성 활성화:`,
            mobileSpeechActivatedRef.current
          );
          console.log(`📱 ${platform} - 음성 준비 상태:`, mobileSpeechReady);

          // 제스처가 활성화되어 있고 음성이 준비되었다면 즉시 재생
          if (userGestureActiveRef.current) {
            // 음성이 아직 활성화되지 않았다면 즉시 활성화
            if (!mobileSpeechActivatedRef.current) {
              console.log(`📱 ${platform} 즉시 음성 활성화 시도`);
              const activated = await fullyActivateMobileSpeech();
              if (!activated) {
                console.warn(`📱 ${platform} 즉시 음성 활성화 실패`);
              }
            }

            // 강화된 즉시 재생
            const success = await speakTextWithGesture(aiResponse);
            if (!success) {
              console.warn(
                `📱 ${platform} 강화된 자동 재생 실패, 수동 모드 활성화`
              );
              setSpeechPlaybackFailed(true);
              setManualPlayEnabled(true);
            }
          } else {
            console.log(`📱 ${platform} 사용자 제스처 만료, 수동 모드 활성화`);
            setSpeechPlaybackFailed(true);
            setManualPlayEnabled(true);
          }
        } else {
          // 데스크톱에서는 일반 자동 재생
          setTimeout(() => {
            console.log("🔊 음성 재생 시작 (데스크톱)");
            speakText(aiResponse);
          }, 100);
        }
      } catch (err) {
        console.error(`❌ ${platform} 음성 AI 응답 오류:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "음성 AI 서버에 연결할 수 없습니다.";
        setError(`음성 응답 오류: ${errorMessage}`);
        setIsProcessing(false);
      }
    },
    [
      browserSupport?.isIOS,
      browserSupport?.isAndroid,
      browserSupport?.isMobile,
      maintainUserGesture,
      mobileSpeechReady,
      fullyActivateMobileSpeech,
    ]
  );

  // 강화된 사용자 제스처 기반 음성 재생 함수 (모바일 공통)
  const speakTextWithGesture = useCallback(
    async (text: string): Promise<boolean> => {
      if (
        !browserSupport?.speechSynthesis ||
        !text.trim() ||
        !userGestureActiveRef.current
      ) {
        const platform = browserSupport?.isIOS
          ? "iOS"
          : browserSupport?.isAndroid
          ? "Android"
          : "Mobile";
        console.warn(`📱 ${platform} 음성 재생 조건 불충족`);
        return false;
      }

      const platform = browserSupport.isIOS
        ? "iOS"
        : browserSupport.isAndroid
        ? "Android"
        : "Mobile";
      console.log(
        `📱 ${platform} 강화된 제스처 기반 음성 재생 시작:`,
        text.substring(0, 50) + "..."
      );

      try {
        // 기존 음성 중지
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentUtterance(null);

        // 텍스트 정리
        const cleanText = text
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`(.*?)`/g, "$1")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // 강화된 음성 설정 적용
        utterance.rate = Math.max(0.5, Math.min(2.0, voiceSettings.rate));
        utterance.pitch = Math.max(0.5, Math.min(2.0, voiceSettings.pitch));
        utterance.volume = Math.max(0.1, Math.min(1.0, voiceSettings.volume));
        utterance.lang = voiceSettings.lang;

        // 설정된 음성 확실히 적용
        if (voiceSettings.selectedVoice && availableVoices.length > 0) {
          const selectedVoice = availableVoices.find(
            (v) => v.name === voiceSettings.selectedVoice
          );
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(
              `📱 ${platform} 강화 재생 - 선택된 음성 적용:`,
              selectedVoice.name
            );
          }
        } else {
          // 플랫폼별 기본 한국어 음성 선택
          let defaultVoice = null;
          if (browserSupport.isIOS) {
            defaultVoice = availableVoices.find(
              (voice) =>
                voice.name.includes("유나") ||
                voice.name.includes("수진") ||
                voice.lang.includes("ko")
            );
          } else if (browserSupport.isAndroid) {
            defaultVoice = availableVoices.find(
              (voice) =>
                voice.lang.includes("ko-KR") ||
                voice.name.toLowerCase().includes("korean")
            );
          }

          if (defaultVoice) {
            utterance.voice = defaultVoice;
            console.log(
              `📱 ${platform} 강화 재생 - 기본 한국어 음성 선택:`,
              defaultVoice.name
            );
          }
        }

        // 즉시 재생을 위한 Promise
        return new Promise((resolve) => {
          let resolved = false;
          let startTimeout: NodeJS.Timeout | null = null;

          utterance.onstart = () => {
            if (!resolved) {
              setIsSpeaking(true);
              setIsPaused(false);
              console.log(`📱 ${platform} 강화된 음성 재생 시작됨`);
              resolved = true;
              if (startTimeout) clearTimeout(startTimeout);
              resolve(true);
            }
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentUtterance(null);
            console.log(`📱 ${platform} 강화된 음성 재생 완료`);
          };

          utterance.onerror = (event) => {
            console.error(`📱 ${platform} 강화된 음성 재생 오류:`, event);
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentUtterance(null);
            if (!resolved) {
              resolved = true;
              if (startTimeout) clearTimeout(startTimeout);
              resolve(false);
            }
          };

          utterance.onpause = () => {
            setIsPaused(true);
            console.log(`📱 ${platform} 강화된 음성 일시정지`);
          };

          utterance.onresume = () => {
            setIsPaused(false);
            console.log(`📱 ${platform} 강화된 음성 재생 재개`);
          };

          setCurrentUtterance(utterance);

          // 강화된 즉시 실행 (사용자 제스처 컨텍스트에서)
          console.log(`📱 ${platform} 강화된 speechSynthesis.speak() 호출`);
          speechSynthesis.speak(utterance);

          // 2초 후에도 시작되지 않으면 실패로 간주
          startTimeout = setTimeout(() => {
            if (!resolved) {
              console.warn(`📱 ${platform} 강화된 음성 재생 타임아웃`);
              resolved = true;
              resolve(false);
            }
          }, 2000);
        });
      } catch (error) {
        console.error(`📱 ${platform} 강화된 음성 재생 오류:`, error);
        return false;
      }
    },
    [browserSupport, voiceSettings, availableVoices]
  );

  // 수동 음성 재생 함수 (모바일 공통) - 강화됨
  const handleManualPlay = useCallback(async () => {
    if (!lastResponse) return;

    const platform = browserSupport?.isIOS
      ? "iOS"
      : browserSupport?.isAndroid
      ? "Android"
      : "Mobile";
    console.log(`👆 사용자 수동 음성 재생 요청 (${platform} 강화)`);

    // 새로운 사용자 제스처 활성화
    maintainUserGesture();

    // 모바일 음성 합성 재활성화
    if (browserSupport?.isMobile) {
      console.log(`📱 ${platform} 수동 재생을 위한 음성 재활성화`);
      const activated = await fullyActivateMobileSpeech();
      if (activated) {
        console.log(`📱 ${platform} 음성 재활성화 성공, 재생 시작`);
        setSpeechPlaybackFailed(false);
        setManualPlayEnabled(false);

        const success = await speakTextWithGesture(lastResponse);
        if (!success) {
          console.warn(`📱 ${platform} 수동 재생도 실패, 일반 재생 시도`);
          speakText(lastResponse);
        }
      } else {
        console.warn(`📱 ${platform} 음성 재활성화 실패, 일반 재생 시도`);
        setSpeechPlaybackFailed(false);
        setManualPlayEnabled(false);
        speakText(lastResponse);
      }
    } else {
      setSpeechPlaybackFailed(false);
      setManualPlayEnabled(false);
      speakText(lastResponse);
    }
  }, [
    lastResponse,
    browserSupport,
    fullyActivateMobileSpeech,
    speakTextWithGesture,
    maintainUserGesture,
  ]);

  // 텍스트를 음성으로 변환 (모바일 최적화)
  const speakText = useCallback(
    (text: string) => {
      if (!browserSupport?.speechSynthesis || !("speechSynthesis" in window)) {
        console.warn("❌ 음성 합성이 지원되지 않습니다 (모바일).");
        return;
      }

      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);

      if (!text.trim()) return;

      const cleanText = text
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      console.log(
        "🔊 음성 재생 시작 (모바일):",
        cleanText.substring(0, 50) + "..."
      );

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // 모바일 최적화 음성 설정
      utterance.rate = Math.max(0.5, Math.min(2.0, voiceSettings.rate));
      utterance.pitch = Math.max(0.5, Math.min(2.0, voiceSettings.pitch));
      utterance.volume = Math.max(0.1, Math.min(1.0, voiceSettings.volume));
      utterance.lang = voiceSettings.lang;

      // 설정된 음성 적용
      if (voiceSettings.selectedVoice && availableVoices.length > 0) {
        const selectedVoice = availableVoices.find(
          (v) => v.name === voiceSettings.selectedVoice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log("🔊 선택된 음성 적용:", selectedVoice.name);
        }
      } else if (browserSupport?.isMobile && availableVoices.length > 0) {
        // 플랫폼별 기본 한국어 음성 선택
        try {
          let koreanVoice = null;
          if (browserSupport.isIOS) {
            koreanVoice = availableVoices.find(
              (voice) =>
                voice.name.includes("유나") ||
                voice.name.includes("수진") ||
                voice.lang.includes("ko")
            );
          } else if (browserSupport.isAndroid) {
            koreanVoice = availableVoices.find(
              (voice) =>
                voice.lang.includes("ko-KR") ||
                voice.name.toLowerCase().includes("korean")
            );
          }

          if (koreanVoice) {
            utterance.voice = koreanVoice;
            const platform = browserSupport.isIOS ? "iOS" : "Android";
            console.log(`🔊 ${platform} 한국어 음성 선택:`, koreanVoice.name);
          }
        } catch (voiceError) {
          console.log("🔊 음성 선택 오류 (모바일), 기본 음성 사용");
        }
      }

      // 이벤트 리스너 (모바일 최적화)
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        console.log("🔊 음성 재생 시작됨 (모바일)");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        console.log("🔊 음성 재생 완료 (모바일)");
      };

      utterance.onerror = (event) => {
        console.error("🔊 음성 재생 오류 (모바일):", event);
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentUtterance(null);

        const errorMsg = browserSupport?.isMobile
          ? "음성 재생 중 오류가 발생했습니다. 볼륨을 확인하고 다시 시도해주세요."
          : "음성 재생 중 오류가 발생했습니다.";
        setError(errorMsg);
      };

      utterance.onpause = () => {
        setIsPaused(true);
        console.log("🔊 음성 일시정지 (모바일)");
      };

      utterance.onresume = () => {
        setIsPaused(false);
        console.log("🔊 음성 재생 재개 (모바일)");
      };

      setCurrentUtterance(utterance);

      // 모바일에서 더 안정적인 음성 재생
      try {
        speechSynthesis.speak(utterance);

        // 모바일에서 음성 합성이 시작되지 않을 때 대비
        setTimeout(() => {
          if (!isSpeaking && speechSynthesis.speaking) {
            setIsSpeaking(true);
            console.log("🔊 모바일 지연 음성 재생 감지");
          }
        }, 500);
      } catch (error) {
        console.error("❌ Speech synthesis error (모바일):", error);
        setError("음성 재생을 시작할 수 없습니다.");
        setIsSpeaking(false);
        setCurrentUtterance(null);
      }
    },
    [browserSupport, voiceSettings, availableVoices]
  );

  // 음성 제어 함수들
  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  };

  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  // 음성 인식 시작
  const startListening = useCallback(() => {
    console.log("🎤 음성 인식 시작 시도 (모바일)");

    if (!recognition || isProcessing || isSpeaking) {
      console.log("🚫 음성 인식 시작 불가 - 다른 작업 진행 중 (모바일)");
      return;
    }

    if (isListening) {
      console.log("🚫 이미 음성 인식 중 (모바일)");
      return;
    }

    try {
      shouldProcessRef.current = false;
      setError(null);

      console.log("🚀 음성 인식 시작 명령 전송 (모바일)");
      recognition.start();
    } catch (error) {
      console.error("❌ 음성 인식 시작 오류 (모바일):", error);
      setError("음성 인식을 시작할 수 없습니다.");
    }
  }, [recognition, isProcessing, isSpeaking, isListening]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    console.log("🛑 음성 인식 중지 시도 (모바일)");

    if (!recognition || !isListening) {
      console.log("🚫 음성 인식 중지 불가 - 음성 인식 중이 아님 (모바일)");
      return;
    }

    try {
      shouldProcessRef.current = true;
      console.log("✅ shouldProcessRef를 true로 설정 - API 호출 예정 (모바일)");

      recognition.stop();
      console.log("🛑 음성 인식 중지 명령 전송됨 (모바일)");
    } catch (error) {
      console.error("❌ 음성 인식 중지 오류 (모바일):", error);
      shouldProcessRef.current = false;
    }
  }, [recognition, isListening]);

  // 마이크 버튼 마우스 이벤트 처리 (데스크톱용)
  const handleMicMouseDown = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      console.log("🖱️ 마우스 DOWN - 마이크 버튼");

      if (isProcessing || isSpeaking) {
        console.log("🚫 마이크 버튼 무시 - 다른 작업 진행 중");
        return;
      }

      // 권한 확인
      if (micPermission !== "granted") {
        console.log("🔐 마이크 권한 없음 - 권한 모달 표시");
        setIsPermissionModalOpen(true);
        return;
      }

      // 강화된 사용자 제스처 유지
      maintainUserGesture();

      // 모바일 음성 합성 완전 활성화
      if (browserSupport?.isMobile && !mobileSpeechActivatedRef.current) {
        const platform = browserSupport.isIOS
          ? "iOS"
          : browserSupport.isAndroid
          ? "Android"
          : "Mobile";
        console.log(`📱 ${platform} 마우스 DOWN - 음성 활성화 시작`);
        const activated = await fullyActivateMobileSpeech();
        console.log(
          `📱 ${platform} 마우스 DOWN - 음성 활성화 결과:`,
          activated
        );
      }

      isMouseDownRef.current = true;
      isButtonPressedRef.current = true;
      shouldProcessRef.current = false;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      longPressTimerRef.current = setTimeout(() => {
        if (isButtonPressedRef.current && isMouseDownRef.current) {
          console.log("⏰ 마우스 Long press 감지 - 음성 인식 시작");
          startListening();
        }
      }, 150);
    },
    [
      isProcessing,
      isSpeaking,
      micPermission,
      startListening,
      browserSupport,
      fullyActivateMobileSpeech,
      maintainUserGesture,
    ]
  );

  const handleMicMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      console.log("🖱️ 마우스 UP - 마이크 버튼");

      isMouseDownRef.current = false;
      isButtonPressedRef.current = false;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (isListening) {
        console.log("🛑 마우스 UP으로 인한 음성 인식 중지");
        stopListening();
      }
    },
    [isListening, stopListening]
  );

  // 강화된 마이크 버튼 터치 이벤트 처리 (모바일 공통 최적화)
  const handleMicTouchStart = useCallback(
    async (e: React.TouchEvent) => {
      e.preventDefault();
      const platform = browserSupport?.isIOS
        ? "iOS"
        : browserSupport?.isAndroid
        ? "Android"
        : "Mobile";
      console.log(`👆 터치 START - 마이크 버튼 (${platform} 강화)`);

      if (isProcessing || isSpeaking) {
        console.log(`🚫 마이크 버튼 무시 - 다른 작업 진행 중 (${platform})`);
        return;
      }

      // 권한 확인
      if (micPermission !== "granted") {
        console.log(`🔐 마이크 권한 없음 - 권한 모달 표시 (${platform})`);
        setIsPermissionModalOpen(true);
        return;
      }

      // 모바일 햅틱 피드백
      if ("vibrate" in navigator) {
        try {
          navigator.vibrate(30); // 시작 진동
        } catch (err) {
          console.log("진동 지원 안됨");
        }
      }

      // 강화된 사용자 제스처 유지 (매우 중요!)
      maintainUserGesture();
      console.log(`📱 ${platform} 터치 START - 강화된 사용자 제스처 활성화`);

      // 모바일 음성 합성 완전 활성화 (백그라운드에서)
      if (browserSupport?.isMobile) {
        console.log(
          `📱 ${platform} 터치 START - 음성 활성화 상태 확인:`,
          mobileSpeechActivatedRef.current
        );
        if (!mobileSpeechActivatedRef.current) {
          console.log(
            `📱 ${platform} 터치 START - 음성 활성화 시작 (백그라운드)`
          );
          // 백그라운드에서 활성화 (음성 인식과 병렬로)
          fullyActivateMobileSpeech().then((activated) => {
            console.log(
              `📱 ${platform} 터치 START - 백그라운드 음성 활성화 결과:`,
              activated
            );
          });
        }
      }

      isTouchActiveRef.current = true;
      isButtonPressedRef.current = true;
      shouldProcessRef.current = false;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      // 모바일에서는 더 빠른 반응성을 위해 100ms로 설정
      longPressTimerRef.current = setTimeout(() => {
        if (isButtonPressedRef.current && isTouchActiveRef.current) {
          console.log(
            `⏰ 터치 Long press 감지 - 음성 인식 시작 (${platform} 강화)`
          );

          // 모바일 추가 햅틱 피드백
          if ("vibrate" in navigator) {
            try {
              navigator.vibrate(50); // 시작 확인 진동
            } catch (err) {
              console.log("진동 지원 안됨");
            }
          }

          startListening();
        }
      }, 100); // 모바일 최적화: 100ms
    },
    [
      isProcessing,
      isSpeaking,
      micPermission,
      startListening,
      browserSupport,
      fullyActivateMobileSpeech,
      maintainUserGesture,
    ]
  );

  const handleMicTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const platform = browserSupport?.isIOS
        ? "iOS"
        : browserSupport?.isAndroid
        ? "Android"
        : "Mobile";
      console.log(`👆 터치 END - 마이크 버튼 (${platform} 강화)`);

      isTouchActiveRef.current = false;
      isButtonPressedRef.current = false;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (isListening) {
        console.log(`🛑 터치 END로 인한 음성 인식 중지 (${platform} 강화)`);
        stopListening();
      }
    },
    [isListening, stopListening, browserSupport]
  );

  // 권한 요청 처리
  const handleRequestPermission = async () => {
    const permission = await requestMicrophonePermission();
    if (permission === "granted") {
      setIsPermissionModalOpen(false);
      // 페이지 새로고침 대신 즉시 음성 인식 재초기화
      setTimeout(() => {
        // 음성 인식 재초기화 (페이지 새로고침 없이)
        initializeSpeechRecognition();
      }, 500);
    }
  };

  // 음성 인식 초기화 함수 분리
  const initializeSpeechRecognition = useCallback(() => {
    if (!browserSupport?.speechRecognition || micPermission !== "granted") {
      console.log("음성 인식 초기화 조건 불충족");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    // 모바일 최적화 음성 인식 설정
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = voiceSettings.lang;
    recognitionInstance.maxAlternatives = 1;

    // 모바일 성능 최적화
    if (browserSupport.isMobile) {
      recognitionInstance.continuous = true; // 모바일에서 더 안정적
      recognitionInstance.interimResults = true;
    }

    // 음성 인식 결과 처리
    recognitionInstance.onresult = (event: any) => {
      console.log(
        "📝 음성 인식 결과 이벤트 (모바일):",
        event.results.length,
        "개 결과"
      );

      let interimTranscript = "";
      let finalTranscriptText = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(
          `📝 결과 ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`
        );

        if (event.results[i].isFinal) {
          finalTranscriptText += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscriptText + interimTranscript;
      currentTranscriptRef.current = fullTranscript;
      setTranscription(fullTranscript);

      if (finalTranscriptText) {
        finalTranscriptRef.current += finalTranscriptText;
        setFinalTranscript((prev) => prev + finalTranscriptText);
        console.log(
          "✅ 최종 확정 텍스트 누적 (모바일):",
          finalTranscriptRef.current
        );
      }
    };

    // 음성 인식 시작
    recognitionInstance.onstart = () => {
      console.log("🎤 음성 인식 시작됨 (모바일)");
      setIsListening(true);
      setError(null);

      setTranscription("");
      setFinalTranscript("");
      currentTranscriptRef.current = "";
      finalTranscriptRef.current = "";
      console.log("🧹 음성 인식 텍스트 초기화 완료 (모바일)");
    };

    // 음성 인식 종료
    recognitionInstance.onend = () => {
      console.log("🎤 음성 인식 종료됨 (모바일)");
      setIsListening(false);

      if (shouldProcessRef.current) {
        console.log("🚀 API 호출 조건 확인 중... (모바일)");

        let textToProcess = "";

        if (finalTranscriptRef.current.trim()) {
          textToProcess = finalTranscriptRef.current.trim();
          console.log("✅ 최종 확정 텍스트 사용 (모바일):", textToProcess);
        } else if (currentTranscriptRef.current.trim()) {
          textToProcess = currentTranscriptRef.current.trim();
          console.log("✅ 현재 전체 텍스트 사용 (모바일):", textToProcess);
        } else if (finalTranscript.trim()) {
          textToProcess = finalTranscript.trim();
          console.log("✅ 상태 finalTranscript 사용 (모바일):", textToProcess);
        } else if (transcription.trim()) {
          textToProcess = transcription.trim();
          console.log("✅ 상태 transcription 사용 (모바일):", textToProcess);
        }

        if (textToProcess) {
          console.log("🚀 음성 API 호출 시작 (모바일):", textToProcess);
          processVoiceQuestion(textToProcess);
        } else {
          console.warn("❌ 처리할 텍스트가 없음 (모바일)");
          setError("음성이 인식되지 않았습니다. 더 명확하게 말씀해 주세요.");
        }

        shouldProcessRef.current = false;
      }
    };

    // 음성 인식 오류 처리 (모바일 최적화)
    recognitionInstance.onerror = (event: any) => {
      console.error("❌ 음성 인식 오류 (모바일):", event.error, event);

      let errorMessage = "음성 인식 오류가 발생했습니다.";
      switch (event.error) {
        case "no-speech":
          errorMessage = browserSupport.isMobile
            ? "음성이 감지되지 않았습니다. 마이크에 가까이 대고 다시 시도해주세요."
            : "음성이 감지되지 않았습니다. 다시 시도해주세요.";
          break;
        case "audio-capture":
          errorMessage = "마이크 접근 권한이 필요합니다.";
          break;
        case "not-allowed":
          errorMessage = browserSupport.isMobile
            ? "마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요."
            : "마이크 권한이 거부되었습니다. 설정에서 허용해주세요.";
          setMicPermission("denied");
          break;
        case "network":
          errorMessage = browserSupport.isMobile
            ? "네트워크 연결을 확인해주세요. Wi-Fi 또는 모바일 데이터를 확인하세요."
            : "네트워크 오류가 발생했습니다.";
          break;
        case "aborted":
          console.log("👆 사용자가 음성 인식을 중단했습니다 (모바일).");
          return;
      }

      setError(errorMessage);
      setIsListening(false);
      shouldProcessRef.current = false;
    };

    setRecognition(recognitionInstance);
    recognitionRef.current = recognitionInstance;
    console.log("🎤 음성 인식 초기화 완료 (새로운 인스턴스)");
  }, [
    browserSupport?.speechRecognition,
    browserSupport?.isMobile,
    micPermission,
    voiceSettings.lang,
    finalTranscript,
    transcription,
    processVoiceQuestion,
  ]);

  // 권한 상태에 따른 마이크 버튼 색상 및 아이콘
  const getMicButtonStyle = () => {
    if (isListening) {
      return "bg-red-500 glow-primary animate-pulse scale-110 shadow-2xl";
    } else if (isProcessing) {
      return "bg-yellow-500 animate-pulse shadow-xl";
    } else if (isSpeaking) {
      return "bg-green-500 animate-pulse shadow-xl";
    } else if (micPermission === "denied") {
      return "bg-red-600/20 border-2 border-red-500 hover:bg-red-600/30";
    } else if (micPermission === "granted") {
      return "bg-primary/10 hover:bg-primary/20 hover:scale-105 active:scale-95";
    } else {
      return "bg-gray-500/20 border-2 border-gray-500";
    }
  };

  const getMicIcon = () => {
    if (isListening) {
      return <MicOff className="w-16 h-16 text-white drop-shadow-lg" />;
    } else if (isProcessing) {
      return (
        <RefreshCw className="w-16 h-16 text-white animate-spin drop-shadow-lg" />
      );
    } else if (isSpeaking) {
      return <Volume2 className="w-16 h-16 text-white drop-shadow-lg" />;
    } else if (micPermission === "denied") {
      return <ShieldAlert className="w-16 h-16 text-red-500 drop-shadow-sm" />;
    } else if (micPermission === "granted") {
      return <Mic className="w-16 h-16 text-primary drop-shadow-sm" />;
    } else {
      return <Shield className="w-16 h-16 text-gray-500 drop-shadow-sm" />;
    }
  };

  // 모바일 상태 표시 컴포넌트 (강화됨)
  const renderMobileStatus = () => {
    if (!browserSupport) return null;

    return (
      <div className="bg-gradient-to-r from-muted/10 to-muted/20 p-3 rounded-lg border border-border/30 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {browserSupport.isMobile ? "모바일" : "데스크톱"} •
            {browserSupport.isIOS
              ? " iOS"
              : browserSupport.isAndroid
              ? " Android"
              : " PC"}{" "}
            •
            {browserSupport.isChrome
              ? " Chrome"
              : browserSupport.isSafari
              ? " Safari"
              : " Other"}
          </span>
          {browserSupport.speechRecognition && (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-3 h-3" />
              <span>음성 지원</span>
            </div>
          )}
          {browserSupport.isMobile && mobileSpeechReady && (
            <div className="flex items-center gap-1 text-blue-600">
              <Speaker className="w-3 h-3" />
              <span>{browserSupport.isIOS ? "iOS" : "Android"} 완전준비</span>
            </div>
          )}
          {browserSupport.isMobile && userGestureActiveRef.current && (
            <div className="flex items-center gap-1 text-green-600">
              <Zap className="w-3 h-3" />
              <span>제스처 활성</span>
            </div>
          )}
          {browserSupport.isAndroid && browserSupport.isChrome && (
            <div className="flex items-center gap-1 text-green-600">
              <Chrome className="w-3 h-3" />
              <span>Chrome 최적화</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 한국어 음성 목록 가져오기 (플랫폼별 최적화)
  const getKoreanVoices = () => {
    return availableVoices.filter(
      (voice) =>
        voice.lang.toLowerCase().includes("ko") ||
        voice.name.toLowerCase().includes("korean") ||
        voice.lang.toLowerCase().includes("kr") ||
        voice.name.includes("유나") ||
        voice.name.includes("수진") ||
        voice.name.includes("서현") ||
        voice.name.includes("민영")
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 권한 요청 모달 (모바일 최적화) */}
      <Dialog
        open={isPermissionModalOpen}
        onOpenChange={setIsPermissionModalOpen}
      >
        <DialogContent className="card-elevated border-glow max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-yellow-500" />
              마이크 권한 필요
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>음성 질문 기능을 사용하려면 마이크 권한이 필요합니다.</p>

              {browserSupport?.isMobile && (
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-400 font-medium mb-2">
                    📱{" "}
                    {browserSupport.isIOS
                      ? "iOS"
                      : browserSupport.isAndroid
                      ? "Android"
                      : "Mobile"}{" "}
                    권한 허용 방법:
                  </p>
                  <div className="text-sm space-y-1">
                    {browserSupport.isIOS ? (
                      <>
                        <p>• 브라우저 주소창 왼쪽 "AA" 아이콘 터치</p>
                        <p>• "웹사이트 설정" 선택</p>
                        <p>• "마이크" 설정을 "허용"으로 변경</p>
                      </>
                    ) : browserSupport.isAndroid ? (
                      <>
                        <p>• 주소창 왼쪽 자물쇠 🔒 아이콘 터치</p>
                        <p>• "권한" 또는 "사이트 설정" 선택</p>
                        <p>• "마이크" 권한을 "허용"으로 변경</p>
                        <p>• Chrome 브라우저 사용 권장</p>
                      </>
                    ) : (
                      <>
                        <p>• 주소창 왼쪽 자물쇠 🔒 아이콘 터치</p>
                        <p>• "권한" 또는 "사이트 설정" 선택</p>
                        <p>• "마이크" 권한을 "허용"으로 변경</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <p className="font-medium text-foreground">
                  일반적인 권한 허용 방법:
                </p>
                <div className="text-sm space-y-2">
                  <p>• 브라우저 주소창 옆 🔒 아이콘 클릭/터치</p>
                  <p>• "마이크" 또는 "Microphone" 설정 변경</p>
                  <p>• "허용" 또는 "Allow" 선택</p>
                  <p>• 페이지 새로고침</p>
                </div>
              </div>

              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400">
                  💡 <strong>팁:</strong> 권한을 허용한 후 아래 버튼을 눌러 다시
                  시도해보세요.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleRequestPermission}
              disabled={isCheckingPermission}
              className="gradient-primary text-white"
            >
              {isCheckingPermission ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  권한 확인 중...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  권한 다시 요청
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPermissionModalOpen(false)}
            >
              나중에 하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Mic className="w-6 h-6" />
            음성 질문
            <Badge
              variant="outline"
              className="text-xs bg-green-500/20 text-primary-foreground border-green-500/30"
            >
              <Zap className="w-3 h-3 mr-1" />
              음성 전용 AI
            </Badge>
            {micPermission === "granted" && (
              <Badge
                variant="outline"
                className="text-xs bg-green-500/20 text-primary-foreground border-green-500/30"
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                권한 허용됨
              </Badge>
            )}
            {browserSupport?.isMobile && mobileSpeechReady && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-500/20 text-primary-foreground border-blue-500/30"
              >
                📱 {browserSupport.isIOS ? "iOS" : "Android"} 완전준비
              </Badge>
            )}
          </h1>
          <p className="text-primary-foreground/80">
            {micPermission === "granted"
              ? browserSupport?.isMobile
                ? "마이크 버튼을 터치해서 질문하면 AI가 음성으로만 답변합니다"
                : "마이크 버튼을 눌러 질문하면 AI가 음성으로만 답변합니다"
              : "음성 질문을 사용하려면 마이크 권한이 필요합니다"}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        {/* 모바일 상태 표시 */}
        {renderMobileStatus()}

        {/* 메인 음성 인터페이스 */}
        <Card className="card-elevated border-glow mb-6">
          <CardContent className="p-8 text-center">
            {/* 마이크 버튼 (모바일 최적화) */}
            <div className="relative mb-8">
              <div
                className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none ${getMicButtonStyle()}`}
                onMouseDown={
                  !browserSupport?.isMobile ? handleMicMouseDown : undefined
                }
                onMouseUp={
                  !browserSupport?.isMobile ? handleMicMouseUp : undefined
                }
                onTouchStart={
                  browserSupport?.isMobile ? handleMicTouchStart : undefined
                }
                onTouchEnd={
                  browserSupport?.isMobile ? handleMicTouchEnd : undefined
                }
                onTouchCancel={
                  browserSupport?.isMobile ? handleMicTouchEnd : undefined
                }
                style={{
                  userSelect: "none",
                  touchAction: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                }}
              >
                {getMicIcon()}
              </div>

              {/* 음성 인식 중 링 애니메이션 */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
                  <div
                    className="absolute inset-2 rounded-full border-2 border-red-400 animate-ping opacity-50"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute inset-4 rounded-full border border-red-300 animate-ping opacity-25"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </>
              )}
            </div>

            {/* 상태 표시 */}
            <div className="mb-6 min-h-[100px] flex flex-col justify-center">
              {/* 브라우저 지원 안내 */}
              {browserSupport && !browserSupport.speechRecognition && (
                <div className="space-y-3 animate-fade-in">
                  <Badge className="bg-orange-500 text-white text-base px-6 py-2 shadow-lg">
                    {browserSupport.isIOS && browserSupport.isSafari
                      ? "⚠️ iOS Safari는 음성 인식 미지원"
                      : browserSupport.isAndroid
                      ? "⚠️ Android Chrome 브라우저 권장"
                      : "⚠️ 음성 인식 미지원 브라우저"}
                  </Badge>
                  <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                    <p className="text-sm text-orange-400 font-medium mb-2">
                      권장 브라우저:
                    </p>
                    <div className="text-sm space-y-1">
                      {browserSupport.isIOS ? (
                        <>
                          <p>• iPhone/iPad: Chrome 앱 사용 권장</p>
                          <p>• Safari에서는 음성 기능이 제한됩니다</p>
                        </>
                      ) : browserSupport.isAndroid ? (
                        <>
                          <p>• Android: Chrome 브라우저 사용 권장</p>
                          <p>• 더 나은 음성 인식 성능을 제공합니다</p>
                        </>
                      ) : (
                        <>
                          <p>• PC: Chrome, Edge, Firefox</p>
                          <p>• 모바일: Chrome 브라우저</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 모바일 음성 재생 실패시 수동 재생 버튼 - 강화된 메시지 */}
              {speechPlaybackFailed && manualPlayEnabled && lastResponse && (
                <div className="space-y-3 animate-fade-in">
                  <Badge className="bg-blue-500 text-white text-base px-6 py-2 shadow-lg">
                    📱{" "}
                    {browserSupport?.isIOS
                      ? "iOS"
                      : browserSupport?.isAndroid
                      ? "Android"
                      : "Mobile"}{" "}
                    음성 재생 준비됨
                  </Badge>
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-blue-400 mb-3">
                      AI 답변이 완료되었습니다. 버튼을 터치하면 다음 질문부터는
                      자동으로 음성 재생됩니다.
                    </p>
                    <Button
                      onClick={handleManualPlay}
                      className="gradient-primary text-white w-full"
                      size="lg"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      음성으로 듣기 (다음부터 자동)
                    </Button>
                  </div>
                </div>
              )}

              {/* 권한 없음 상태 */}
              {browserSupport?.speechRecognition &&
                micPermission !== "granted" &&
                !speechPlaybackFailed && (
                  <div className="space-y-3 animate-fade-in">
                    <Badge
                      className={`text-base px-6 py-2 shadow-lg ${
                        micPermission === "denied"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {micPermission === "denied"
                        ? "🚫 마이크 권한이 거부됨"
                        : "🔐 마이크 권한 확인 필요"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {browserSupport.isMobile
                        ? "마이크 버튼을 터치하여 권한 설정을 확인하세요"
                        : "마이크 버튼을 클릭하여 권한 설정을 확인하세요"}
                    </p>
                  </div>
                )}

              {/* 음성 인식 중 */}
              {isListening && micPermission === "granted" && (
                <div className="space-y-3 animate-fade-in">
                  <Badge className="bg-red-500 text-white text-base px-6 py-2 shadow-lg">
                    {browserSupport?.isMobile
                      ? "🎤 듣고 있습니다... 질문이 끝나면 손을 떼세요"
                      : "🎤 듣고 있습니다... 질문이 끝나면 버튼에서 손을 떼세요"}
                  </Badge>
                  {transcription && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-red-500/20">
                      <p className="text-sm text-muted-foreground mb-2">
                        실시간 음성 인식:
                      </p>
                      <p className="text-lg font-medium text-red-600 leading-relaxed">
                        "{transcription}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* AI 처리 중 */}
              {isProcessing && (
                <div className="space-y-4 animate-fade-in">
                  <Badge className="bg-yellow-500 text-white text-base px-6 py-2 shadow-lg">
                    🤖 AI가 답변을 준비하고 있습니다...
                  </Badge>
                  {lastQuestion && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-yellow-500/20">
                      <p className="text-sm text-muted-foreground mb-2">
                        처리 중인 질문:
                      </p>
                      <p className="text-lg font-medium text-yellow-600 leading-relaxed">
                        "{lastQuestion}"
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span>음성 전용 AI 처리 중...</span>
                    {browserSupport?.isMobile && (
                      <span className="text-xs">
                        📱 {browserSupport.isIOS ? "iOS" : "Android"} 자동재생
                        준비 중...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 음성 재생 중 */}
              {isSpeaking && (
                <div className="space-y-4 animate-fade-in">
                  <Badge className="bg-green-500 text-white text-base px-6 py-2 shadow-lg">
                    🔊 AI가 음성으로 답변하고 있습니다...
                  </Badge>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={isPaused ? resumeSpeech : pauseSpeech}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 shadow-sm"
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      {isPaused ? "재생" : "일시정지"}
                    </Button>
                    <Button
                      onClick={stopSpeaking}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 border-red-200 shadow-sm"
                    >
                      <VolumeX className="w-4 h-4" />
                      중단
                    </Button>
                  </div>
                </div>
              )}

              {/* 준비 완료 상태 */}
              {!isListening &&
                !isProcessing &&
                !isSpeaking &&
                !speechPlaybackFailed &&
                micPermission === "granted" &&
                browserSupport?.speechRecognition && (
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      className="text-base px-6 py-2 shadow-sm"
                    >
                      {browserSupport.isMobile
                        ? "🎯 준비됨 - 마이크 버튼을 터치해서 음성으로 질문하세요"
                        : "🎯 준비됨 - 마이크 버튼을 눌러 음성으로 질문하세요"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      음성 전용 모드: AI가 텍스트 없이 음성으로만 답변합니다
                      {browserSupport.isMobile &&
                        mobileSpeechReady &&
                        ` (${
                          browserSupport.isIOS ? "iOS" : "Android"
                        } 자동재생 준비완료)`}
                    </p>
                  </div>
                )}
            </div>

            {/* 사용 안내 (모바일 최적화) */}
            <div className="bg-gradient-to-r from-muted/20 to-muted/30 p-5 rounded-xl mb-6 border border-border/50">
              <div className="text-sm text-muted-foreground space-y-3">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  {browserSupport?.isMobile
                    ? `${
                        browserSupport.isIOS
                          ? "iOS"
                          : browserSupport.isAndroid
                          ? "Android"
                          : "Mobile"
                      } 음성 사용법`
                    : "음성 전용 사용법"}
                  {browserSupport?.isMobile && mobileSpeechReady && (
                    <span className="text-xs text-blue-400">
                      📱 {browserSupport.isIOS ? "iOS" : "Android"} 자동재생
                      준비완료
                    </span>
                  )}
                </p>
                <div className="text-left space-y-2 pl-6">
                  {micPermission === "granted" &&
                  browserSupport?.speechRecognition ? (
                    <>
                      {browserSupport.isMobile ? (
                        <>
                          <p>
                            • <strong>마이크 버튼을 터치하고 유지</strong>하며
                            질문하세요
                          </p>
                          <p>
                            • 질문이 끝나면 <strong>손을 떼세요</strong>
                          </p>
                          <p>
                            • 버튼 영역을 벗어나도{" "}
                            <strong>손을 떼면 인식</strong>됩니다
                          </p>
                          {browserSupport.isIOS ? (
                            <p>
                              • iOS에서{" "}
                              <strong>
                                {mobileSpeechReady
                                  ? "첫 질문부터 자동 음성 재생"
                                  : "첫 질문은 수동, 이후 자동 재생"}
                              </strong>
                            </p>
                          ) : browserSupport.isAndroid ? (
                            <p>
                              • Android에서{" "}
                              <strong>
                                {mobileSpeechReady
                                  ? "첫 질문부터 자동 음성 재생"
                                  : "첫 질문은 수동, 이후 자동 재생"}
                              </strong>
                            </p>
                          ) : (
                            <p>• 모바일에서 자동 음성 재생</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p>
                            • <strong>마이크 버튼을 누르고 유지</strong>하며
                            질문하세요
                          </p>
                          <p>
                            • 질문이 끝나면{" "}
                            <strong>버튼에서 손을 떼세요</strong>
                          </p>
                          <p>
                            • 버튼 영역을 벗어나도{" "}
                            <strong>손을 떼면 인식</strong>됩니다
                          </p>
                        </>
                      )}
                      <p>
                        • AI가 <strong>음성으로만</strong> 답변합니다 (텍스트
                        표시 없음)
                      </p>
                      <p>• 답변 중 재생 제어가 가능합니다</p>
                    </>
                  ) : browserSupport?.speechRecognition ? (
                    <>
                      <p>
                        • <strong>마이크 권한</strong>을 먼저 허용해주세요
                      </p>
                      <p>
                        • {browserSupport.isMobile ? "모바일 " : ""}브라우저
                        설정에서 마이크 접근을 허용하세요
                      </p>
                      <p>• 권한 허용 후 페이지를 새로고침하세요</p>
                      <p>• 개인정보는 수집되지 않습니다</p>
                    </>
                  ) : (
                    <>
                      <p>• 현재 브라우저는 음성 인식을 지원하지 않습니다</p>
                      {browserSupport?.isIOS ? (
                        <p>
                          • iOS에서는 <strong>Chrome 앱</strong>을 사용해주세요
                        </p>
                      ) : browserSupport?.isAndroid ? (
                        <p>
                          • Android에서는 <strong>Chrome 브라우저</strong>를
                          사용해주세요
                        </p>
                      ) : (
                        <p>• Chrome, Edge, Firefox 브라우저를 사용해주세요</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 마지막 질문 표시 */}
            {lastQuestion &&
              !isListening &&
              !isProcessing &&
              micPermission === "granted" && (
                <div className="bg-card/30 p-4 rounded-xl border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    마지막 질문:
                  </p>
                  <p className="text-sm leading-relaxed">"{lastQuestion}"</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 음성으로 답변을 들으셨습니다. 새로운 질문을 해보세요!
                    {browserSupport?.isMobile &&
                      mobileSpeechReady &&
                      ` 📱 이제 ${
                        browserSupport.isIOS ? "iOS" : "Android"
                      }에서 자동재생됩니다`}
                  </p>
                  {lastResponse && !isSpeaking && (
                    <Button
                      onClick={handleManualPlay}
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      다시 듣기
                    </Button>
                  )}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 음성 설정 (브라우저 지원 시에만) */}
        {browserSupport?.speechSynthesis && micPermission === "granted" && (
          <Card className="card-elevated">
            <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>음성 설정</span>
                      {browserSupport.isMobile && (
                        <span className="text-xs text-blue-400">
                          📱 {browserSupport.isIOS ? "iOS" : "Android"} 지원
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isSettingsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* 음성 선택 */}
                  {voicesLoaded && getKoreanVoices().length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">음성 선택</Label>
                      <Select
                        value={voiceSettings.selectedVoice}
                        onValueChange={(value: string) =>
                          handleVoiceSettingChange("selectedVoice", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="음성을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {getKoreanVoices().map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              <div className="flex flex-col">
                                <span>{voice.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {voice.lang}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {browserSupport.isMobile && (
                        <p className="text-xs text-blue-400">
                          📱{" "}
                          {browserSupport.isIOS
                            ? "iOS에서 유나, 수진 등 한국어 음성을 지원합니다"
                            : "Android에서 한국어 음성을 지원합니다"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 음성 속도 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      음성 속도: {voiceSettings.rate.toFixed(1)}x
                    </Label>
                    <Slider
                      value={[voiceSettings.rate]}
                      onValueChange={([value]: number[]) =>
                        handleVoiceSettingChange("rate", value)
                      }
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* 음성 높이 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      음성 높이: {voiceSettings.pitch.toFixed(1)}
                    </Label>
                    <Slider
                      value={[voiceSettings.pitch]}
                      onValueChange={([value]: number[]) =>
                        handleVoiceSettingChange("pitch", value)
                      }
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* 음성 볼륨 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      음성 볼륨: {Math.round(voiceSettings.volume * 100)}%
                    </Label>
                    <Slider
                      value={[voiceSettings.volume]}
                      onValueChange={([value]: number[]) =>
                        handleVoiceSettingChange("volume", value)
                      }
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* 테스트 버튼 */}
                  {!isSpeaking && (
                    <Button
                      onClick={() =>
                        speakText("안녕하세요. 음성 테스트입니다.")
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      음성 테스트
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💾 설정은 자동으로 저장됩니다</p>
                    {browserSupport.isMobile && (
                      <p>
                        📱 {browserSupport.isIOS ? "iOS" : "Android"}에서 설정
                        변경 후 마이크 버튼을 터치하면 새 설정이 적용됩니다
                      </p>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* 에러 알림 */}
        {error && (
          <Alert className="border-destructive/20 bg-destructive/5 mt-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
