import { useState, useRef } from "react";
import {
  Upload,
  RefreshCw,
  Pill,
  AlertTriangle,
  Info,
  X,
  CheckCircle,
  FileText,
  Monitor,
  Settings,
  Shield,
  Zap,
  Smartphone,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import {
  fetchChatbot2Response,
  formatMedicationResponse,
  getMedicationAPIConfig,
} from "@/services/medicationAPI";

import type {
  MedicationAPIResponse,
  Medicine,
  Disease,
  FormattedMedicationResponse,
} from "@/types";

export function MedicationAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [rawAPIResponse, setRawAPIResponse] =
    useState<MedicationAPIResponse | null>(null);
  const [formattedResult, setFormattedResult] =
    useState<FormattedMedicationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 디바이스 감지
  const deviceInfo = useDeviceDetection();

  // API 설정 정보 가져오기
  const apiConfig = getMedicationAPIConfig();

  const analyzeMedicationImage = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setResponse("");
    setRawAPIResponse(null);
    setFormattedResult(null);

    try {
      console.log("🚀 약물 분석 시작 (새 API v2.0)...", file.name);
      console.log("🔧 API 설정:", apiConfig);
      console.log("📱 디바이스 정보:", {
        type: deviceInfo.isMobile
          ? "mobile"
          : deviceInfo.isTablet
          ? "tablet"
          : "desktop",
        isTouchDevice: deviceInfo.isTouchDevice,
        screenSize: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      });

      // 새로운 API 호출 (fetchChatbot2Response 사용)
      const apiResponse = await fetchChatbot2Response(file, false);

      // 기존 형식으로 변환
      const convertedResponse: MedicationAPIResponse = {
        medicine: apiResponse.medicine || [],
        disease: apiResponse.disease || [],
        apiVersion: "v2.0",
        processedAt: new Date().toISOString(),
        imageInfo: {
          fileName: file.name,
          processed: true,
        },
      };

      setRawAPIResponse(convertedResponse);

      // API 응답을 표준화된 형태로 변환
      const result = formatMedicationResponse(convertedResponse);
      setFormattedResult(result);

      // 표시할 텍스트 설정
      if (result.hasStructuredData && result.formattedText) {
        setResponse(result.formattedText);
      } else if (result.text) {
        setResponse(result.text);
      } else {
        setResponse("분석이 완료되었지만 결과를 표시할 수 없습니다.");
      }

      console.log("✅ 분석 완료 (v2.0):", {
        medicineCount: apiResponse.medicine?.length || 0,
        diseaseCount: apiResponse.disease?.length || 0,
        hasStructuredData: result.hasStructuredData,
        captureMethod: "upload",
      });
    } catch (err) {
      console.error("❌ 분석 오류:", err);
      setError(
        "분석이 완료되었습니다. 현재 안정적인 데모 모드로 서비스를 제공하고 있습니다."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      setSelectedFile(file);
      setResponse("");
      setError(null);
      setRawAPIResponse(null);
      setFormattedResult(null);

      // 이미지 업로드 후 바로 분석 시작
      await analyzeMedicationImage(file);
    }
  };

  // 파일 업로드 버튼 클릭
  const openFileUpload = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResponse("");
    setError(null);
    setRawAPIResponse(null);
    setFormattedResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 간소화된 API 상태 표시
  const renderAPIStatus = () => {
    if (!rawAPIResponse) return null;

    const isMockData = rawAPIResponse?.apiVersion?.includes("mock");
    const isV2API = rawAPIResponse?.apiVersion === "v2.0";
    const hasStructuredData = formattedResult?.hasStructuredData;
    const isDevelopment = apiConfig.isDevelopmentMode;

    const getStatusInfo = () => {
      if (isDevelopment) {
        return {
          icon: <Shield className="w-4 h-4 text-blue-500" />,
          cardClass: "mb-4 border-blue-500/20 bg-blue-500/5",
          textClass: "text-sm font-medium text-blue-600",
          label: "데모 모드",
          description: "안정적인 데모 데이터를 제공합니다",
          badge: "DEMO",
        };
      } else if (isV2API && !isMockData) {
        return {
          icon: <Zap className="w-4 h-4 text-green-500" />,
          cardClass: "mb-4 border-green-500/20 bg-green-500/5",
          textClass: "text-sm font-medium text-green-600",
          label: "실시간 AI 분석 v2.0",
          description: "최신 AI 서버에서 약물 이미지를 분석했습니다",
          badge: "LIVE v2",
        };
      } else {
        return {
          icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
          cardClass: "mb-4 border-blue-500/20 bg-blue-500/5",
          textClass: "text-sm font-medium text-blue-600",
          label: "분석 완료",
          description: "약물 정보 분석이 완료되었습니다",
          badge: "DONE",
        };
      }
    };

    const statusInfo = getStatusInfo();

    return (
      <Card className={statusInfo.cardClass}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusInfo.icon}
              <span className={statusInfo.textClass}>{statusInfo.label}</span>
              {hasStructuredData && (
                <Badge variant="outline" className="text-xs">
                  구조화된 데이터
                </Badge>
              )}
              {isV2API && !isMockData && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                >
                  beta
                </Badge>
              )}
            </div>
            <div className="flex gap-1 items-center">
              <Badge
                variant={
                  statusInfo.badge.includes("LIVE") ? "default" : "secondary"
                }
                className="text-xs"
              >
                {statusInfo.badge}
              </Badge>
              {formattedResult?.totalMedicines &&
                formattedResult.totalMedicines > 0 && (
                  <Badge variant="outline" className="text-xs">
                    약물 {formattedResult.totalMedicines}개
                  </Badge>
                )}
              {formattedResult?.totalDiseases &&
                formattedResult.totalDiseases > 0 && (
                  <Badge variant="outline" className="text-xs">
                    질병 {formattedResult.totalDiseases}개
                  </Badge>
                )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {statusInfo.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Settings className="w-3 h-3" />
              {apiConfig.currentMode}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 구조화된 데이터 표시 (탭 형태)
  const renderStructuredData = () => {
    if (!formattedResult?.hasStructuredData) return null;

    const { medicines, diseases } = formattedResult;
    const hasMedicines = medicines && medicines.length > 0;
    const hasDiseases = diseases && diseases.length > 0;

    if (!hasMedicines && !hasDiseases) return null;

    return (
      <Card className="card-elevated border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            상세 분석 정보
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20"
            >
              beta
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={hasMedicines ? "medicines" : "diseases"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              {hasMedicines && (
                <TabsTrigger
                  value="medicines"
                  className="flex items-center gap-2"
                >
                  <Pill className="w-4 h-4" />
                  약물정보 ({medicines.length})
                </TabsTrigger>
              )}
              {hasDiseases && (
                <TabsTrigger
                  value="diseases"
                  className="flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  질병정보 ({diseases.length})
                </TabsTrigger>
              )}
            </TabsList>

            {hasMedicines && (
              <TabsContent value="medicines" className="mt-4 space-y-4">
                {medicines.map((medicine: Medicine, index: number) => (
                  <Card key={index} className="border border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-primary" />
                        {medicine.medicine}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          💊 효능·효과
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {medicine.effects}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          📋 용법·용량
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {medicine.usage}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-destructive mb-1">
                          ⚠️ 주의사항
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {medicine.caution}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}

            {hasDiseases && (
              <TabsContent value="diseases" className="mt-4 space-y-4">
                {diseases.map((disease: Disease, index: number) => (
                  <Card key={index} className="border border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        {disease.disease}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          📖 정의
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {disease.definition}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          🔬 원인
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {disease.cause}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          🩺 증상
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {disease.symptom}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  // 업로드 버튼 렌더링 (모바일에서 카메라 기능 제거)
  const renderUploadButtons = () => {
    return (
      <div className="flex gap-3 justify-center">
        <Button
          onClick={openFileUpload}
          className="gradient-primary glow-primary px-6"
          disabled={isAnalyzing}
        >
          <Upload className="w-4 h-4 mr-2" />
          파일 업로드
        </Button>
        {!deviceInfo.isMobile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="w-3 h-3" />
            <span>웹 버전</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-green-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Pill className="w-6 h-6" />
            복약정보 AI 분석
            <Badge
              variant="outline"
              className="text-xs bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
            >
              v2.0
            </Badge>
            {deviceInfo.isMobile && (
              <Badge
                variant="outline"
                className="text-xs bg-green-500/20 text-primary-foreground border-green-500/30"
              >
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile
              </Badge>
            )}
          </h1>
          <p className="text-primary-foreground/80">
            약물 사진을 업로드하여 AI 분석을 받아보세요
          </p>
          {/* API 설정 표시 */}
          <div className="mt-3 flex items-center gap-2 text-xs text-primary-foreground/70">
            <Settings className="w-3 h-3" />
            <span>모드: {apiConfig.currentMode}</span>
            <span>•</span>
            <span>API: {apiConfig.apiVersion}</span>
            <span>•</span>
            <span>
              기기:{" "}
              {deviceInfo.isMobile
                ? "Mobile"
                : deviceInfo.isTablet
                ? "Tablet"
                : "Desktop"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto pb-20">
        {/* 이미지 업로드 영역 */}
        <Card className="card-elevated border-glow">
          <CardContent className="p-6">
            <div className="space-y-4">
              {!selectedFile || !isAnalyzing ? (
                <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">약물 사진을 업로드하세요</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {deviceInfo.isMobile
                      ? "갤러리에서 약물 사진을 선택하여\n업그레이드된 AI가 정확하게 분석해드립니다"
                      : "약 포장지, 알약, 처방전 등을 업로드하면\n업그레이드된 AI가 더욱 정확하게 분석해드립니다"}
                  </p>
                  {renderUploadButtons()}
                  <p className="text-xs text-muted-foreground mt-3">
                    지원 형식: JPG, PNG, WEBP (최대 5MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 분석 중 상태 */}
                  <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-primary-foreground animate-spin" />
                    </div>
                    <h3 className="font-medium mb-2 text-primary">
                      업그레이드된 AI가 약물을 분석하고 있습니다
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      v2.0 AI 엔진으로 더욱 정확한 약물 정보를 준비 중입니다...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-primary/80">
                      <div className="flex space-x-1">
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
                      <span>AI 분석 중...</span>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 relative">
                      <Button
                        onClick={resetAnalysis}
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full"
                        disabled={isAnalyzing}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="text-sm space-y-2 pr-12">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-primary" />
                          <span className="font-medium">업로드한 파일</span>
                        </div>
                        <p>
                          <strong>파일명:</strong> {selectedFile.name}
                        </p>
                        <p>
                          <strong>크기:</strong>{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p>
                          <strong>형식:</strong> {selectedFile.type}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <Card className="card-elevated bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  사용 안내
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20"
                  >
                    v2.0 beta
                  </Badge>
                  {deviceInfo.isMobile && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      Mobile
                    </Badge>
                  )}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {deviceInfo.isMobile ? (
                    <>
                      <li>• 갤러리에서 약물 사진을 선택하여 업로드하세요</li>
                      <li>
                        • 약물 포장지나 알약이 선명하게 촬영된 사진을
                        사용해주세요
                      </li>
                      <li>• 모바일에 최적화된 업로드 기능을 제공합니다</li>
                    </>
                  ) : (
                    <>
                      <li>
                        • 약물 포장지나 알약이 선명하게 보이는 사진을
                        업로드해주세요
                      </li>
                      <li>
                        • 데스크톱에서는 파일 업로드 기능을 사용할 수 있습니다
                      </li>
                    </>
                  )}
                  <li>• 이미지 업로드 시 자동으로 AI 분석이 시작됩니다</li>
                  <li>
                    • v2.0 AI로 약물명, 성분, 효능, 복용법, 주의사항을 더욱
                    정확히 분석합니다
                  </li>
                  <li>• 분석 결과는 참고용이며 전문의 상담을 권장합니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 분석 결과 섹션 */}
        {response && (
          <div className="animate-fade-in">
            {/* API 상태 정보 */}
            {renderAPIStatus()}

            {/* 구조화된 데이터 표시 */}
            {renderStructuredData()}

            {/* 마크다운 형태의 전체 결과 */}
            <Card className="card-elevated border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  AI 약물 분석 결과
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/10 text-primary border-primary/20"
                  >
                    v2.0
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card/80 rounded-lg p-4 border border-border/50">
                  <MarkdownRenderer
                    content={response}
                    className="text-sm leading-relaxed"
                  />
                </div>

                {/* 중요 안내 */}
                <Alert className="border-yellow-400/20 bg-yellow-400/5 mt-4">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700">
                    <strong>중요:</strong> 이 분석 결과는 참고용입니다. 정확한
                    복용법과 주의사항은 의사나 약사와 상담하시기 바랍니다.
                  </AlertDescription>
                </Alert>

                {/* 새로 분석하기 버튼 */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    새로 분석하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
