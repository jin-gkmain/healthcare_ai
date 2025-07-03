import { useState } from 'react';
import { Users, Heart, MessageCircle, TrendingUp, Award, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';

export function HealthCommunity() {
  const [activeTab, setActiveTab] = useState('community');

  const communities = [
    {
      id: 1,
      name: '다이어트 챌린지',
      members: 2847,
      category: '운동',
      description: '함께하는 건강한 체중 관리',
      isJoined: true,
      color: 'bg-green-500'
    },
    {
      id: 2,
      name: '수면 개선 클럽',
      members: 1593,
      category: '수면',
      description: '더 나은 잠을 위한 습관 만들기',
      isJoined: false,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: '스트레스 관리',
      members: 3241,
      category: '정신건강',
      description: '명상과 힐링으로 마음 챙김',
      isJoined: true,
      color: 'bg-purple-500'
    }
  ];

  const posts = [
    {
      id: 1,
      author: 'HealthyMom',
      avatar: 'HM',
      community: '다이어트 챌린지',
      title: '30일 챌린지 완주했어요! 🎉',
      content: '드디어 목표 체중 달성! 여러분 응원 덕분에 포기하지 않을 수 있었어요.',
      likes: 42,
      comments: 15,
      timeAgo: '2시간 전',
      image: true
    },
    {
      id: 2,
      author: 'FitnessGuru',
      avatar: 'FG',
      community: '수면 개선 클럽',
      title: '수면 앱 추천드려요',
      content: '제가 사용해본 수면 추적 앱 중 가장 정확하고 유용한 것 같아요. 수면 패턴 분석이 정말 도움됐습니다.',
      likes: 28,
      comments: 8,
      timeAgo: '4시간 전',
      image: false
    },
    {
      id: 3,
      author: 'ZenMaster',
      avatar: 'ZM',
      community: '스트레스 관리',
      title: '명상 초보자를위한 5분 루틴',
      content: '매일 아침 5분씩 시작해보세요. 간단한 호흡법으로도 하루가 달라집니다.',
      likes: 67,
      comments: 23,
      timeAgo: '6시간 전',
      image: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: '건강왕', points: 2847, badge: '🏆' },
    { rank: 2, name: 'FitLife', points: 2653, badge: '🥈' },
    { rank: 3, name: 'WellnessExpert', points: 2441, badge: '🥉' },
    { rank: 4, name: 'HealthyChoice', points: 2298, badge: '🏅' },
    { rank: 5, name: 'ActiveLife', points: 2156, badge: '⭐' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-pink-500/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Users className="w-6 h-6" />
            헬스 커뮤니티
          </h1>
          <p className="text-primary-foreground/80">
            같은 목표를 가진 사람들과 함께 건강한 여정을 시작하세요
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-border/50 bg-card/50">
        {[
          { id: 'community', label: '커뮤니티', icon: Users },
          { id: 'posts', label: '피드', icon: MessageCircle },
          { id: 'ranking', label: '랭킹', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="관심있는 커뮤니티를 찾아보세요..."
                className="pl-10 rounded-xl"
              />
            </div>

            {/* 내가 참여한 커뮤니티 */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                참여중인 커뮤니티
              </h3>
              {communities.filter(c => c.isJoined).map((community) => (
                <Card key={community.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${community.color} rounded-xl flex items-center justify-center`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">{community.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{community.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            멤버 {community.members.toLocaleString()}명
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">참여중</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 추천 커뮤니티 */}
            <div className="space-y-3">
              <h3 className="font-semibold">추천 커뮤니티</h3>
              {communities.filter(c => !c.isJoined).map((community) => (
                <Card key={community.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${community.color} rounded-xl flex items-center justify-center`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">{community.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{community.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            멤버 {community.members.toLocaleString()}명
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Plus className="w-4 h-4 mr-1" />
                        참여
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{post.author}</span>
                        <Badge variant="outline" className="text-xs">{post.community}</Badge>
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                      </div>
                      <h4 className="font-medium mb-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                      {post.image && (
                        <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-muted-foreground">📸 이미지</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-red-500">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  이번 주 건강 리더보드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      <span className="text-xl">{user.badge}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.points} 포인트</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">#{user.rank}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 내 랭킹 */}
            <Card className="card-elevated border-primary/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-semibold">나의 랭킹</div>
                  <div className="text-lg font-bold text-primary">#42</div>
                  <div className="text-sm text-muted-foreground">1,847 포인트</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    상위 15%에 도달했습니다!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}