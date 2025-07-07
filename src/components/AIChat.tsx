import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  Trash2,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { PageHeader } from "./ui/page-header";
import {
  fetchChatbotResponseStream,
  fetchChatbotResponse,
  convertToAPIHistory,
} from "@/services/chatAPI";
import { useChatHistory } from "@/hooks/useChatHistory";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatHistoryItem, ChatMessage } from "@/types";

// TTS 설정 인터페이스
interface TTSSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
  autoPlay: boolean;
}

// 기본 TTS 설정
const DEFAULT_TTS_SETTINGS: TTSSettings = {
  enabled: true,
  rate: 0.9,
  pitch: 1.0,
  volume: 0.8,
  voice: "",
  autoPlay: true,
};

// TTS 설정 저장/로드 함수
const saveTTSSettings = (settings: TTSSettings) => {
  try {
    localStorage.setItem("tts-settings", JSON.stringify(settings));
    console.log("🔊 TTS 설정 저장됨:", settings);
  } catch (error) {
    console.error("TTS 설정 저장 오류:", error);
  }
};

const loadTTSSettings = (): TTSSettings => {
  try {
    const savedSettings = localStorage.getItem("tts-settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const settings = { ...DEFAULT_TTS_SETTINGS, ...parsed };
      console.log("🔊 TTS 설정 로드됨:", settings);
      return settings;
    }
  } catch (error) {
    console.error("TTS 설정 로드 오류:", error);
  }
  console.log("🔊 기본 TTS 설정 사용:", DEFAULT_TTS_SETTINGS);
  return DEFAULT_TTS_SETTINGS;
};

