import { useState } from "react";
import { Plus, Pill, Clock, Bell, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
  reminderEnabled: boolean;
  nextDose: Date;
  color: string;
}

const mockMedications: Medication[] = [
  {
    id: "1",
    name: "아스피린",
    dosage: "100mg",
    frequency: "daily",
    times: ["08:00"],
    notes: "식후 복용",
    reminderEnabled: true,
    nextDose: new Date(2025, 0, 2, 8, 0),
    color: "bg-red-100 text-red-800",
  },
  {
    id: "2",
    name: "비타민 D",
    dosage: "1000IU",
    frequency: "daily",
    times: ["09:00"],
    reminderEnabled: true,
    nextDose: new Date(2025, 0, 2, 9, 0),
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "3",
    name: "혈압약",
    dosage: "5mg",
    frequency: "twice",
    times: ["08:00", "20:00"],
    notes: "공복에 복용 금지",
    reminderEnabled: false,
    nextDose: new Date(2025, 0, 2, 20, 0),
    color: "bg-blue-100 text-blue-800",
  },
];

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const toggleReminder = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, reminderEnabled: !med.reminderEnabled } : med
      )
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "하루 1회";
      case "twice":
        return "하루 2회";
      case "thrice":
        return "하루 3회";
      case "weekly":
        return "주 1회";
      default:
        return frequency;
    }
  };

  const getTimeUntilNext = (nextDose: Date) => {
    const now = new Date();
    const diff = nextDose.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return "복용 시간이 지났습니다";
    if (hours === 0) return `${minutes}분 후`;
    return `${hours}시간 ${minutes}분 후`;
  };

  const todayDoses = medications
    .flatMap((med) =>
      med.times.map((time) => ({
        ...med,
        time,
        taken: Math.random() > 0.5, // 랜덤으로 복용 여부 설정
      }))
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="gradient-primary p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-blue-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
              <Pill className="w-4 h-4" />
              약물 관리
            </h1>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="text-xs bg-blue-500/20 text-primary-foreground border-blue-500/30"
              >
                관리
              </Badge>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/80">
            복용 중인 약물을 관리하고 알림을 설정하세요
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">약물 목록</span>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                약물 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 약물 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="med-name">약물명</Label>
                  <Input id="med-name" placeholder="약물명을 입력하세요" />
                </div>
                <div>
                  <Label htmlFor="dosage">용량</Label>
                  <Input id="dosage" placeholder="예: 100mg, 1정" />
                </div>
                <div>
                  <Label htmlFor="frequency">복용 빈도</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="복용 빈도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">하루 1회</SelectItem>
                      <SelectItem value="twice">하루 2회</SelectItem>
                      <SelectItem value="thrice">하루 3회</SelectItem>
                      <SelectItem value="weekly">주 1회</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">복용 방법 (선택사항)</Label>
                  <Textarea id="notes" placeholder="식후 복용, 공복 금지 등" />
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="w-full"
                >
                  추가하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 오늘의 복용 일정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              오늘의 복용 일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayDoses.map((dose, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dose.taken ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{dose.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dose.dosage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{dose.time}</p>
                    <p className="text-sm text-muted-foreground">
                      {dose.taken ? "복용 완료" : "복용 대기"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 등록된 약물 목록 */}
        <div className="space-y-4">
          <h3>등록된 약물</h3>
          {medications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4" />
                      <h4>{medication.name}</h4>
                      <Badge className={medication.color}>
                        {medication.dosage}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{getFrequencyText(medication.frequency)}</span>
                        <span>({medication.times.join(", ")})</span>
                      </div>

                      {medication.notes && (
                        <p className="text-xs">{medication.notes}</p>
                      )}

                      <p className="text-xs text-blue-600">
                        다음 복용: {getTimeUntilNext(medication.nextDose)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      <Switch
                        checked={medication.reminderEnabled}
                        onCheckedChange={() => toggleReminder(medication.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMedication(medication.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
