import { useState } from 'react';
import { BookOpen, Heart, Apple, Dumbbell, Moon, Search, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface HealthArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: string;
  tags: string[];
  author: string;
  publishDate: string;
}

interface HealthTip {
  id: string;
  category: string;
  tip: string;
  description: string;
  icon: any;
}

const healthArticles: HealthArticle[] = [
  {
    id: '1',
    title: '겨울철 면역력 강화하는 5가지 방법',
    category: '면역력',
    content: '추운 겨울철, 우리 몸의 면역력을 강화하여 감기와 독감을 예방하는 실용적인 방법들을 소개합니다. 충분한 수면, 규칙적인 운동, 균형 잡힌 영양 섭취가 핵심입니다.',
    readTime: '5분',
    tags: ['면역력', '겨울건강', '예방'],
    author: 'Dr. 김건강',
    publishDate: '2025-01-01',
  },
  {
    id: '2',
    title: '스마트폰 목 증후군, 예방과 치료법',
    category: '근골격계',
    content: '현대인의 고질병인 거북목 증후군의 원인과 증상, 그리고 효과적인 예방법과 스트레칭 방법을 상세히 알아봅니다.',
    readTime: '7분',
    tags: ['거북목', '스트레칭', '현대병'],
    author: 'Dr. 이바른',
    publishDate: '2024-12-30',
  },
  {
    id: '3',
    title: '혈압 관리의 모든 것: 식단부터 운동까지',
    category: '순환기',
    content: '고혈압 예방과 관리를 위한 종합 가이드입니다. 생활습관 개선부터 약물 치료까지 체계적으로 설명합니다.',
    readTime: '10분',
    tags: ['혈압', '고혈압', '생활습관'],
    author: 'Dr. 박혈관',
    publishDate: '2024-12-28',
  },
  {
    id: '4',
    title: '당뇨병 환자를 위한 혈당 관리 가이드',
    category: '내분비',
    content: '당뇨병 환자들이 일상생활에서 혈당을 효과적으로 관리할 수 있는 실용적인 팁과 주의사항을 제공합니다.',
    readTime: '8분',
    tags: ['당뇨병', '혈당', '식단관리'],
    author: 'Dr. 최당뇨',
    publishDate: '2024-12-25',
  },
];

const healthTips: HealthTip[] = [
  {
    id: '1',
    category: '영양',
    tip: '하루 8잔의 물 마시기',
    description: '충분한 수분 섭취는 신진대사를 촉진하고 독소 배출에 도움이 됩니다.',
    icon: Apple,
  },
  {
    id: '2',
    category: '운동',
    tip: '계단 오르기 습관화',
    description: '엘리베이터 대신 계단을 이용하면 심폐기능 향상에 효과적입니다.',
    icon: Dumbbell,
  },
  {
    id: '3',
    category: '수면',
    tip: '규칙적인 수면 패턴 유지',
    description: '매일 같은 시간에 잠자리에 들고 일어나는 것이 건강한 수면의 기본입니다.',
    icon: Moon,
  },
  {
    id: '4',
    category: '스트레스',
    tip: '깊은 호흡 연습',
    description: '스트레스를 받을 때 4초 들이쉬고 4초 참고 4초 내쉬는 호흡법을 시도해보세요.',
    icon: Heart,
  },
];

export function HealthInfo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('articles');

  const filteredArticles = healthArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTips = healthTips.filter(tip =>
    tip.tip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['전체', '면역력', '근골격계', '순환기', '내분비', '정신건강'];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1>건강 정보</h1>
        <p className="text-sm text-muted-foreground mt-1">
          전문의가 제공하는 건강 정보와 실용적인 건강 팁을 확인하세요
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="건강 정보를 검색하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">건강 기사</TabsTrigger>
          <TabsTrigger value="tips">건강 팁</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{article.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span>•</span>
                        <span>{article.readTime} 읽기</span>
                        <span>•</span>
                        <span>{article.author}</span>
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      읽기
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(article.publishDate).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4">
            {filteredTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card key={tip.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{tip.tip}</h4>
                          <Badge variant="outline" className="text-xs">
                            {tip.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-green-800 mb-2">💡 오늘의 건강 팁</h4>
              <p className="text-sm text-green-700">
                매일 30분씩 햇볕을 쬐면 비타민 D 합성에 도움이 되어 뼈 건강과 면역력 향상에 좋습니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            📚 <strong>참고:</strong> 모든 건강 정보는 참고용이며, 개인의 건강 상태에 따라 다를 수 있습니다. 구체적인 의학적 조언이 필요한 경우 전문의와 상담하시기 바랍니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}