export function AIChat() {
  const { messages, addMessage, clearHistory } = useChatHistory();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // TTS 관련 상태
  const [ttsSettings, setTTSSettings] = useState<TTSSettings>(
    loadTTSSettings()
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // 개선된 자동 스크롤 함수
  const scrollToBottom = (smooth: boolean = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
        inline: "nearest",
      });
    }
  };

  // TTS 초기화 (개선됨)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setTtsSupported(true);
      console.log("🔊 TTS 지원됨");

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log("🔊 사용 가능한 음성:", voices.length, "개");

        if (voices.length > 0) {
          setAvailableVoices(voices);
          setVoicesLoaded(true);

          // 저장된 설정에 음성이 없거나 잘못된 경우 한국어 음성 찾기
          const currentSettings = loadTTSSettings();
          let selectedVoice = currentSettings.voice;

          // 선택된 음성이 없거나 현재 사용 불가능한 경우
          if (!selectedVoice || !voices.find((v) => v.name === selectedVoice)) {
            // 한국어 음성 우선 검색
            const koreanVoice = voices.find(
              (voice) =>
                voice.lang.toLowerCase().includes("ko") ||
                voice.name.toLowerCase().includes("korean") ||
                voice.lang.toLowerCase().includes("kr")
            );

            if (koreanVoice) {
              selectedVoice = koreanVoice.name;
              console.log("🔊 한국어 음성 자동 선택:", selectedVoice);
            } else {
              // 한국어 음성이 없으면 첫 번째 음성 사용
              selectedVoice = voices[0]?.name || "";
              console.log("🔊 기본 음성 선택:", selectedVoice);
            }

            // 설정 업데이트
            const updatedSettings = {
              ...currentSettings,
              voice: selectedVoice,
            };
            setTTSSettings(updatedSettings);
            saveTTSSettings(updatedSettings);
          } else {
            console.log("🔊 저장된 음성 사용:", selectedVoice);
          }
        }
      };

      // 즉시 로드 시도
      loadVoices();

      // 음성 목록 변경 시 다시 로드
      speechSynthesis.onvoiceschanged = () => {
        console.log("🔊 음성 목록 변경됨");
        loadVoices();
      };

      // 일정 시간 후에도 음성이 로드되지 않으면 재시도
      const retryTimer = setTimeout(() => {
        if (!voicesLoaded) {
          console.log("🔊 음성 로드 재시도");
          loadVoices();
        }
      }, 1000);

      return () => {
        clearTimeout(retryTimer);
      };
    } else {
      console.warn("🔊 TTS 지원되지 않음");
    }
  }, [voicesLoaded]);

  // TTS 설정 변경 시 자동 저장
  useEffect(() => {
    if (ttsSettings !== DEFAULT_TTS_SETTINGS) {
      saveTTSSettings(ttsSettings);
    }
  }, [ttsSettings]);

  // TTS 설정 업데이트 함수
  const updateTTSSettings = (updates: Partial<TTSSettings>) => {
    setTTSSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      console.log("🔊 TTS 설정 업데이트:", updates);
      return newSettings;
    });
  };

  // 메시지 변경 시 자동 스크롤 (개선됨)
  useEffect(() => {
    // 약간의 지연을 두어 DOM 업데이트 후 스크롤
    const timeoutId = setTimeout(() => {
      scrollToBottom(true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // 스트리밍 메시지 변경 시 실시간 스크롤
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      // 스트리밍 중에는 더 자주 스크롤
      scrollToBottom(false); // 부드러운 스크롤 없이 즉시
    }
  }, [streamingMessage, isStreaming]);

  // 컴포넌트 마운트 시 스크롤
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // 음성 합성 함수 (모바일 최적화)
  const speakText = (text: string) => {
    if (!ttsSupported || !ttsSettings.enabled || !text.trim()) {
      console.log("🔊 TTS 건너뜀:", {
        ttsSupported,
        enabled: ttsSettings.enabled,
        hasText: !!text.trim(),
      });
      return;
    }

    // 기존 음성 중지
    try {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (error) {
      console.warn("Speech synthesis cancel error:", error);
    }

    // 마크다운 텍스트 정리 (모바일 최적화)
    const cleanText = text
      .replace(/#{1,6}\s+/g, "") // 헤더 제거
      .replace(/\*\*(.*?)\*\*/g, "$1") // 볼드 제거
      .replace(/\*(.*?)\*/g, "$1") // 이탤릭 제거
      .replace(/`(.*?)`/g, "$1") // 코드 제거
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 링크 제거
      .replace(/\n+/g, " ") // 줄바꿈을 공백으로
      .replace(/\s+/g, " ") // 연속 공백 제거
      .trim();

    if (!cleanText) return;

    console.log("🔊 TTS 시작:", cleanText.substring(0, 50) + "...");
    console.log("🔊 TTS 설정:", ttsSettings);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 음성 설정 적용 (모바일 안정성 개선)
    utterance.rate = Math.max(0.5, Math.min(2.0, ttsSettings.rate));
    utterance.pitch = Math.max(0.5, Math.min(2.0, ttsSettings.pitch));
    utterance.volume = Math.max(0.1, Math.min(1.0, ttsSettings.volume));
    utterance.lang = "ko-KR";

    // 선택된 음성 적용 (오류 처리 추가)
    if (ttsSettings.voice && availableVoices.length > 0) {
      try {
        const selectedVoice = availableVoices.find(
          (voice) => voice.name === ttsSettings.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log("🔊 음성 설정:", selectedVoice.name);
        } else {
          console.warn("🔊 선택된 음성을 찾을 수 없음:", ttsSettings.voice);
        }
      } catch (error) {
        console.warn("Voice selection error:", error);
      }
    }

    // 이벤트 리스너
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      console.log("🔊 TTS 재생 시작");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      console.log("🔊 TTS 재생 완료");
    };

    utterance.onerror = (event) => {
      console.error("🔊 TTS 오류:", event);
      setIsSpeaking(false);
      setIsPaused(false);

      // 모바일에서 발생할 수 있는 특정 오류들 처리
      if (
        event.error === "synthesis-failed" ||
        event.error === "audio-hardware"
      ) {
        setTimeout(() => {
          try {
            speechSynthesis.speak(utterance);
          } catch (retryError) {
            console.error("TTS 재시도 실패:", retryError);
          }
        }, 1000);
      }
    };

    utterance.onpause = () => {
      setIsPaused(true);
      console.log("🔊 TTS 일시정지");
    };

    utterance.onresume = () => {
      setIsPaused(false);
      console.log("🔊 TTS 재생 재개");
    };

    // 모바일에서 더 안정적인 TTS 실행
    try {
      // 음성 합성 큐가 비어있는지 확인
      if (speechSynthesis.pending) {
        speechSynthesis.cancel();
      }

      speechSynthesis.speak(utterance);

      // 모바일 브라우저에서 음성 합성이 시작되지 않을 때 대비
      setTimeout(() => {
        if (!isSpeaking && speechSynthesis.speaking) {
          setIsSpeaking(true);
        }
      }, 500);
    } catch (error) {
      console.error("🔊 TTS 실행 오류:", error);
      setIsSpeaking(false);
    }
  };

  // 음성 제어 함수들 (모바일 최적화)
  const pauseSpeech = () => {
    try {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        setIsPaused(true);
        console.log("🔊 TTS 일시정지 요청");
      }
    } catch (error) {
      console.error("TTS pause error:", error);
    }
  };

  const resumeSpeech = () => {
    try {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPaused(false);
        console.log("🔊 TTS 재생 재개 요청");
      }
    } catch (error) {
      console.error("TTS resume error:", error);
    }
  };

  const stopSpeech = () => {
    try {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      console.log("🔊 TTS 중지 요청");
    } catch (error) {
      console.error("TTS stop error:", error);
      // 강제로 상태 리셋
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // TTS 테스트 함수
  const testTTS = () => {
    const testText =
      "안녕하세요! 음성 설정이 잘 적용되었습니다. 속도, 음높이, 볼륨을 확인해보세요.";
    console.log("🔊 TTS 테스트 시작");
    speakText(testText);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const question = inputValue;
    setInputValue("");
    setIsLoading(true);
    setError(null);
    setStreamingMessage("");
    setIsStreaming(true);

    // 사용자 메시지 추가 후 즉시 스크롤
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const currentHistory = convertToAPIHistory([...messages, userMessage]);

      let fullResponse = "";

      await fetchChatbotResponseStream(
        currentHistory,
        question,
        (chunk: string) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
          // 스트리밍 중 실시간 스크롤은 useEffect에서 처리
        },
        () => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: fullResponse,
            timestamp: new Date(),
          };

          addMessage(aiMessage);
          setStreamingMessage("");
          setIsStreaming(false);
          setIsLoading(false);

          // AI 응답 완료 후 스크롤
          setTimeout(() => scrollToBottom(true), 100);

          // 자동 재생이 활성화된 경우 음성으로 읽기
          if (ttsSettings.autoPlay) {
            setTimeout(() => {
              speakText(fullResponse);
            }, 500);
          }
        },
        (err: Error) => {
          console.error("스트리밍 오류:", err);
          setError(err.message);
          setIsStreaming(false);
          setIsLoading(false);
          setStreamingMessage("");

          const currentHistory = convertToAPIHistory([
            ...messages,
            userMessage,
          ]);
          handleFallbackRequest(currentHistory, question);
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      setIsStreaming(false);
      setIsLoading(false);
      setStreamingMessage("");

      const currentHistory = convertToAPIHistory([...messages, userMessage]);
      handleFallbackRequest(currentHistory, question);
    }
  };

  const handleFallbackRequest = async (
    history: ChatHistoryItem[],
    question: string
  ) => {
    try {
      setIsLoading(true);
      const aiResponse = await fetchChatbotResponse(history, question);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      };

      addMessage(aiMessage);
      setError(null);

      // 폴백 응답 완료 후 스크롤
      setTimeout(() => scrollToBottom(true), 100);

      // 자동 재생이 활성화된 경우 음성으로 읽기
      if (ttsSettings.autoPlay) {
        setTimeout(() => {
          speakText(aiResponse);
        }, 500);
      }
    } catch (fallbackErr) {
      const errorMessage =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : "알 수 없는 오류가 발생했습니다.";

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `죄송합니다. ${errorMessage} 다시 질문해 주시거나 잠시 후 시도해 주세요.`,
        timestamp: new Date(),
      };

      addMessage(errorResponse);

      // 에러 응답 후 스크롤
      setTimeout(() => scrollToBottom(true), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.type === "user");
    if (lastUserMessage) {
      setInputValue(lastUserMessage.content);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setIsSettingsOpen(false);
    setError(null);
    setStreamingMessage("");
    setIsStreaming(false);
    stopSpeech();

    // 기록 삭제 후 스크롤 리셋
    setTimeout(() => scrollToBottom(false), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지별 음성 재생 버튼
  const renderTTSButton = (message: ChatMessage) => {
    if (!ttsSupported || !ttsSettings.enabled || message.type !== "ai")
      return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => speakText(message.content)}
        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
        title="음성으로 듣기"
      >
        <Volume2 className="w-3 h-3" />
      </Button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="AI 상담"
        description="전문 의료 AI가 24시간 상담해드립니다"
        icon={Bot}
        gradient="purple"
        badges={[
          { label: "24시간", icon: Sparkles, color: "yellow" },
          { label: "음성 지원", icon: Volume2, color: "green" },
        ]}
      >
        <div className="flex items-center gap-2 mt-2">
          <div className="relative">
            <Avatar className="w-6 h-6 border-2 border-primary-foreground/20">
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20">
                <Bot className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-primary animate-pulse"></div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            {/* TTS 컨트롤 */}
            {ttsSupported && ttsSettings.enabled && (
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isPaused ? resumeSpeech : pauseSpeech}
                      className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0"
                      title={isPaused ? "재생" : "일시정지"}
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopSpeech}
                      className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0"
                      title="정지"
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
                  {isSpeaking ? (
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>{isPaused ? "일시정지" : "재생 중"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>음성 지원</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(isLoading || isStreaming) && (
              <div className="flex items-center gap-2 text-sm text-primary-foreground/90 bg-primary-foreground/10 px-3 py-1.5 rounded-full backdrop-blur">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isStreaming ? "AI 응답 중" : "처리 중"}</span>
              </div>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="card-elevated border-glow max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    채팅 및 음성 설정
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* 채팅 설정 */}
                  <div className="space-y-4">
                    <h4 className="font-medium">채팅 설정</h4>
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card/50">
                      <div>
                        <h5 className="font-medium">채팅 기록</h5>
                        <p className="text-sm text-muted-foreground">
                          총 {messages.length}개의 메시지가 저장되어 있습니다.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearHistory}
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        기록 삭제
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* TTS 설정 */}
                  {ttsSupported && (
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        음성 읽기 설정
                        {voicesLoaded && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            {availableVoices.length}개 음성
                          </span>
                        )}
                      </h4>

                      {/* TTS 활성화 */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tts-enabled">음성 읽기 사용</Label>
                        <Switch
                          id="tts-enabled"
                          checked={ttsSettings.enabled}
                          onCheckedChange={(checked: boolean) => {
                            updateTTSSettings({ enabled: checked });
                            if (!checked) stopSpeech();
                          }}
                        />
                      </div>

                      {ttsSettings.enabled && (
                        <>
                          {/* 자동 재생 */}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tts-autoplay">자동 재생</Label>
                            <Switch
                              id="tts-autoplay"
                              checked={ttsSettings.autoPlay}
                              onCheckedChange={(checked: boolean) =>
                                updateTTSSettings({ autoPlay: checked })
                              }
                            />
                          </div>

                          {/* 음성 선택 */}
                          {availableVoices.length > 0 && (
                            <div className="space-y-2">
                              <Label>
                                음성 선택
                                {ttsSettings.voice && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (현재: {ttsSettings.voice})
                                  </span>
                                )}
                              </Label>
                              <select
                                value={ttsSettings.voice}
                                onChange={(e) =>
                                  updateTTSSettings({ voice: e.target.value })
                                }
                                className="w-full p-2 border border-border/50 rounded-lg bg-input text-sm"
                              >
                                <option value="">기본 음성</option>
                                {availableVoices.map((voice) => (
                                  <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                    {voice.lang.toLowerCase().includes("ko") &&
                                      " 🇰🇷"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* 속도 조절 */}
                          <div className="space-y-2">
                            <Label>
                              읽기 속도: {ttsSettings.rate.toFixed(1)}x
                            </Label>
                            <Slider
                              value={[ttsSettings.rate]}
                              onValueChange={([value]: number[]) =>
                                updateTTSSettings({ rate: value })
                              }
                              min={0.5}
                              max={2.0}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>느림 (0.5x)</span>
                              <span>빠름 (2.0x)</span>
                            </div>
                          </div>

                          {/* 음높이 조절 */}
                          <div className="space-y-2">
                            <Label>
                              음높이: {ttsSettings.pitch.toFixed(1)}
                            </Label>
                            <Slider
                              value={[ttsSettings.pitch]}
                              onValueChange={([value]: number[]) =>
                                updateTTSSettings({ pitch: value })
                              }
                              min={0.5}
                              max={2.0}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>낮음 (0.5)</span>
                              <span>높음 (2.0)</span>
                            </div>
                          </div>

                          {/* 볼륨 조절 */}
                          <div className="space-y-2">
                            <Label>
                              볼륨: {Math.round(ttsSettings.volume * 100)}%
                            </Label>
                            <Slider
                              value={[ttsSettings.volume]}
                              onValueChange={([value]: number[]) =>
                                updateTTSSettings({ volume: value })
                              }
                              min={0.1}
                              max={1.0}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>10%</span>
                              <span>100%</span>
                            </div>
                          </div>

                          {/* 테스트 버튼 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testTTS}
                            className="w-full"
                            disabled={isSpeaking}
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            {isSpeaking ? "재생 중..." : "음성 테스트"}
                          </Button>

                          {/* 설정 정보 */}
                          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl border border-border/50">
                            <p className="mb-1">
                              🔊 <strong>현재 설정:</strong>
                            </p>
                            <p>• 음성: {ttsSettings.voice || "기본 음성"}</p>
                            <p>
                              • 속도: {ttsSettings.rate}x, 음높이:{" "}
                              {ttsSettings.pitch}, 볼륨:{" "}
                              {Math.round(ttsSettings.volume * 100)}%
                            </p>
                            <p>
                              • 자동재생:{" "}
                              {ttsSettings.autoPlay ? "활성화" : "비활성화"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!ttsSupported && (
                    <div className="p-4 border border-border/50 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        현재 브라우저에서 음성 기능을 지원하지 않습니다.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl border border-border/50">
                    <p>
                      💡 모든 설정은 자동으로 저장되며, 다음에 접속할 때도
                      그대로 유지됩니다.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PageHeader>

      {/* 채팅 영역 - 네비게이션 공간 확보 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-4xl mx-auto p-4 pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 animate-fade-in ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" && (
                  <Avatar className="w-8 h-8 flex-shrink-0 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl transition-all duration-300 ${
                    message.type === "user"
                      ? "gradient-primary text-primary-foreground ml-auto glow-primary"
                      : "bg-card/80 border border-border/50 card-elevated backdrop-blur"
                  }`}
                >
                  {message.type === "ai" ? (
                    <MarkdownRenderer
                      content={message.content}
                      className="text-sm"
                    />
                  ) : (
                    <div
                      className="text-sm whitespace-pre-wrap leading-relaxed"
                      style={{ wordBreak: "break-word" }}
                    >
                      {message.content}
                    </div>
                  )}
                  <div
                    className={`text-xs mt-3 flex items-center justify-between gap-1 opacity-70 ${
                      message.type === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.type === "ai" && renderTTSButton(message)}
                  </div>
                </div>
                {message.type === "user" && (
                  <Avatar className="w-8 h-8 flex-shrink-0 border border-primary/20">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* 스트리밍 중인 메시지 표시 */}
            {isStreaming && streamingMessage && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <Avatar className="w-8 h-8 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[85%] p-4 rounded-2xl bg-card/80 border border-border/50 card-elevated backdrop-blur">
                  <MarkdownRenderer
                    content={streamingMessage}
                    className="text-sm"
                    isStreaming={true}
                  />
                  <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2 opacity-70">
                    <span>AI 응답 중</span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 로딩 표시 */}
            {isLoading && !isStreaming && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <Avatar className="w-8 h-8 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card/80 border border-border/50 p-4 rounded-2xl card-elevated backdrop-blur">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI가 답변을 준비하고 있습니다...
                  </p>
                </div>
              </div>
            )}

            {/* 초기 환영 메시지 */}
            {messages.length === 0 && !isLoading && (
              <div className="flex gap-4 justify-start opacity-60">
                <Avatar className="w-8 h-8 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[85%] p-4 rounded-2xl bg-card/60 border border-border/30">
                  <p className="text-sm text-muted-foreground">
                    안녕하세요! 🩺 AI 건강 상담사입니다.
                    <br />
                    궁금한 건강 관련 질문이나 증상에 대해 언제든지 물어보세요.
                  </p>
                  <div className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-2">
                    <span>
                      💡 정확한 진단을 위해서는 전문의와 상담하시기 바랍니다.
                    </span>
                    {ttsSupported && ttsSettings.enabled && (
                      <div className="flex items-center gap-1 text-primary">
                        <Volume2 className="w-3 h-3" />
                        <span>음성 지원</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 스크롤 앵커 */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* 에러 알림 */}
      {error && (
        <div className="absolute bottom-[140px] left-0 right-0 p-4 z-20">
          <Alert className="border-destructive/20 bg-destructive/5 card-elevated">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  재시도
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  닫기
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* 입력 영역 - 네비게이션 고려한 padding */}
      <div className="flex-shrink-0 p-4 pb-[84px] border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="건강에 대해 궁금한 것을 물어보세요..."
                disabled={isLoading || isStreaming}
                className="pr-12 py-3 text-base border-border/50 bg-input-background focus:border-primary/50 rounded-xl resize-none min-h-[50px]"
                style={{ wordBreak: "break-word" }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 gradient-primary glow-primary h-8 w-8 p-0 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 상태 표시 */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
              {ttsSupported && ttsSettings.enabled && ttsSettings.autoPlay && (
                <div className="flex items-center gap-1 text-primary">
                  <Volume2 className="w-3 h-3" />
                  <span>자동 음성 재생</span>
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <span>{messages.length}개 메시지 저장됨</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
