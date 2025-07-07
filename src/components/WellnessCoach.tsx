import { useState } from "react";
import {
  Bot,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function WellnessCoach() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const coachPlans = [
    {
      id: "weight-loss",
      title: "건강한 체중 관리",
      description: "개인 맞춤 다이어트와 운동 계획",
      duration: "12주",
      difficulty: "중급",
      color: "bg-green-500",
      icon: "🏃‍♀️",
      features: ["맞춤 식단 계획", "운동 프로그램", "진도 추적", "전문가 팁"],
    },
    {
      id: "sleep-improvement",
      title: "수면 질 향상",
      description: "더 나은 잠을 위한 생활 습관 개선",
      duration: "8주",
      difficulty: "초급",
      color: "bg-blue-500",
      icon: "😴",
      features: ["수면 패턴 분석", "취침 루틴", "환경 최적화", "스트레스 관리"],
    },
    {
      id: "stress-management",
      title: "스트레스 관리",
      description: "마음의 평안을 위한 종합적 접근",
      duration: "10주",
      difficulty: "중급",
      color: "bg-purple-500",
      icon: "🧘‍♀️",
      features: ["명상 가이드", "호흡법 훈련", "인지 요법", "생활 밸런스"],
    },
  ];

  const todayPlan = {
    progress: 65,
    tasks: [
      { id: 1, title: "아침 운동 (30분)", completed: true, time: "07:00" },
      { id: 2, title: "건강한 아침식사", completed: true, time: "08:00" },
      { id: 3, title: "물 2잔 마시기", completed: false, time: "10:00" },
      { id: 4, title: "점심 산책 (15분)", completed: false, time: "12:30" },
      { id: 5, title: "명상 (10분)", completed: false, time: "19:00" },
      { id: 6, title: "수면 준비 루틴", completed: false, time: "22:00" },
    ],
  };

  const weeklyGoals = [
    { title: "주 4회 운동", current: 2, target: 4, unit: "회" },
    { title: "하루 8잔 물 마시기", current: 5, target: 7, unit: "일" },
    { title: "명상 습관", current: 3, target: 5, unit: "일" },
    { title: "11시 이전 취침", current: 4, target: 7, unit: "일" },
  ];

  const achievements = [
    { title: "첫 주 완주", icon: "🎯", date: "2024-01-10" },
    { title: "운동 5일 연속", icon: "💪", date: "2024-01-08" },
    { title: "수분 섭취 목표 달성", icon: "💧", date: "2024-01-05" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-green-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-lg font-bold text-primary-foreground mb-1 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            웰니스 코치
          </h1>
          <p className="text-sm text-primary-foreground/80">
            AI 코치가 당신만의 건강 여정을 함께합니다
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {!selectedGoal ? (
          <>
            {/* 코치 플랜 선택 */}
            <div className="space-y-4">
              <h3 className="font-semibold">목표를 선택해주세요</h3>
              {coachPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="card-elevated hover:card-floating transition-all cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 ${plan.color} rounded-2xl flex items-center justify-center text-2xl`}
                      >
                        {plan.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {plan.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {plan.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedGoal(plan.id)}
                        size="sm"
                        className="gradient-primary rounded-lg"
                      >
                        시작하기
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 선택된 플랜의 대시보드 */}
            <div className="space-y-6">
              {/* 오늘의 계획 */}
              <Card className="card-elevated border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      오늘의 계획
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={todayPlan.progress}
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-medium">
                        {todayPlan.progress}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayPlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        task.completed
                          ? "bg-green-50 border border-green-200"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed
                            ? "bg-green-500 border-green-500"
                            : "border-muted-foreground"
                        }`}
                      >
                        {task.completed && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.time}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 주간 목표 */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    이번 주 목표
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklyGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress
                        value={(goal.current / goal.target) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI 코치 팁 */}
              <Card className="card-elevated bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">오늘의 AI 코치 팁</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        점심 식사 후 15분 산책은 소화를 돕고 오후 집중력을
                        향상시킵니다. 오늘 날씨가 좋으니 밖으로 나가보세요! 🌞
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                      >
                        더 많은 팁 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 달성한 성취 */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    최근 성취
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <span className="text-xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {achievement.date}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white text-xs">
                          달성
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 플랜 변경 버튼 */}
              <Button
                onClick={() => setSelectedGoal(null)}
                variant="outline"
                className="w-full py-3 rounded-xl"
              >
                다른 플랜 선택하기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
