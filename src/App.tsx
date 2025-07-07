import { useState } from "react";
import { IntroPage } from "./components/IntroPage";
import { Navigation } from "./components/Navigation";
import { AIChat } from "./components/AIChat";
import { MedicationAnalyzer } from "./components/MedicationAnalyzer";
import { VoiceQuestion } from "./components/VoiceQuestion";
import { SymptomChecker } from "./components/SymptomChecker";
import { PlatformGuide } from "./components/PlatformGuide";
import { useDeviceDetection } from "./hooks/useDeviceDetection";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const deviceInfo = useDeviceDetection();

  const handleEnterApp = () => {
    setShowIntro(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleLogoClick = () => {
    setShowIntro(true);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "chat":
        return <AIChat />;
      case "medication":
        return <MedicationAnalyzer />;
      case "voice":
        return <VoiceQuestion />;
      case "symptoms":
        return (
          <SymptomChecker
            onNavigate={handleTabChange}
            deviceInfo={deviceInfo}
          />
        );
      case "guide":
        return (
          <PlatformGuide onNavigate={handleTabChange} deviceInfo={deviceInfo} />
        );
      default:
        return <AIChat />;
    }
  };

  if (showIntro) {
    return (
      <div className="dark">
        <IntroPage onEnterApp={handleEnterApp} />
      </div>
    );
  }

  return (
    <div className="dark">
      {/* 고정된 전체 화면 컨테이너 */}
      <div className="fixed inset-0 bg-background overflow-hidden">
        {/* 배경 글로우 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="relative z-10 h-full flex flex-col">
          {/* 데스크톱: 상단 네비게이션 */}
          {deviceInfo.isDesktop && (
            <div className="flex-shrink-0">
              <Navigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogoClick={handleLogoClick}
                isDesktop={true}
              />
            </div>
          )}

          {/* 컨텐츠 영역 */}
          <div
            className={`flex-1 overflow-auto ${
              deviceInfo.isDesktop ? "pt-0" : "pb-0"
            }`}
          >
            <div className="h-full transition-all duration-300 ease-in-out">
              {renderActiveComponent()}
            </div>
          </div>

          {/* 모바일/태블릿: 하단 네비게이션 */}
          {!deviceInfo.isDesktop && (
            <div className="flex-shrink-0">
              <Navigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogoClick={handleLogoClick}
                isDesktop={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
