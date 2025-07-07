import { useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = {
  blood_pressure: [
    { date: "12/25", systolic: 120, diastolic: 80 },
    { date: "12/26", systolic: 125, diastolic: 82 },
    { date: "12/27", systolic: 118, diastolic: 78 },
    { date: "12/28", systolic: 122, diastolic: 81 },
    { date: "12/29", systolic: 119, diastolic: 79 },
    { date: "12/30", systolic: 121, diastolic: 80 },
    { date: "01/01", systolic: 123, diastolic: 82 },
  ],
  weight: [
    { date: "12/25", value: 68.5 },
    { date: "12/26", value: 68.3 },
    { date: "12/27", value: 68.1 },
    { date: "12/28", value: 68.4 },
    { date: "12/29", value: 68.2 },
    { date: "12/30", value: 68.0 },
    { date: "01/01", value: 67.8 },
  ],
};

export function HealthDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<
    "blood_pressure" | "weight"
  >("blood_pressure");

  const healthStats = [
    {
      title: "혈압",
      value: "121/80",
      unit: "mmHg",
      status: "normal" as const,
      trend: "stable",
      icon: Heart,
      color: "text-green-600",
    },
    {
      title: "체중",
      value: "67.8",
      unit: "kg",
      status: "normal" as const,
      trend: "down",
      icon: Scale,
      color: "text-blue-600",
    },
    {
      title: "혈당",
      value: "95",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "up",
      icon: Activity,
      color: "text-purple-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-800">정상</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">주의</Badge>;
      case "danger":
        return <Badge className="bg-red-100 text-red-800">위험</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" />
              건강 기록
            </h1>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="text-xs bg-green-500/20 text-primary-foreground border-green-500/30"
              >
                데이터
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-primary-foreground/30 text-primary-foreground"
              >
                <Plus className="w-3 h-3 mr-1" />
                기록 추가
              </Button>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/80">
            건강 지표를 기록하고 추세를 분석하세요
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {healthStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold">
                            {stat.value}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {stat.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(stat.trend)}
                      {getStatusBadge(stat.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>추세 분석</span>
              <div className="flex gap-2">
                <Button
                  variant={
                    selectedMetric === "blood_pressure" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedMetric("blood_pressure")}
                >
                  혈압
                </Button>
                <Button
                  variant={selectedMetric === "weight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric("weight")}
                >
                  체중
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === "blood_pressure" ? (
                  <LineChart data={mockData.blood_pressure}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#8884d8"
                      name="수축기"
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#82ca9d"
                      name="이완기"
                    />
                  </LineChart>
                ) : (
                  <LineChart data={mockData.weight}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="체중 (kg)"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
