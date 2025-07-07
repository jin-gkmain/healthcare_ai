import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  BarChart3,
  Brain,
  Heart,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

// 음성 분석 결과 타입 정의
interface VoiceAnalysisInsight {
  category: string;
  value: number;
  color: string;
}

interface VoiceAnalysisResult {
  stressLevel: number;
  energyLevel: number;
  emotionalState: string;
  voiceHealth: number;
  recommendations: string[];
  insights: VoiceAnalysisInsight[];
}

export function VoiceWellness() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<VoiceAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("마이크 접근 오류:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzeVoice = async () => {
    setIsAnalyzing(true);

    // 실제 음성 분석 시뮬레이션
    setTimeout(() => {
      const mockResult = {
        stressLevel: Math.floor(Math.random() * 40) + 30, // 30-70
        energyLevel: Math.floor(Math.random() * 40) + 40, // 40-80
        emotionalState: ["calm", "excited", "neutral", "tired"][
          Math.floor(Math.random() * 4)
        ],
        voiceHealth: Math.floor(Math.random() * 30) + 70, // 70-100
        recommendations: [
          "깊은 호흡을 통해 스트레스를 완화해보세요",
          "충분한 수분 섭취로 목을 촉촉하게 유지하세요",
          "규칙적인 운동으로 에너지 레벨을 높여보세요",
        ],
        insights: [
          {
            category: "스트레스",
            value: Math.floor(Math.random() * 40) + 30,
            color: "text-red-500",
          },
          {
            category: "피로도",
            value: Math.floor(Math.random() * 50) + 25,
            color: "text-orange-500",
          },
          {
            category: "활력도",
            value: Math.floor(Math.random() * 40) + 50,
            color: "text-green-500",
          },
          {
            category: "음성 품질",
            value: Math.floor(Math.random() * 30) + 70,
            color: "text-blue-500",
          },
        ],
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2500);
  };

  const playAudio = () => {
    if (audioBlob && !isPlaying) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case "calm":
        return "bg-green-500";
      case "excited":
        return "bg-yellow-500";
      case "tired":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEmotionalStateText = (state: string) => {
    switch (state) {
      case "calm":
        return "평온함";
      case "excited":
        return "흥분됨";
      case "tired":
        return "피곤함";
      default:
        return "중립적";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-green-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-lg font-bold text-primary-foreground mb-1 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            음성 웰니스 분석
          </h1>
          <p className="text-sm text-primary-foreground/80">
            음성을 통해 스트레스와 감정 상태를 분석해보세요
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {!analysisResult ? (
          <>
            {/* 음성 녹음 영역 */}
            <Card className="card-elevated border-glow">
              <CardContent className="p-8 text-center">
                <div className="relative mb-8">
                  <div
                    className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? "bg-red-500 glow-primary animate-pulse"
                        : "bg-primary/10 hover:bg-primary/20"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-primary" />
                    )}
                  </div>

                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></div>
                  )}
                </div>

                {isRecording && (
                  <div className="mb-6">
                    <div className="text-2xl font-mono font-bold text-red-500 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {!audioBlob ? (
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-8 py-3 rounded-xl ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "gradient-primary glow-primary"
                      }`}
                    >
                      {isRecording ? "녹음 중단" : "음성 녹음 시작"}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={playAudio}
                          variant="outline"
                          className="rounded-xl"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {isPlaying ? "일시정지" : "재생"}
                        </Button>
                        <Button
                          onClick={() => {
                            setAudioBlob(null);
                            setRecordingTime(0);
                          }}
                          variant="outline"
                          className="rounded-xl"
                        >
                          다시 녹음
                        </Button>
                      </div>

                      <Button
                        onClick={analyzeVoice}
                        disabled={isAnalyzing}
                        className="w-full gradient-primary glow-primary py-3 rounded-xl"
                      >
                        {isAnalyzing ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-spin" />
                            AI 분석 중...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="w-5 h-5 mr-2" />
                            음성 분석 시작
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 사용 안내 */}
                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>15-30초 정도</strong> 자연스럽게 말씀해주세요.
                    간단한 자기소개나 오늘 기분에 대해 이야기해보세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 분석 결과 */
          <div className="space-y-6">
            {/* 전체 건강 상태 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardContent className="p4 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {100 - analysisResult.stressLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    웰니스 지수
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {analysisResult.energyLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    에너지 레벨
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 감정 상태 */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  감정 상태 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-4 h-4 rounded-full ${getEmotionalStateColor(
                      analysisResult.emotionalState
                    )}`}
                  ></div>
                  <span className="font-medium">
                    {getEmotionalStateText(analysisResult.emotionalState)}
                  </span>
                  <Badge variant="secondary">
                    {analysisResult.voiceHealth}% 음성 품질
                  </Badge>
                </div>

                <div className="space-y-3">
                  {analysisResult.insights.map(
                    (insight: VoiceAnalysisInsight, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{insight.category}</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress
                            value={insight.value}
                            className="flex-1 h-2"
                          />
                          <span
                            className={`text-sm font-medium ${insight.color}`}
                          >
                            {insight.value}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 추천사항 */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>웰니스 추천사항</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.recommendations.map(
                    (rec: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* 새로운 분석 버튼 */}
            <Button
              onClick={() => {
                setAnalysisResult(null);
                setAudioBlob(null);
                setRecordingTime(0);
              }}
              variant="outline"
              className="w-full py-3 rounded-xl"
            >
              새로운 음성 분석
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
