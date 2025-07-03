import { Phone, AlertTriangle, Heart, Thermometer, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface EmergencyContact {
  name: string;
  number: string;
  description: string;
}

interface EmergencyGuide {
  id: string;
  title: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  icon: any;
  symptoms: string[];
  steps: string[];
  whenToCall911: string[];
}

const emergencyContacts: EmergencyContact[] = [
  { name: '119 응급실', number: '119', description: '생명이 위급한 응급상황' },
  { name: '응급의료정보센터', number: '1339', description: '응급의료 정보 및 상담' },
  { name: '중독정보센터', number: '1588-7129', description: '중독 응급상황' },
  { name: '자살예방상담전화', number: '1393', description: '정신건강 위기상황' },
];

const emergencyGuides: EmergencyGuide[] = [
  {
    id: '1',
    title: '심장마비/심정지',
    category: '순환기',
    urgency: 'high',
    icon: Heart,
    symptoms: ['가슴 통증', '숨가쁨', '의식 잃음', '맥박 없음'],
    steps: [
      '즉시 119에 신고',
      '환자를 평평한 곳에 눕히기',
      'CPR 시작 (가슴 압박 30회 + 인공호흡 2회)',
      '구조대 도착까지 계속 실시',
    ],
    whenToCall911: ['의식을 잃었을 때', '맥박이 없을 때', '호흡이 없을 때'],
  },
  {
    id: '2',
    title: '뇌졸중',
    category: '신경계',
    urgency: 'high',
    icon: Zap,
    symptoms: ['한쪽 마비', '언어장애', '심한 두통', '시야장애'],
    steps: [
      '즉시 119에 신고',
      '환자를 안전한 곳으로 이동',
      '기도 확보 (목을 뒤로 젖히기)',
      '의식 확인 및 관찰',
      '구토 시 얼굴을 옆으로 돌리기',
    ],
    whenToCall911: ['갑작스런 마비 증상', '심한 두통', '의식 저하', '언어장애'],
  },
  {
    id: '3',
    title: '고열/열사병',
    category: '전신',
    urgency: 'medium',
    icon: Thermometer,
    symptoms: ['고열 (39°C 이상)', '땀이 안남', '의식 혼란', '구토'],
    steps: [
      '시원한 곳으로 이동',
      '옷을 느슨하게 풀기',
      '차가운 물수건으로 체온 낮추기',
      '의식이 있으면 물 제공',
      '체온이 내려가지 않으면 병원 이송',
    ],
    whenToCall911: ['의식 잃음', '40°C 이상 고열', '경련 발생'],
  },
  {
    id: '4',
    title: '알레르기 반응',
    category: '면역계',
    urgency: 'medium',
    icon: AlertTriangle,
    symptoms: ['두드러기', '호흡곤란', '얼굴 붓기', '혈압 저하'],
    steps: [
      '알레르기 원인 제거',
      '에피펜 있으면 즉시 사용',
      '항히스타민제 복용',
      '의식 확인',
      '필요시 119 신고',
    ],
    whenToCall911: ['호흡곤란', '의식 저하', '혈압 급격한 저하', '전신 반응'],
  },
];

export function EmergencyGuide() {
  const makePhoneCall = (number: string) => {
    window.open(`tel:${number}`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '매우 위급';
      case 'medium':
        return '위급';
      case 'low':
        return '일반';
      default:
        return '-';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1>응급상황 가이드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          응급상황별 대처법과 연락처를 확인하세요
        </p>
      </div>

      {/* 응급 연락처 */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Phone className="w-5 h-5" />
            응급 연락처
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => makePhoneCall(contact.number)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                {contact.number}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 응급상황별 가이드 */}
      <div className="space-y-4">
        <h3>응급상황별 대처법</h3>
        {emergencyGuides.map((guide) => {
          const Icon = guide.icon;
          return (
            <Card key={guide.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {guide.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{guide.category}</Badge>
                    <Badge className={getUrgencyColor(guide.urgency)}>
                      {getUrgencyText(guide.urgency)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 증상 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">주요 증상</h4>
                  <div className="flex flex-wrap gap-1">
                    {guide.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 대처법 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">대처법</h4>
                  <ol className="space-y-1">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="text-sm flex gap-2">
                        <span className="text-muted-foreground min-w-[1.5rem]">
                          {index + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 119 신고 시점 */}
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>즉시 119 신고해야 하는 경우:</strong>
                    <ul className="mt-1 space-y-1">
                      {guide.whenToCall911.map((situation, index) => (
                        <li key={index} className="text-sm flex gap-1">
                          <span>•</span>
                          <span>{situation}</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            ⚠️ <strong>중요:</strong> 이 가이드는 응급상황 시 참고용입니다. 심각한 응급상황에서는 즉시 119에 신고하고 전문 의료진의 지시를 받으시기 바랍니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}