import { useState, useEffect } from 'react';
import { TrendingUp, Brain, Target, Calendar, Clock, Award, AlertCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function SmartInsights() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    // 실제로는 API에서 데이터를 가져와야 함
    const mockInsights = {
      healthScore: 78,
      trend: 'improving',
      streakDays: 12,
      weeklyData: [
        { day: '월', score: 72, activity: 65, sleep: 78 },
        { day: '화', score: 75, activity: 70, sleep: 82 },
        { day: '수', score: 73, activity: 68, sleep: 75 },
        { day: '목', score: 78, activity: 75, sleep: 80 },
        { day: '금', score: 80, activity: 82, sleep: 85 },
        { day: '토', score: 76, activity: 78, sleep: 79 },
        { day: '일', score: 78, activity: 80, sleep: 83 }
      ],
      predictions: [
        {
          title: '수면 개선 예측',
          description: '현재 패턴을 유지하면 2주 후 수면 질이 15% 향상될 것으로 예측됩니다.',
          confidence: 85,
          icon: '🌙',
          color: 'text-blue-500'
        },
        {
          title: '스트레스 관리',
          description: '주말 활동량 증가로 스트레스 레벨이 감소하는 추세입니다.',
          confidence: 78,
          icon: '🧘‍♀️',
          color: 'text-green-500'
        },
        {
          title: '건강 목표 달성',
          description: '현재 진행 속도로 이번 달 건강 목표를 95% 달성할 수 있습니다.',
          confidence: 92,
          icon: '🎯',
          color: 'text-purple-500'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          title: '수분 섭취 증가',
          description: '오늘 물 섭취량이 권장량의 60%입니다. 2시간마다 200ml씩 더 마셔보세요.',
          impact: '에너지 +15%, 피부 건강 +20%'
        },
        {
          priority: 'medium',
          title: '운동 시간 조정',
          description: '저녁 운동보다 오전 운동이 당신의 생체리듬에 더 적합합니다.',
          impact: '수면 질 +12%, 하루 활력 +18%'
        },
        {
          priority: 'low',
          title: '명상 시간 추가',
          description: '주 3회 10분 명상으로 스트레스를 더 효과적으로 관리할 수 있습니다.',
          impact: '스트레스 -25%, 집중력 +30%'
        }
      ],
      achievements: [
        { title: '7일 연속 목표 달성', date: '2024-01-15', icon: '🔥' },
        { title: '수면 패턴 개선', date: '2024-01-12', icon: '😴' },
        { title: '주간 운동 목표 완료', date: '2024-01-10', icon: '💪' }
      ]
    };
    
    setInsights(mockInsights);
  }, [selectedPeriod]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  if (!insights) {
    return <div className="h-full flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Brain className="w-6 h-6" />
            스마트 인사이트
          </h1>
          <p className="text-primary-foreground/80">
            AI가 분석한 당신만의 건강 패턴과 예측
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* 전체 건강 점수 및 트렌드 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{insights.healthScore}</div>
              <div className="text-sm text-muted-foreground">건강 점수</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+5% 개선</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">{insights.streakDays}</div>
              <div className="text-sm text-muted-foreground">연속 달성일</div>
              <div className="flex items-center justify-center mt-2">
                <Target className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-xs text-orange-500">목표 유지</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">A+</div>
              <div className="text-sm text-muted-foreground">이번 주 등급</div>
              <div className="flex items-center justify-center mt-2">
                <Award className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">우수</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 주간 트렌드 차트 */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                주간 건강 트렌드
              </span>
              <div className="flex gap-2">
                {['week', 'month'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="text-xs"
                  >
                    {period === 'week' ? '주간' : '월간'}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights.weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="sleep"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">전체 점수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">수면 점수</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 예측 */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI 건강 예측
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.predictions.map((prediction: any, index: number) => (
              <div key={index} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{prediction.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{prediction.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{prediction.description}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.confidence} className="flex-1 h-2" />
                      <Badge variant="secondary" className="text-xs">
                        신뢰도 {prediction.confidence}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 개인 맞춤 추천 */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              맞춤 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-4 rounded-xl border border-border/50">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)} flex-shrink-0 mt-2`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getPriorityText(rec.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>예상 효과: {rec.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 최근 성취 */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              최근 성취
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.achievements.map((achievement: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">완료</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}