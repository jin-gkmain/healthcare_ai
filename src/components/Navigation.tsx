import {
  MessageCircle,
  Pill,
  Mic,
  Target,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Badge } from "./ui/badge";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoClick: () => void;
  isDesktop: boolean;
}

const menuItems = [
  {
    id: "chat",
    icon: MessageCircle,
    label: "AI 상담",
    description: "24시간 건강 상담",
    badge: null,
  },
  {
    id: "medication",
    icon: Pill,
    label: "복약 분석",
    description: "약물 정보 & 상호작용",
    badge: null,
  },
  {
    id: "voice",
    icon: Mic,
    label: "음성 상담",
    description: "말로 하는 건강 상담",
    badge: "HOT", // 데스크톱에서만 표시
  },
  {
    id: "symptoms",
    icon: Target,
    label: "질병 예측",
    description: "SNOMED CT 기반",
    badge: "NEW", // 데스크톱에서만 표시
  },
  {
    id: "guide",
    icon: BookOpen,
    label: "사용 가이드",
    description: "플랫폼 사용 방법",
    badge: null,
  },
];

export function Navigation({
  activeTab,
  onTabChange,
  onLogoClick,
  isDesktop,
}: NavigationProps) {
  // 데스크톱 네비게이션
  if (isDesktop) {
    return (
      <nav className="desktop-nav relative border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <button
                onClick={onLogoClick}
                className="logo-hover flex items-center gap-3 group"
              >
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                    건강관리 AI
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Health AI Platform
                  </span>
                </div>
              </button>
            </div>

            {/* 메뉴 항목들 */}
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`menu-item-hover relative px-4 py-2 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 group ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 transition-all duration-300 ${
                          isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`text-xs px-1.5 py-0.5 ${
                            item.badge === "HOT"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs opacity-70">
                      {item.description}
                    </span>

                    {/* 활성 상태 인디케이터 */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-lg"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 우측 액션 */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">AI Healthcare</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // 모바일 네비게이션 (뱃지 제거됨)
  return (
    <>
      {/* 하단 고정 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 backdrop-blur-xl bg-background/90">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-1 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground active:bg-muted/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {item.label}
                </span>

                {/* 활성 상태 인디케이터 */}
                {isActive && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 상단 로고 (모바일) */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 backdrop-blur-xl bg-background/90">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onLogoClick} className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                건강관리 AI
              </span>
              <span className="text-xs text-muted-foreground">
                Health AI Platform
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* 현재 페이지 표시 */}
            <div className="text-xs text-muted-foreground">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
