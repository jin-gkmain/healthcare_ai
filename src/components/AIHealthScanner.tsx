import { useState, useRef } from "react";
import {
  Camera,
  Scan,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Hand,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

// AI 건강 스캐너 타입 정의
interface Finding {
  type: "positive" | "warning" | "neutral";
  message: string;
  confidence: number;
}

interface ScanResult {
  overallScore: number;
  findings: Finding[];
  recommendations: string[];
}

export function AIHealthScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedScanType, setSelectedScanType] = useState("general");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const scanTypes = [
    {
      id: "general",
      name: "전체 건강 체크",
      icon: Scan,
      description: "얼굴 분석을 통한 전반적인 건강 상태 체크",
      color: "bg-blue-500",
    },
    {
      id: "eyes",
      name: "눈 건강 체크",
      icon: Eye,
      description: "눈의 피로도와 건강 상태를 분석합니다",
      color: "bg-green-500",
    },
    {
      id: "skin",
      name: "피부 건강 체크",
      icon: Hand,
      description: "피부 상태와 잠재적 문제점을 분석합니다",
      color: "bg-purple-500",
    },
  ];

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error("카메라 접근 오류:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const performScan = async () => {
    setIsScanning(true);

    // 실제 AI 분석 시뮬레이션
    setTimeout(() => {
      const mockResults = {
        general: {
          overallScore: 85,
          findings: [
            {
              type: "positive",
              message: "전반적인 안색이 건강해 보입니다",
              confidence: 90,
            },
            {
              type: "warning",
              message: "약간의 피로 징후가 보입니다",
              confidence: 75,
            },
            {
              type: "neutral",
              message: "수분 섭취를 늘려보세요",
              confidence: 80,
            },
          ],
          recommendations: [
            "충분한 수면을 취하세요 (7-8시간)",
            "하루 2L 이상의 물을 마시세요",
            "스트레스 관리에 신경 쓰세요",
          ],
        },
        eyes: {
          overallScore: 78,
          findings: [
            {
              type: "warning",
              message: "눈의 피로도가 높아 보입니다",
              confidence: 85,
            },
            {
              type: "positive",
              message: "눈 주변 혈색은 양호합니다",
              confidence: 80,
            },
          ],
          recommendations: [
            "20-20-20 규칙을 실천하세요",
            "화면 사용 시간을 줄여보세요",
            "인공눈물을 사용해보세요",
          ],
        },
        skin: {
          overallScore: 82,
          findings: [
            {
              type: "positive",
              message: "피부 톤이 균등하고 건강해 보입니다",
              confidence: 88,
            },
            {
              type: "neutral",
              message: "약간의 건조함이 관찰됩니다",
              confidence: 70,
            },
          ],
          recommendations: [
            "보습제를 규칙적으로 사용하세요",
            "자외선 차단제를 꼭 발라주세요",
            "충분한 수분 섭취를 하세요",
          ],
        },
      };

      setScanResult(
        mockResults[selectedScanType as keyof typeof mockResults] as ScanResult
      );
      setIsScanning(false);
      stopCamera();
    }, 3000);
  };

  const resetScan = () => {
    setScanResult(null);
    stopCamera();
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Camera className="w-6 h-6" />
            AI 건강 스캐너
          </h1>
          <p className="text-primary-foreground/80">
            AI 기술로 간편하게 건강 상태를 체크해보세요
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {!scanResult ? (
          <>
            {/* 스캔 타입 선택 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">스캔 유형 선택</h3>
              <div className="space-y-2">
                {scanTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedScanType(type.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        selectedScanType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 카메라 뷰 */}
            <Card className="card-elevated border-glow">
              <CardContent className="p-6">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
                  {stream ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="text-center text-white">
                            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
                            <p className="font-medium">AI 분석 중...</p>
                            <div className="w-32 bg-white/20 rounded-full h-2 mt-2">
                              <div className="bg-white h-2 rounded-full animate-pulse w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-4 border-2 border-primary rounded-2xl opacity-50"></div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center p-8">
                      <div>
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">카메라 준비</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          선택한 스캔 유형에 맞게 카메라를 준비해주세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {!stream ? (
                    <Button
                      onClick={startCamera}
                      className="w-full gradient-primary glow-primary py-3 rounded-xl"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      카메라 시작
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={performScan}
                        disabled={isScanning}
                        className="flex-1 gradient-primary glow-primary py-3 rounded-xl"
                      >
                        {isScanning ? (
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Scan className="w-5 h-5 mr-2" />
                        )}
                        {isScanning ? "분석 중..." : "스캔 시작"}
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="px-6 py-3 rounded-xl"
                      >
                        중단
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 스캔 결과 */
          <div className="space-y-6">
            {/* 전체 점수 */}
            <Card className="card-elevated border-glow">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - scanResult.overallScore / 100)
                      }`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {scanResult.overallScore}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">전체 건강 점수</h3>
                <Badge
                  variant={
                    scanResult.overallScore >= 80
                      ? "default"
                      : scanResult.overallScore >= 60
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-sm"
                >
                  {scanResult.overallScore >= 80
                    ? "우수"
                    : scanResult.overallScore >= 60
                    ? "보통"
                    : "개선 필요"}
                </Badge>
              </CardContent>
            </Card>

            {/* 분석 결과 */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.findings.map((finding: Finding, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {finding.type === "positive" ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : finding.type === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Scan className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{finding.message}</p>
                      <Progress
                        value={finding.confidence}
                        className="mt-2 h-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        신뢰도: {finding.confidence}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 추천사항 */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  추천사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scanResult.recommendations.map(
                    (rec: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                        {rec}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* 다시 스캔 버튼 */}
            <Button
              onClick={resetScan}
              variant="outline"
              className="w-full py-3 rounded-xl"
            >
              새로운 스캔 시작
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
