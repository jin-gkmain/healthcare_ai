import { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  MessageCircle,
  Pill,
  Mic,
} from "lucide-react";
import { Button } from "./ui/button";

interface IntroPageProps {
  onEnterApp: () => void;
}

export function IntroPage({ onEnterApp }: IntroPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: MessageCircle,
      title: "AI 건강 상담",
      description:
        "24시간 전문 의료 AI가 스트리밍으로 실시간 상담하고 음성으로 답변해드립니다",
    },
    {
      icon: Pill,
      title: "스마트 복약 분석",
      description:
        "약물 사진을 촬영하면 AI가 성분, 효능, 주의사항을 자세히 분석해드립니다",
    },
    {
      icon: Mic,
      title: "음성 건강 상담",
      description:
        "음성으로 질문하고 AI가 음성으로 답변하는 핸즈프리 건강 상담",
    },
    {
      icon: Shield,
      title: "종합 건강 관리",
      description: "건강 기록부터 응급상황 가이드까지 올인원 헬스케어 솔루션",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* 헤더 */}
      <div className="relative z-10 pt-16 pb-8 px-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center glow-primary">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-background animate-bounce"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          HealthAI Pro
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          AI 기술로 더 스마트하고 개인화된 건강 관리를 경험해보세요
        </p>
      </div>

      {/* 기능 소개 슬라이드 */}
      <div className="relative z-10 flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="relative h-80 overflow-hidden rounded-3xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0"
                      : index < currentSlide
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <div className="h-full bg-card/80 backdrop-blur border border-border/50 rounded-3xl p-8 card-elevated flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 glow-primary">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 슬라이드 인디케이터 */}
          <div className="flex justify-center space-x-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 주요 기능 미리보기 */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <MessageCircle className="w-6 h-6 text-primary mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">실시간 상담</span>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <Pill className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">약물 분석</span>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <Mic className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">음성 인식</span>
            </div>
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="relative z-10 p-6 pb-8">
        <Button
          onClick={onEnterApp}
          className="w-full gradient-primary glow-primary py-4 rounded-2xl group transition-all duration-300 hover:scale-105"
        >
          <span className="flex items-center justify-center gap-3 text-lg font-semibold">
            건강 관리 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>

        {/* 추가 정보 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>개인정보 보호</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>즉시 사용 가능</span>
          </div>
        </div>
      </div>

      {/* 하단 웨이브 효과 */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,50 C300,10 500,90 800,50 C1000,10 1200,50 1200,50 L1200,120 L0,120 Z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
