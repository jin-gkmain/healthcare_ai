import { useState } from 'react';
import { 
  BookOpen, 
  MessageCircle, 
  Pill, 
  Mic, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Zap, 
  Heart,
  Brain,
  ChevronRight,
  PlayCircle,
  Users,
  Shield,
  Clock,
  Smartphone,
  Monitor,
  Headphones
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

interface PlatformGuideProps {
  onNavigate: (tab: string) => void;
  deviceInfo: DeviceInfo;
}

// 기능별 가이드 데이터
const features = [
  {
    id: 'chat',
    title: 'AI 상담',
    subtitle: '24시간 건강 상담 서비스',
    icon: MessageCircle,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    description: '언제든지 건강 관련 질문을 하고 AI의 전문적인 답변을 받아보세요',
    features: [
      '24시간 실시간 상담',
      '의학적 근거 기반 답변',
      '개인 맞춤 건강 조언',
      '상담 기록 자동 저장'
    ],
    steps: [
      {
        step: 1,
        title: '질문 입력',
        description: '건강 관련 궁금한 점을 자연스럽게 입력하세요',
        tip: '구체적으로 증상이나 상황을 설명할수록 정확한 답변을 받을 수 있어요'
      },
      {
        step: 2,
        title: 'AI 분석',
        description: 'AI가 의학 데이터베이스를 분석하여 답변을 준비합니다',
        tip: '보통 몇 초 내에 답변이 완성됩니다'
      },
      {
        step: 3,
        title: '맞춤 답변',
        description: '개인의 상황에 맞는 전문적인 건강 조언을 제공받습니다',
        tip: '추가 질문도 언제든지 가능합니다'
      }
    ]
  },
  {
    id: 'medication',
    title: '복약 분석',
    subtitle: '약물 정보 & 상호작용 검사',
    icon: Pill,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500',
    description: '복용 중인 약물의 정보를 확인하고 상호작용을 검사해보세요',
    features: [
      '약물 정보 상세 분석',
      '약물 간 상호작용 검사',
      '복용법 및 주의사항',
      '부작용 정보 제공'
    ],
    steps: [
      {
        step: 1,
        title: '약물 입력',
        description: '복용 중인 약물명을 정확히 입력하세요',
        tip: '처방전이나 약 포장지를 참고하여 정확한 이름을 입력해주세요'
      },
      {
        step: 2,
        title: '정보 분석',
        description: '약물 데이터베이스에서 상세 정보를 검색합니다',
        tip: '성분, 효능, 부작용 등 종합적인 정보를 분석합니다'
      },
      {
        step: 3,
        title: '결과 확인',
        description: '약물 정보와 상호작용 위험도를 확인하세요',
        tip: '위험한 조합이 발견되면 즉시 의사와 상담하세요'
      }
    ]
  },
  {
    id: 'voice',
    title: '음성 상담',
    subtitle: '말로 하는 건강 상담',
    icon: Mic,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    description: '음성으로 질문하고 AI의 음성 답변을 들어보세요',
    features: [
      '음성 인식 기술',
      'AI 음성 답변',
      '핸즈프리 상담',
      '접근성 최적화'
    ],
    steps: [
      {
        step: 1,
        title: '마이크 권한',
        description: '음성 상담을 위해 마이크 권한을 허용해주세요',
        tip: '모바일에서는 첫 접속 시 권한을 미리 요청합니다'
      },
      {
        step: 2,
        title: '음성 질문',
        description: '마이크 버튼을 길게 눌러 질문을 말해보세요',
        tip: '조용한 환경에서 명확하게 말씀해주세요'
      },
      {
        step: 3,
        title: '음성 답변',
        description: 'AI가 음성으로 답변을 들려드립니다',
        tip: '모바일에서는 첫 번째 질문부터 자동으로 재생됩니다'
      }
    ]
  },
  {
    id: 'symptoms',
    title: '질병 예측',
    subtitle: 'SNOMED CT 기반 증상 분석',
    icon: Target,
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-red-500',
    description: '증상을 입력하여 가능한 질병을 예측하고 맞춤 조언을 받아보세요',
    features: [
      'SNOMED CT 표준 적용',
      '10개 전문 분야',
      '60개 이상 증상',
      'AI 위험도 분석'
    ],
    steps: [
      {
        step: 1,
        title: '증상 선택',
        description: '신체 부위별로 해당하는 증상들을 선택하세요',
        tip: '여러 증상을 동시에 선택할 수 있습니다'
      },
      {
        step: 2,
        title: '상세 입력',
        description: '각 증상의 정도와 지속 기간을 정확히 입력하세요',
        tip: '정확한 정보일수록 더 신뢰할 수 있는 분석 결과를 얻습니다'
      },
      {
        step: 3,
        title: 'AI 분석',
        description: 'AI가 증상을 종합 분석하여 가능한 질병을 예측합니다',
        tip: '결과는 참고용이며, 정확한 진단은 의료진과 상담하세요'
      }
    ]
  }
];

// 자주 묻는 질문
const faqs = [
  {
    question: 'AI 답변은 얼마나 정확한가요?',
    answer: '의학 데이터베이스와 최신 연구를 기반으로 하지만, 참고용으로만 사용하시고 정확한 진단은 반드시 의료진과 상담하세요.'
  },
  {
    question: '개인정보는 안전한가요?',
    answer: '모든 상담 내용은 암호화되어 저장되며, 개인정보보호법에 따라 안전하게 관리됩니다.'
  },
  {
    question: '응급 상황에도 사용할 수 있나요?',
    answer: '응급 상황에는 119에 신고하시고, 본 서비스는 일반적인 건강 상담 목적으로만 사용해주세요.'
  },
  {
    question: '음성 상담이 안 되는 경우가 있나요?',
    answer: '브라우저 권한 설정이나 네트워크 상태를 확인해주세요. iOS Safari에서는 Chrome 앱 사용을 권장합니다.'
  }
];

export function PlatformGuide({ onNavigate, deviceInfo }: PlatformGuideProps) {
  const [activeFeature, setActiveFeature] = useState('chat');
  const [activeTab, setActiveTab] = useState('overview');

  const isMobile = deviceInfo.isMobile;
  const selectedFeature = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20"></div>
        <div className="relative z-10">
          <h1 className={`text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3 ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            <BookOpen className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            플랫폼 사용 가이드
            <Badge 
              variant="outline" 
              className="text-xs bg-green-500/20 text-primary-foreground border-green-500/30"
            >
              <Star className="w-3 h-3 mr-1" />
              완전 가이드
            </Badge>
          </h1>
          <p className={`text-primary-foreground/80 ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            건강관리 AI 플랫폼의 모든 기능을 효과적으로 사용하는 방법을 알아보세요
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-primary-foreground border-blue-500/30">
              4개 핵심 기능
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-500/20 text-primary-foreground border-purple-500/30">
              단계별 설명
            </Badge>
            <Badge variant="outline" className="text-xs bg-orange-500/20 text-primary-foreground border-orange-500/30">
              실사용 팁
            </Badge>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${
        isMobile 
          ? 'p-4 pb-32' 
          : 'p-6 pb-24'
      }`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className={`grid w-full grid-cols-3 mb-6 ${
            isMobile ? 'text-xs p-1' : ''
          }`}>
            <TabsTrigger value="overview" className={`flex items-center gap-2 ${
              isMobile ? 'flex-col gap-1 p-2' : ''
            }`}>
              <Heart className="w-4 h-4" />
              <span className={isMobile ? 'text-xs' : ''}>기능 소개</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className={`flex items-center gap-2 ${
              isMobile ? 'flex-col gap-1 p-2' : ''
            }`}>
              <PlayCircle className="w-4 h-4" />
              <span className={isMobile ? 'text-xs' : ''}>사용 방법</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className={`flex items-center gap-2 ${
              isMobile ? 'flex-col gap-1 p-2' : ''
            }`}>
              <Users className="w-4 h-4" />
              <span className={isMobile ? 'text-xs' : ''}>FAQ</span>
            </TabsTrigger>
          </TabsList>

          {/* 기능 소개 탭 */}
          <TabsContent value="overview" className="flex-1 overflow-auto">
            <div className="space-y-8">
              {/* 플랫폼 소개 */}
              <div className="text-center mb-8">
                <h2 className={`font-semibold mb-4 ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>🏥 건강관리 AI 플랫폼</h2>
                <p className={`text-muted-foreground max-w-2xl mx-auto ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  최신 AI 기술을 활용하여 24시간 건강 상담, 복약 관리, 질병 예측 등 
                  종합적인 건강관리 서비스를 제공합니다.
                </p>
              </div>

              {/* 플랫폼 특징 */}
              <Card className="border-glow mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    플랫폼 핵심 특징
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${
                    isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
                  }`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Brain className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">AI 기반</h4>
                        <p className="text-xs text-muted-foreground">최신 의학 AI</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="w-8 h-8 text-green-500" />
                      <div>
                        <h4 className="font-medium">24/7 서비스</h4>
                        <p className="text-xs text-muted-foreground">언제든 이용</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Shield className="w-8 h-8 text-purple-500" />
                      <div>
                        <h4 className="font-medium">개인정보 보호</h4>
                        <p className="text-xs text-muted-foreground">암호화 저장</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Smartphone className="w-8 h-8 text-orange-500" />
                      <div>
                        <h4 className="font-medium">모바일 최적화</h4>
                        <p className="text-xs text-muted-foreground">어디서나 접근</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 기능별 카드 */}
              <div className={`grid gap-6 ${
                isMobile 
                  ? 'grid-cols-1' 
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card 
                      key={feature.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 card-elevated border-glow group hover:scale-105"
                      onClick={() => {
                        setActiveFeature(feature.id);
                        setActiveTab('guide');
                      }}
                    >
                      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${
                              isMobile ? 'text-base' : 'text-lg'
                            }`}>{feature.title}</h3>
                            <p className={`text-muted-foreground ${
                              isMobile ? 'text-xs' : 'text-sm'
                            }`}>{feature.subtitle}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        <p className={`text-muted-foreground mb-4 ${
                          isMobile ? 'text-sm' : ''
                        }`}>{feature.description}</p>

                        <div className="space-y-2">
                          {feature.features.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate(feature.id);
                            }}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            {feature.title} 바로가기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* 사용 방법 탭 */}
          <TabsContent value="guide" className="flex-1 overflow-auto">
            <div className="space-y-6">
              {/* 기능 선택 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  const isActive = activeFeature === feature.id;
                  return (
                    <Button
                      key={feature.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFeature(feature.id)}
                      className={`flex flex-col gap-2 h-auto p-3 ${
                        isActive ? 'gradient-primary text-white' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className={isMobile ? 'text-xs' : 'text-sm'}>
                        {feature.title}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {/* 선택된 기능 상세 가이드 */}
              <Card className="border-glow">
                <CardHeader className={`bg-gradient-to-br ${selectedFeature.gradient} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center gap-3">
                    <selectedFeature.icon className="w-6 h-6" />
                    <div>
                      <h3 className={isMobile ? 'text-lg' : 'text-xl'}>{selectedFeature.title}</h3>
                      <p className={`opacity-90 font-normal ${
                        isMobile ? 'text-sm' : ''
                      }`}>{selectedFeature.subtitle}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="space-y-6">
                    {/* 단계별 가이드 */}
                    <div>
                      <h4 className={`font-semibold mb-4 ${
                        isMobile ? 'text-base' : 'text-lg'
                      }`}>📋 단계별 사용 방법</h4>
                      <div className="space-y-4">
                        {selectedFeature.steps.map((step) => (
                          <div key={step.step} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                                {step.step}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-medium mb-1 ${
                                isMobile ? 'text-sm' : ''
                              }`}>{step.title}</h5>
                              <p className={`text-muted-foreground mb-2 ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>{step.description}</p>
                              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className={`text-blue-700 dark:text-blue-300 ${
                                  isMobile ? 'text-xs' : 'text-sm'
                                }`}>
                                  💡 <strong>팁:</strong> {step.tip}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 기능별 특별 안내 */}
                    {selectedFeature.id === 'voice' && (
                      <Alert>
                        <Headphones className="h-4 w-4" />
                        <AlertDescription>
                          <strong>음성 상담 최적화 팁:</strong>
                          <br />• 모바일: 앱 진입 시 마이크 권한을 미리 허용하면 첫 질문부터 자동 음성 재생
                          <br />• iOS: Chrome 앱 사용 권장 (Safari는 음성 인식 제한)
                          <br />• 조용한 환경에서 명확한 발음으로 질문하세요
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedFeature.id === 'symptoms' && (
                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          <strong>정확한 진단을 위한 팁:</strong>
                          <br />• 여러 증상을 동시에 선택하여 종합적인 분석을 받으세요
                          <br />• 증상의 정도(1-10)와 지속 기간을 정확히 입력하세요
                          <br />• 결과는 참고용이며, 정확한 진단은 의료진과 상담하세요
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 바로가기 버튼 */}
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => onNavigate(selectedFeature.id)}
                        className="gradient-primary text-white flex-1"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {selectedFeature.title} 사용하기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ 탭 */}
          <TabsContent value="faq" className="flex-1 overflow-auto">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className={`font-semibold mb-2 ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>❓ 자주 묻는 질문</h2>
                <p className={`text-muted-foreground ${
                  isMobile ? 'text-sm' : ''
                }`}>사용자들이 가장 궁금해하는 질문들을 모았습니다</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="border-glow">
                    <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                      <h4 className={`font-medium mb-3 text-primary ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Q{index + 1}. {faq.question}
                      </h4>
                      <p className={`text-muted-foreground ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 추가 도움 */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
                <CardContent className="p-6">
                  <h3 className={`font-semibold mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    🤝 추가 도움이 필요하신가요?
                  </h3>
                  <p className={`text-muted-foreground mb-4 ${
                    isMobile ? 'text-sm' : ''
                  }`}>
                    더 궁금한 점이 있으시면 AI 상담을 통해 언제든지 문의해주세요.
                  </p>
                  <Button 
                    onClick={() => onNavigate('chat')}
                    className="gradient-primary text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    AI 상담하기
                  </Button>
                </CardContent>
              </Card>

              {/* 디바이스별 안내 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {deviceInfo.isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                    {deviceInfo.isMobile ? '모바일' : '데스크톱'} 사용 팁
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceInfo.isMobile ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">음성 상담 시 조용한 환경에서 사용하세요</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">권한 허용 후 더 편리한 기능을 이용할 수 있습니다</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">세로 모드에서 최적화되어 있습니다</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">키보드 단축키로 더 빠른 사용이 가능합니다</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">큰 화면으로 더 많은 정보를 한번에 확인할 수 있습니다</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">마우스와 키보드를 활용한 효율적인 입력이 가능합니다</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}