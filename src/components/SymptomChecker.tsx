import { useState, useCallback } from "react";
import {
  Search,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Heart,
  Brain,
  Stethoscope,
  Activity,
  RotateCcw,
  ArrowLeft,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  ArrowRight,
  Eye,
  User,
  Bone,
  Baby,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { PageHeader } from "./ui/page-header";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

interface SymptomCheckerProps {
  onNavigate: (tab: string) => void;
  deviceInfo: DeviceInfo;
}

// SNOMED CT 기반 신체 부위별 증상 분류 (확장)
interface BodyPart {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  emoji: string;
  snomedCode: string; // SNOMED CT 코드 추가
  commonSymptoms: SimpleSymptom[];
}

interface SimpleSymptom {
  id: string;
  name: string;
  description: string;
  snomedCode: string; // SNOMED CT 코드 추가
  commonness: "common" | "moderate" | "rare";
  severity: "mild" | "moderate" | "concerning" | "urgent";
  relatedQuestions?: string[];
  keywords?: string[]; // 검색 키워드 추가
}

interface SelectedSymptom extends SimpleSymptom {
  intensity: number; // 1-10
  duration: string;
  frequency: string;
  additionalInfo?: string;
}

// 분석 결과 타입 정의
interface PossibleCondition {
  name: string;
  probability: string;
  description: string;
}

interface AnalysisResult {
  riskLevel: string;
  confidence: number;
  recommendations: string[];
  possibleConditions: PossibleCondition[];
  nextSteps: string[];
  urgency: string;
}

// SNOMED CT 기반 확장된 신체 부위별 증상 데이터
const bodyParts: BodyPart[] = [
  {
    id: "nervous_system",
    name: "신경계/정신",
    icon: Brain,
    description: "두통, 어지러움, 기억력, 우울, 불안 등",
    emoji: "🧠",
    snomedCode: "25087005", // Nervous system structure
    commonSymptoms: [
      {
        id: "headache_general",
        name: "두통",
        description: "머리가 아프거나 무거운 느낌",
        snomedCode: "25064002",
        commonness: "common",
        severity: "mild",
        keywords: ["머리아픔", "머리가아파", "두통", "머리무거움"],
        relatedQuestions: [
          "스트레스가 많으신가요?",
          "잠을 충분히 주무셨나요?",
          "목과 어깨가 뻣뻣한가요?",
        ],
      },
      {
        id: "dizziness",
        name: "어지럼증",
        description: "머리가 어지럽거나 균형을 잡기 어려운 느낌",
        snomedCode: "404640003",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["어지러움", "현기증", "빙빙돔", "균형감각"],
        relatedQuestions: [
          "갑자기 일어날 때 어지러우신가요?",
          "귀에 이상한 소리가 들리나요?",
        ],
      },
      {
        id: "migraine",
        name: "편두통",
        description: "한쪽 머리가 욱신거리며 아픈 증상",
        snomedCode: "37796009",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["편두통", "한쪽머리", "욱신거림", "맥박성두통"],
        relatedQuestions: ["빛이 눈부시게 느껴지나요?", "메스꺼움이 있나요?"],
      },
      {
        id: "memory_problems",
        name: "기억력 문제",
        description: "기억이 잘 나지 않거나 집중력이 떨어지는 증상",
        snomedCode: "386807006",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["기억력", "건망증", "집중력", "깜빡깜빡"],
        relatedQuestions: [
          "최근에 스트레스가 많으셨나요?",
          "수면 패턴이 불규칙한가요?",
        ],
      },
      {
        id: "anxiety",
        name: "불안감",
        description: "이유 없이 불안하거나 초조한 느낌",
        snomedCode: "48694002",
        commonness: "common",
        severity: "moderate",
        keywords: ["불안", "초조", "걱정", "공황"],
        relatedQuestions: [
          "심장이 빠르게 뛰나요?",
          "숨이 가빠지나요?",
          "땀이 많이 나나요?",
        ],
      },
      {
        id: "depression",
        name: "우울감",
        description: "기분이 가라앉고 의욕이 없는 상태",
        snomedCode: "35489007",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["우울", "슬픔", "의욕없음", "무기력"],
        relatedQuestions: [
          "잠들기 어려우신가요?",
          "식욕이 떨어졌나요?",
          "즐거웠던 일에 흥미를 잃으셨나요?",
        ],
      },
    ],
  },
  {
    id: "eyes_ears_nose_throat",
    name: "눈/귀/코/목",
    icon: Eye,
    description: "시야 문제, 청력 문제, 코막힘, 인후통 등",
    emoji: "👁️",
    snomedCode: "774007", // Head and neck structure
    commonSymptoms: [
      {
        id: "vision_problems",
        name: "시야 장애",
        description: "시력이 흐리거나 물체가 잘 안 보이는 증상",
        snomedCode: "63102001",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["시력", "시야", "눈", "안보임", "흐림"],
        relatedQuestions: [
          "한쪽 눈만 문제인가요?",
          "갑자기 시작되었나요?",
          "두통도 함께 있나요?",
        ],
      },
      {
        id: "eye_pain",
        name: "눈 통증",
        description: "눈이 아프거나 따가운 느낌",
        snomedCode: "41652007",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["눈아픔", "눈따가움", "안구통증"],
        relatedQuestions: [
          "컴퓨터를 오래 보셨나요?",
          "눈이 건조한 느낌인가요?",
        ],
      },
      {
        id: "hearing_loss",
        name: "청력 저하",
        description: "소리가 잘 들리지 않거나 먹먹한 느낌",
        snomedCode: "343087000",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["청력", "귀", "안들림", "먹먹함"],
        relatedQuestions: [
          "한쪽 귀만 문제인가요?",
          "귀에서 소리가 나나요?",
          "어지럼증도 있나요?",
        ],
      },
      {
        id: "tinnitus",
        name: "이명",
        description: "귀에서 웅웅거리거나 삐 소리가 나는 증상",
        snomedCode: "60862001",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["이명", "귀웅웅", "귀소리", "삐소리"],
        relatedQuestions: ["스트레스가 많으신가요?", "큰 소리에 노출되셨나요?"],
      },
      {
        id: "nasal_congestion",
        name: "코막힘",
        description: "코가 막히고 숨쉬기 어려운 증상",
        snomedCode: "68235000",
        commonness: "common",
        severity: "mild",
        keywords: ["코막힘", "콧막힘", "코답답"],
        relatedQuestions: [
          "감기 기운이 있나요?",
          "알레르기가 있으신가요?",
          "콧물도 나나요?",
        ],
      },
      {
        id: "sore_throat",
        name: "인후통",
        description: "목이 칼칼하거나 삼키기 아픈 증상",
        snomedCode: "405737000",
        commonness: "common",
        severity: "mild",
        keywords: ["목아픔", "인후통", "목칼칼", "삼키기아픔"],
        relatedQuestions: [
          "침 삼킬 때 아프신가요?",
          "목소리가 쉬셨나요?",
          "발열이 있나요?",
        ],
      },
      {
        id: "hoarseness",
        name: "목소리 변화",
        description: "목소리가 쉬거나 변한 증상",
        snomedCode: "50219008",
        commonness: "moderate",
        severity: "mild",
        keywords: ["목소리", "쉰목소리", "음성변화"],
        relatedQuestions: ["큰 소리로 말씀하셨나요?", "기침이 심했나요?"],
      },
    ],
  },
  {
    id: "cardiovascular",
    name: "심혈관계",
    icon: Heart,
    description: "가슴 통증, 심계항진, 부종, 혈압 등",
    emoji: "❤️",
    snomedCode: "113257007", // Cardiovascular system
    commonSymptoms: [
      {
        id: "chest_pain",
        name: "가슴 통증",
        description: "가슴이 아프거나 조이는 느낌",
        snomedCode: "29857009",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["가슴아픔", "흉통", "가슴조임", "가슴답답"],
        relatedQuestions: [
          "운동할 때 더 아픈가요?",
          "숨쉬기 어려우신가요?",
          "팔이나 목으로 통증이 퍼지나요?",
        ],
      },
      {
        id: "heart_palpitations",
        name: "심계항진",
        description: "심장이 빠르게 뛰거나 불규칙하게 뛰는 느낌",
        snomedCode: "80313002",
        commonness: "common",
        severity: "moderate",
        keywords: ["심장두근거림", "맥박빨라짐", "가슴뛰는"],
        relatedQuestions: [
          "카페인을 많이 드셨나요?",
          "스트레스가 심한가요?",
          "어지럼증도 있나요?",
        ],
      },
      {
        id: "swelling",
        name: "부종",
        description: "발목, 다리, 손이 붓는 증상",
        snomedCode: "267038008",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["부종", "붓기", "다리붓기", "발목붓기"],
        relatedQuestions: [
          "아침에 심한가요?",
          "오래 서있으셨나요?",
          "신장 문제가 있으신가요?",
        ],
      },
      {
        id: "high_blood_pressure",
        name: "고혈압 증상",
        description: "혈압이 높아서 나타나는 증상들",
        snomedCode: "38341003",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["고혈압", "혈압높음", "혈압상승"],
        relatedQuestions: [
          "두통이 있나요?",
          "목이 뻣뻣한가요?",
          "코피가 나나요?",
        ],
      },
      {
        id: "cold_extremities",
        name: "수족냉증",
        description: "손발이 차갑고 저린 증상",
        snomedCode: "271687000",
        commonness: "common",
        severity: "mild",
        keywords: ["수족냉증", "손발차가움", "혈액순환"],
        relatedQuestions: ["겨울에 더 심한가요?", "스트레스가 많으신가요?"],
      },
    ],
  },
  {
    id: "respiratory",
    name: "호흡기계",
    icon: Stethoscope,
    description: "기침, 호흡곤란, 가래, 천식 등",
    emoji: "🫁",
    snomedCode: "20139000", // Respiratory system
    commonSymptoms: [
      {
        id: "cough",
        name: "기침",
        description: "목이 간지럽거나 가래가 나오는 기침",
        snomedCode: "49727002",
        commonness: "common",
        severity: "mild",
        keywords: ["기침", "해수", "기침소리"],
        relatedQuestions: [
          "가래가 나오나요?",
          "목이 아프신가요?",
          "발열이 있나요?",
        ],
      },
      {
        id: "shortness_breath",
        name: "호흡곤란",
        description: "숨쉬기 어렵거나 숨이 차는 증상",
        snomedCode: "267036007",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["숨가쁨", "호흡곤란", "숨차는", "숨막힘"],
        relatedQuestions: [
          "평소보다 조금만 움직여도 숨이 차나요?",
          "밤에 숨이 차서 잠을 못 자나요?",
        ],
      },
      {
        id: "wheezing",
        name: "천명음",
        description: "숨쉴 때 쌕쌕거리는 소리가 나는 증상",
        snomedCode: "56018004",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["쌕쌕거림", "천명음", "호흡소리"],
        relatedQuestions: ["천식이 있으신가요?", "알레르기가 있으신가요?"],
      },
      {
        id: "phlegm",
        name: "가래",
        description: "목에서 끈적한 분비물이 나오는 증상",
        snomedCode: "45710003",
        commonness: "common",
        severity: "mild",
        keywords: ["가래", "담", "분비물", "끈적"],
        relatedQuestions: ["가래 색깔이 어떤가요?", "기침과 함께 나오나요?"],
      },
      {
        id: "chest_tightness",
        name: "가슴 답답함",
        description: "가슴이 답답하고 숨이 막히는 느낌",
        snomedCode: "23924001",
        commonness: "common",
        severity: "moderate",
        keywords: ["가슴답답", "흉부압박감", "숨막힘"],
        relatedQuestions: [
          "스트레스나 불안감이 있으신가요?",
          "계단 오를 때 더 답답한가요?",
        ],
      },
    ],
  },
  {
    id: "digestive",
    name: "소화기계",
    icon: Activity,
    description: "복통, 구토, 설사, 변비, 소화불량 등",
    emoji: "🤰",
    snomedCode: "86762007", // Digestive system
    commonSymptoms: [
      {
        id: "stomach_pain",
        name: "복통",
        description: "배가 아프거나 쥐어짜는 듯한 통증",
        snomedCode: "21522001",
        commonness: "common",
        severity: "moderate",
        keywords: ["복통", "배아픔", "배앓이", "위통"],
        relatedQuestions: [
          "식사 후에 더 아픈가요?",
          "설사나 변비가 있나요?",
          "어느 부위가 가장 아픈가요?",
        ],
      },
      {
        id: "nausea",
        name: "메스꺼움",
        description: "토할 것 같은 느낌이나 속이 울렁거림",
        snomedCode: "422587007",
        commonness: "common",
        severity: "mild",
        keywords: ["메스꺼움", "구역질", "속울렁"],
        relatedQuestions: ["실제로 토하셨나요?", "어지럼증도 함께 있나요?"],
      },
      {
        id: "vomiting",
        name: "구토",
        description: "실제로 토하는 증상",
        snomedCode: "422400008",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["구토", "토함", "게움"],
        relatedQuestions: [
          "열이 있나요?",
          "복통도 있나요?",
          "물도 못 드시겠나요?",
        ],
      },
      {
        id: "diarrhea",
        name: "설사",
        description: "묽은 변을 자주 보는 증상",
        snomedCode: "62315008",
        commonness: "common",
        severity: "moderate",
        keywords: ["설사", "묽은변", "복통설사"],
        relatedQuestions: [
          "하루에 몇 번 정도 하시나요?",
          "혈변이 섞여 있나요?",
          "복통도 있나요?",
        ],
      },
      {
        id: "constipation",
        name: "변비",
        description: "변을 보기 어렵거나 며칠간 안 나오는 증상",
        snomedCode: "14760008",
        commonness: "common",
        severity: "mild",
        keywords: ["변비", "변안나옴", "배변곤란"],
        relatedQuestions: [
          "며칠째 변을 못 보셨나요?",
          "배가 부른가요?",
          "가스가 안 나오나요?",
        ],
      },
      {
        id: "indigestion",
        name: "소화불량",
        description: "음식이 잘 소화되지 않고 속이 더부룩한 느낌",
        snomedCode: "139394000",
        commonness: "common",
        severity: "mild",
        keywords: ["소화불량", "속더부룩", "체함"],
        relatedQuestions: [
          "기름진 음식을 드셨나요?",
          "식사량이 평소보다 많았나요?",
        ],
      },
      {
        id: "heartburn",
        name: "속쓰림",
        description: "위산이 올라와서 가슴이 타는 듯한 느낌",
        snomedCode: "16331000",
        commonness: "common",
        severity: "mild",
        keywords: ["속쓰림", "위산", "가슴타는감"],
        relatedQuestions: [
          "식사 후에 더 심한가요?",
          "신 것이 목으로 올라오나요?",
        ],
      },
    ],
  },
  {
    id: "musculoskeletal",
    name: "근골격계",
    icon: Bone,
    description: "관절통, 근육통, 목/어깨/허리 통증 등",
    emoji: "🦴",
    snomedCode: "113192009", // Musculoskeletal system
    commonSymptoms: [
      {
        id: "back_pain",
        name: "허리 통증",
        description: "허리가 아프거나 뻣뻣한 증상",
        snomedCode: "161891005",
        commonness: "common",
        severity: "moderate",
        keywords: ["허리아픔", "요통", "허리뻣뻣"],
        relatedQuestions: [
          "오래 앉아 있으셨나요?",
          "무거운 것을 들으셨나요?",
          "다리로 저린감이 있나요?",
        ],
      },
      {
        id: "neck_pain",
        name: "목 통증",
        description: "목이 아프거나 돌리기 어려운 증상",
        snomedCode: "81680005",
        commonness: "common",
        severity: "mild",
        keywords: ["목아픔", "목뻣뻣", "목돌리기어려움"],
        relatedQuestions: [
          "컴퓨터를 오래 하셨나요?",
          "베개가 높으신가요?",
          "어깨도 아프신가요?",
        ],
      },
      {
        id: "shoulder_pain",
        name: "어깨 통증",
        description: "어깨가 아프거나 움직이기 어려운 증상",
        snomedCode: "45326000",
        commonness: "common",
        severity: "moderate",
        keywords: ["어깨아픔", "어깨결림", "어깨뻣뻣"],
        relatedQuestions: [
          "팔을 들 때 아프신가요?",
          "오십견 진단을 받으신 적이 있나요?",
        ],
      },
      {
        id: "joint_pain",
        name: "관절통",
        description: "무릎, 손목, 발목 등 관절이 아픈 증상",
        snomedCode: "57676002",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["관절아픔", "무릎아픔", "손목아픔", "발목아픔"],
        relatedQuestions: [
          "어느 관절이 아프신가요?",
          "부어있나요?",
          "아침에 뻣뻣한가요?",
        ],
      },
      {
        id: "muscle_pain",
        name: "근육통",
        description: "근육이 아프거나 경련이 나는 증상",
        snomedCode: "68962001",
        commonness: "common",
        severity: "mild",
        keywords: ["근육아픔", "근육통", "근육경련", "쥐남"],
        relatedQuestions: [
          "운동을 하셨나요?",
          "특정 부위가 아픈가요?",
          "마사지하면 나아지나요?",
        ],
      },
      {
        id: "leg_cramps",
        name: "다리 경련",
        description: "다리에 쥐가 나거나 경련이 일어나는 증상",
        snomedCode: "449917004",
        commonness: "moderate",
        severity: "mild",
        keywords: ["다리쥐", "다리경련", "종아리쥐"],
        relatedQuestions: [
          "밤에 자주 일어나나요?",
          "운동 후에 생기나요?",
          "물을 충분히 드시나요?",
        ],
      },
    ],
  },
  {
    id: "skin_hair",
    name: "피부/모발",
    icon: User,
    description: "발진, 가려움, 상처, 탈모, 피부 변화 등",
    emoji: "👤",
    snomedCode: "39937001", // Skin structure
    commonSymptoms: [
      {
        id: "skin_rash",
        name: "피부 발진",
        description: "피부에 빨간 반점이나 뭔가 올라온 증상",
        snomedCode: "271807003",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["발진", "빨간반점", "피부트러블", "뾰루지"],
        relatedQuestions: [
          "가려운가요?",
          "어디서 시작되었나요?",
          "새로운 제품을 사용하셨나요?",
        ],
      },
      {
        id: "itching",
        name: "가려움",
        description: "피부가 가렵고 긁고 싶은 증상",
        snomedCode: "418363000",
        commonness: "common",
        severity: "mild",
        keywords: ["가려움", "간지러움", "긁고싶음"],
        relatedQuestions: [
          "온몸이 가려운가요?",
          "발진도 있나요?",
          "특정 시간에 더 가려운가요?",
        ],
      },
      {
        id: "dry_skin",
        name: "피부 건조",
        description: "피부가 건조하고 각질이 일어나는 증상",
        snomedCode: "16386004",
        commonness: "common",
        severity: "mild",
        keywords: ["피부건조", "각질", "피부당김"],
        relatedQuestions: ["겨울에 더 심한가요?", "보습제를 사용하시나요?"],
      },
      {
        id: "wounds",
        name: "상처/염증",
        description: "상처가 잘 낫지 않거나 염증이 있는 증상",
        snomedCode: "416462003",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["상처", "염증", "안낫는상처", "곪음"],
        relatedQuestions: [
          "언제부터 시작되었나요?",
          "열감이 있나요?",
          "고름이 나오나요?",
        ],
      },
      {
        id: "hair_loss",
        name: "탈모",
        description: "머리카락이 많이 빠지거나 대머리가 되는 증상",
        snomedCode: "278040002",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["탈모", "머리카락빠짐", "대머리", "모발손실"],
        relatedQuestions: [
          "가족력이 있나요?",
          "스트레스가 많으셨나요?",
          "특정 부위만 빠지나요?",
        ],
      },
      {
        id: "acne",
        name: "여드름",
        description: "얼굴이나 몸에 여드름이 나는 증상",
        snomedCode: "88616000",
        commonness: "common",
        severity: "mild",
        keywords: ["여드름", "뾰루지", "트러블", "피지"],
        relatedQuestions: [
          "청소년기인가요?",
          "스트레스를 받으시나요?",
          "화장품을 바꾸셨나요?",
        ],
      },
    ],
  },
  {
    id: "genitourinary",
    name: "비뇨생식기",
    icon: User,
    description: "배뇨 문제, 생식기 증상, 신장 관련 등",
    emoji: "🚿",
    snomedCode: "21514008", // Genitourinary system
    commonSymptoms: [
      {
        id: "urination_problems",
        name: "배뇨 장애",
        description: "소변을 보기 어렵거나 자주 마려운 증상",
        snomedCode: "49650001",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["배뇨장애", "소변문제", "빈뇨", "소변어려움"],
        relatedQuestions: [
          "하루에 몇 번 정도 가시나요?",
          "밤에도 자주 일어나시나요?",
          "아프신가요?",
        ],
      },
      {
        id: "painful_urination",
        name: "배뇨통",
        description: "소변 볼 때 아프거나 따가운 증상",
        snomedCode: "49650001",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["배뇨통", "소변아픔", "소변따가움"],
        relatedQuestions: [
          "열이 있나요?",
          "혈뇨가 있나요?",
          "허리도 아프신가요?",
        ],
      },
      {
        id: "blood_urine",
        name: "혈뇨",
        description: "소변에 피가 섞여 나오는 증상",
        snomedCode: "34436003",
        commonness: "rare",
        severity: "urgent",
        keywords: ["혈뇨", "소변에피", "붉은소변"],
        relatedQuestions: [
          "언제부터 시작되었나요?",
          "복통도 있나요?",
          "외상을 입으셨나요?",
        ],
      },
      {
        id: "kidney_pain",
        name: "신장 부위 통증",
        description: "허리 옆구리가 아픈 증상",
        snomedCode: "30989003",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["신장통", "옆구리아픔", "허리옆아픔"],
        relatedQuestions: [
          "열이 있나요?",
          "소변 색깔이 이상한가요?",
          "메스꺼움이 있나요?",
        ],
      },
      {
        id: "genital_symptoms",
        name: "생식기 증상",
        description: "생식기 부위의 이상 증상",
        snomedCode: "118940003",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["생식기", "성기", "분비물", "가려움"],
        relatedQuestions: ["분비물이 있나요?", "가려운가요?", "냄새가 나나요?"],
      },
    ],
  },
  {
    id: "general_systemic",
    name: "전신 증상",
    icon: Users,
    description: "발열, 피로, 체중 변화, 수면 장애 등",
    emoji: "🌡️",
    snomedCode: "443742004", // General symptoms
    commonSymptoms: [
      {
        id: "fever",
        name: "발열",
        description: "체온이 올라가고 몸이 뜨거운 느낌",
        snomedCode: "386661006",
        commonness: "common",
        severity: "moderate",
        keywords: ["발열", "열", "몸뜨거움", "체온상승"],
        relatedQuestions: [
          "체온을 재보셨나요?",
          "오한이 있나요?",
          "몸살기가 있나요?",
        ],
      },
      {
        id: "chills",
        name: "오한",
        description: "몸이 떨리고 추운 느낌",
        snomedCode: "43724002",
        commonness: "common",
        severity: "moderate",
        keywords: ["오한", "몸떨림", "추위", "한기"],
        relatedQuestions: ["열도 있나요?", "감기 기운이 있나요?"],
      },
      {
        id: "fatigue",
        name: "피로감",
        description: "몸이 무겁고 기운이 없는 느낌",
        snomedCode: "84229001",
        commonness: "common",
        severity: "mild",
        keywords: ["피로", "기운없음", "무기력", "지침"],
        relatedQuestions: [
          "잠을 충분히 주무셨나요?",
          "최근에 스트레스가 많으셨나요?",
        ],
      },
      {
        id: "weight_loss",
        name: "체중 감소",
        description: "의도하지 않게 체중이 빠지는 증상",
        snomedCode: "89362005",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["체중감소", "살빠짐", "체중줄어듦"],
        relatedQuestions: [
          "얼마나 빠지셨나요?",
          "식욕이 떨어졌나요?",
          "스트레스가 많으셨나요?",
        ],
      },
      {
        id: "weight_gain",
        name: "체중 증가",
        description: "의도하지 않게 체중이 늘어나는 증상",
        snomedCode: "8943002",
        commonness: "moderate",
        severity: "mild",
        keywords: ["체중증가", "살찜", "몸무거움"],
        relatedQuestions: [
          "식습관이 바뀌셨나요?",
          "운동량이 줄었나요?",
          "붓는 느낌도 있나요?",
        ],
      },
      {
        id: "sleep_problems",
        name: "수면 장애",
        description: "잠들기 어렵거나 잠을 못 자는 증상",
        snomedCode: "301345002",
        commonness: "common",
        severity: "moderate",
        keywords: ["불면증", "잠못잠", "수면장애", "잠들기어려움"],
        relatedQuestions: [
          "스트레스가 많으신가요?",
          "몇 시간 정도 주무시나요?",
          "중간에 자주 깨시나요?",
        ],
      },
      {
        id: "night_sweats",
        name: "야간 발한",
        description: "밤에 많은 땀을 흘리는 증상",
        snomedCode: "42984000",
        commonness: "moderate",
        severity: "moderate",
        keywords: ["야간발한", "밤에땀", "식은땀"],
        relatedQuestions: [
          "열도 있나요?",
          "체중이 변했나요?",
          "스트레스가 많으신가요?",
        ],
      },
    ],
  },
  {
    id: "pediatric_women",
    name: "소아/여성 특수",
    icon: Baby,
    description: "성장 발달, 월경 관련, 임신 관련 증상 등",
    emoji: "👶",
    snomedCode: "394537008", // Pediatric specialty
    commonSymptoms: [
      {
        id: "growth_problems",
        name: "성장 지연",
        description: "키나 몸무게가 또래보다 작은 증상",
        snomedCode: "400004",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["성장지연", "키작음", "몸무게적음", "발달지연"],
        relatedQuestions: [
          "또래보다 많이 작나요?",
          "잘 먹나요?",
          "활동성은 어떤가요?",
        ],
      },
      {
        id: "menstrual_problems",
        name: "월경 이상",
        description: "월경 주기나 양의 변화",
        snomedCode: "386692008",
        commonness: "common",
        severity: "moderate",
        keywords: ["월경이상", "생리불순", "생리통", "월경과다"],
        relatedQuestions: [
          "주기가 불규칙한가요?",
          "양이 많이 변했나요?",
          "통증이 심한가요?",
        ],
      },
      {
        id: "morning_sickness",
        name: "입덧",
        description: "임신 초기 메스꺼움과 구토",
        snomedCode: "51885006",
        commonness: "common",
        severity: "mild",
        keywords: ["입덧", "임신메스꺼움", "임신구토"],
        relatedQuestions: [
          "임신 몇 주차인가요?",
          "물도 못 드시겠나요?",
          "체중이 줄었나요?",
        ],
      },
      {
        id: "developmental_delays",
        name: "발달 지연",
        description: "언어나 운동 발달이 늦는 증상",
        snomedCode: "62851004",
        commonness: "moderate",
        severity: "concerning",
        keywords: ["발달지연", "언어지연", "운동발달지연"],
        relatedQuestions: [
          "어떤 부분이 늦나요?",
          "또래와 비교해서 많이 다른가요?",
        ],
      },
      {
        id: "feeding_problems",
        name: "수유/식이 문제",
        description: "아기가 잘 먹지 않거나 토하는 증상",
        snomedCode: "282020008",
        commonness: "common",
        severity: "moderate",
        keywords: ["수유문제", "식이문제", "먹지않음", "잘토함"],
        relatedQuestions: [
          "얼마나 안 먹나요?",
          "토하는 양이 많나요?",
          "체중이 늘지 않나요?",
        ],
      },
      {
        id: "postmenopausal_symptoms",
        name: "갱년기 증상",
        description: "폐경 전후 나타나는 여러 증상들",
        snomedCode: "161712005",
        commonness: "common",
        severity: "mild",
        keywords: ["갱년기", "폐경", "홍조", "열감"],
        relatedQuestions: [
          "언제부터 시작되었나요?",
          "얼굴이 화끈거리나요?",
          "우울감도 있나요?",
        ],
      },
    ],
  },
];

const severityInfo = {
  mild: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "가벼움",
    icon: "😊",
    description: "일상생활에 큰 지장이 없는 정도",
  },
  moderate: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "보통",
    icon: "😐",
    description: "약간의 불편함이 있는 정도",
  },
  concerning: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "주의",
    icon: "😟",
    description: "관심을 가지고 지켜볼 필요가 있는 정도",
  },
  urgent: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "시급",
    icon: "😰",
    description: "빠른 대처가 필요한 정도",
  },
};

const commonnessInfo = {
  common: { color: "bg-blue-100 text-blue-800", label: "흔함", percentage: 80 },
  moderate: {
    color: "bg-purple-100 text-purple-800",
    label: "보통",
    percentage: 50,
  },
  rare: { color: "bg-gray-100 text-gray-800", label: "드뭄", percentage: 20 },
};

export function SymptomChecker({
  onNavigate,
  deviceInfo,
}: SymptomCheckerProps) {
  const [activeTab, setActiveTab] = useState("select");
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const isMobile = deviceInfo.isMobile;

  // 개선된 증상 검색 기능 (키워드 포함)
  const searchSymptoms = useCallback((query: string) => {
    if (!query.trim()) return [];

    const results: SimpleSymptom[] = [];
    const lowerQuery = query.toLowerCase();

    bodyParts.forEach((part) => {
      part.commonSymptoms.forEach((symptom) => {
        const isMatch =
          symptom.name.toLowerCase().includes(lowerQuery) ||
          symptom.description.toLowerCase().includes(lowerQuery) ||
          (symptom.keywords &&
            symptom.keywords.some((keyword) =>
              keyword.toLowerCase().includes(lowerQuery)
            ));

        if (isMatch) {
          results.push(symptom);
        }
      });
    });

    // 관련성 순으로 정렬
    return results.sort((a, b) => {
      const aExactMatch = a.name.toLowerCase().includes(lowerQuery);
      const bExactMatch = b.name.toLowerCase().includes(lowerQuery);
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      return 0;
    });
  }, []);

  const handleSymptomSelect = (symptom: SimpleSymptom) => {
    const existingIndex = selectedSymptoms.findIndex(
      (s) => s.id === symptom.id
    );

    if (existingIndex >= 0) {
      setSelectedSymptoms((prev) => prev.filter((s) => s.id !== symptom.id));
    } else {
      const newSymptom: SelectedSymptom = {
        ...symptom,
        intensity: 5,
        duration: "1-2일",
        frequency: "가끔",
        additionalInfo: "",
      };
      setSelectedSymptoms((prev) => [...prev, newSymptom]);
    }
  };

  const updateSymptomDetails = (
    symptomId: string,
    field: keyof SelectedSymptom,
    value: string | number
  ) => {
    setSelectedSymptoms((prev) =>
      prev.map((symptom) =>
        symptom.id === symptomId ? { ...symptom, [field]: value } : symptom
      )
    );
  };

  // 상세정보 탭으로 이동하는 함수
  const handleProceedToDetails = () => {
    setActiveTab("review");
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);

    // AI 분석 시뮬레이션
    setTimeout(() => {
      const urgentCount = selectedSymptoms.filter(
        (s) => s.severity === "urgent"
      ).length;
      const concerningCount = selectedSymptoms.filter(
        (s) => s.severity === "concerning"
      ).length;
      const avgIntensity =
        selectedSymptoms.reduce((sum, s) => sum + s.intensity, 0) /
        selectedSymptoms.length;

      let riskLevel = "low";
      if (urgentCount > 0) riskLevel = "urgent";
      else if (concerningCount > 0 || avgIntensity > 7) riskLevel = "medium";

      const analysisData = {
        riskLevel,
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
        recommendations: generateUserFriendlyRecommendations(selectedSymptoms),
        possibleConditions: generatePossibleConditions(selectedSymptoms),
        nextSteps: generateNextSteps(selectedSymptoms),
        urgency:
          urgentCount > 0
            ? "immediate"
            : concerningCount > 0
            ? "soon"
            : "routine",
      };

      setAnalysisResult(analysisData);
      setIsAnalyzing(false);
      setActiveTab("results");
    }, 2000);
  };

  const generateUserFriendlyRecommendations = (symptoms: SelectedSymptom[]) => {
    const recommendations = [];

    // 심각도별 추천사항
    if (symptoms.some((s) => s.severity === "urgent")) {
      recommendations.push("🚨 가능한 빨리 병원에 가보시는 것을 권합니다");
    } else if (symptoms.some((s) => s.severity === "concerning")) {
      recommendations.push("⚠️ 증상이 계속되면 의사와 상담해보세요");
    }

    // 확장된 증상별 맞춤 조언
    symptoms.forEach((symptom) => {
      if (symptom.name.includes("두통") || symptom.name.includes("편두통")) {
        recommendations.push("💧 충분한 수분 섭취와 휴식을 취하세요");
      }
      if (symptom.name.includes("기침") || symptom.name.includes("가래")) {
        recommendations.push("🍯 따뜻한 물이나 꿀차가 도움이 될 수 있어요");
      }
      if (symptom.name.includes("복통") || symptom.name.includes("소화")) {
        recommendations.push(
          "🥣 자극적인 음식을 피하고 소화가 잘 되는 음식을 드세요"
        );
      }
      if (symptom.name.includes("피로") || symptom.name.includes("무기력")) {
        recommendations.push("😴 충분한 수면과 적당한 운동이 도움이 됩니다");
      }
      if (symptom.name.includes("관절") || symptom.name.includes("근육")) {
        recommendations.push("🧊 냉찜질이나 온찜질을 시도해보세요");
      }
      if (symptom.name.includes("피부") || symptom.name.includes("가려움")) {
        recommendations.push(
          "🧴 자극적인 화장품 사용을 피하고 보습을 충분히 하세요"
        );
      }
      if (symptom.name.includes("스트레스") || symptom.name.includes("불안")) {
        recommendations.push(
          "🧘‍♀️ 명상이나 깊은 호흡으로 마음의 안정을 찾아보세요"
        );
      }
    });

    return Array.from(new Set(recommendations)); // 중복 제거
  };

  const generatePossibleConditions = (symptoms: SelectedSymptom[]) => {
    const conditions = [];

    // 확장된 패턴 매칭
    const symptomNames = symptoms.map((s) => s.name).join(" ");

    if (symptomNames.includes("발열") && symptomNames.includes("기침")) {
      conditions.push({
        name: "감기나 독감 가능성",
        probability: "high",
        description: "바이러스 감염으로 보입니다",
      });
    }
    if (symptomNames.includes("두통") && symptomNames.includes("피로")) {
      conditions.push({
        name: "스트레스나 수면 부족",
        probability: "medium",
        description: "생활습관 개선이 도움될 수 있어요",
      });
    }
    if (symptomNames.includes("가슴") && symptomNames.includes("통증")) {
      conditions.push({
        name: "심장 관련 검사 필요",
        probability: "medium",
        description: "정확한 진단을 위해 병원 방문을 권합니다",
      });
    }
    if (symptomNames.includes("복통") && symptomNames.includes("메스꺼움")) {
      conditions.push({
        name: "소화기 문제",
        probability: "medium",
        description: "식단 조절과 충분한 휴식이 필요해요",
      });
    }
    if (symptomNames.includes("관절통") && symptomNames.includes("근육통")) {
      conditions.push({
        name: "근골격계 문제",
        probability: "medium",
        description: "물리치료나 재활운동이 도움될 수 있어요",
      });
    }
    if (symptomNames.includes("피부") && symptomNames.includes("가려움")) {
      conditions.push({
        name: "알레르기나 피부 질환",
        probability: "medium",
        description: "알레르기 테스트를 고려해보세요",
      });
    }
    if (symptomNames.includes("불안") && symptomNames.includes("우울")) {
      conditions.push({
        name: "정신 건강 관리 필요",
        probability: "medium",
        description: "상담이나 전문가 도움을 받아보세요",
      });
    }

    // 기본값
    if (conditions.length === 0) {
      conditions.push({
        name: "일반적인 불편감",
        probability: "medium",
        description: "충분한 휴식과 수분 섭취를 권합니다",
      });
    }

    return conditions;
  };

  const generateNextSteps = (symptoms: SelectedSymptom[]) => {
    const steps = [];

    if (symptoms.some((s) => s.severity === "urgent")) {
      steps.push("🏥 즉시 응급실 방문");
      steps.push("📞 응급전화 (119) 고려");
    } else if (symptoms.some((s) => s.severity === "concerning")) {
      steps.push("🏥 2-3일 내 병원 방문");
      steps.push("📱 증상 기록 및 관찰");
    } else {
      steps.push("📝 며칠간 증상 변화 관찰");
      steps.push("💊 충분한 휴식과 수분 섭취");
      steps.push("🏥 증상 지속시 병원 방문");
    }

    return steps;
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setAnalysisResult(null);
    setActiveTab("select");
    setSelectedPart(null);
    setSearchQuery("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <PageHeader
        title="질병 예측"
        icon={Target}
        description="포괄적인 증상 체크로 가능한 질병을 예측하고 맞춤 조언을 받아보세요"
        gradient="cyan"
        badges={[
          {
            label: "SNOMED CT",
            icon: Zap,
            color: "bg-blue-500/20 text-primary-foreground border-blue-500/30",
          },
        ]}
      />

      <div
        className={`flex-1 overflow-auto ${
          isMobile
            ? "p-4" // 모바일: 하단 네비게이션(80px) + 고정 버튼(96px) + 여유공간
            : "p-6 pb-24" // 데스크톱: 기존 패딩
        }`}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList
            className={`grid w-full grid-cols-4 mb-6 ${
              isMobile ? "text-xs p-1 h-auto min-h-[60px]" : ""
            }`}
          >
            <TabsTrigger
              value="select"
              className={`flex items-center gap-2 ${
                isMobile ? "flex-col gap-0.5 p-1.5 h-auto min-h-[56px]" : ""
              }`}
            >
              <Target className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span className={isMobile ? "text-xs leading-tight" : ""}>
                증상 선택
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className={`flex items-center gap-2 ${
                isMobile ? "flex-col gap-0.5 p-1.5 h-auto min-h-[56px]" : ""
              }`}
            >
              <Search className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span className={isMobile ? "text-xs leading-tight" : ""}>
                빠른 검색
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className={`flex items-center gap-2 ${
                isMobile ? "flex-col gap-0.5 p-1.5 h-auto min-h-[56px]" : ""
              }`}
            >
              <CheckCircle className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span className={isMobile ? "text-xs leading-tight" : ""}>
                상세 정보
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={!analysisResult}
              className={`flex items-center gap-2 ${
                isMobile ? "flex-col gap-0.5 p-1.5 h-auto min-h-[56px]" : ""
              }`}
            >
              <TrendingUp className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span className={isMobile ? "text-xs leading-tight" : ""}>
                예측 결과
              </span>
            </TabsTrigger>
          </TabsList>

          {/* 증상 선택 탭 */}
          <TabsContent value="select" className="flex-1 overflow-auto">
            <div className="space-y-6">
              {selectedPart === null ? (
                // 신체 부위 선택
                <>
                  <div className="text-center mb-8">
                    <h2
                      className={`font-semibold mb-2 ${
                        isMobile ? "text-lg" : "text-xl"
                      }`}
                    >
                      어느 부위가 불편하신가요?
                    </h2>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-sm" : ""
                      }`}
                    >
                      SNOMED CT 기반 전문 분류로 정확한 진단을 도와드립니다
                    </p>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      isMobile
                        ? "grid-cols-1 gap-4"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {bodyParts.map((part) => {
                      return (
                        <Card
                          key={part.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 card-elevated border-glow group hover:scale-105"
                          onClick={() => setSelectedPart(part)}
                        >
                          <CardContent
                            className={`text-center ${
                              isMobile ? "p-4" : "p-6"
                            }`}
                          >
                            <div className="mb-4 flex justify-center">
                              <div
                                className={`gradient-primary rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg ${
                                  isMobile ? "w-16 h-16" : "w-20 h-20"
                                }`}
                              >
                                <span
                                  className={isMobile ? "text-2xl" : "text-3xl"}
                                >
                                  {part.emoji}
                                </span>
                              </div>
                            </div>
                            <h3
                              className={`font-semibold mb-2 ${
                                isMobile ? "text-lg" : "text-xl"
                              }`}
                            >
                              {part.name}
                            </h3>
                            <p
                              className={`text-muted-foreground mb-4 ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              {part.description}
                            </p>
                            <div className="flex flex-col gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {part.commonSymptoms.length}가지 증상
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700"
                              >
                                SNOMED: {part.snomedCode}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              ) : (
                // 구체적 증상 선택
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPart(null)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className={isMobile ? "text-xs" : ""}>
                        다른 부위 선택
                      </span>
                    </Button>
                    <div className="flex items-center gap-3">
                      <div
                        className={`gradient-primary rounded-2xl flex items-center justify-center ${
                          isMobile ? "w-10 h-10" : "w-12 h-12"
                        }`}
                      >
                        <span className={isMobile ? "text-lg" : "text-2xl"}>
                          {selectedPart.emoji}
                        </span>
                      </div>
                      <div>
                        <h2
                          className={`font-semibold ${
                            isMobile ? "text-lg" : "text-xl"
                          }`}
                        >
                          {selectedPart.name} 관련 증상
                        </h2>
                        <p
                          className={`text-muted-foreground ${
                            isMobile ? "text-xs" : "text-sm"
                          }`}
                        >
                          해당하는 증상을 모두 선택해주세요
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedPart.commonSymptoms.map((symptom) => {
                      const isSelected = selectedSymptoms.some(
                        (s) => s.id === symptom.id
                      );
                      const severityStyle = severityInfo[symptom.severity];
                      const commonnessStyle =
                        commonnessInfo[symptom.commonness];

                      return (
                        <Card
                          key={symptom.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            isSelected
                              ? "ring-2 ring-primary bg-primary/5 shadow-lg"
                              : ""
                          }`}
                          onClick={() => handleSymptomSelect(symptom)}
                        >
                          <CardContent className={isMobile ? "p-4" : "p-6"}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3
                                    className={`font-semibold ${
                                      isMobile ? "text-base" : "text-lg"
                                    }`}
                                  >
                                    {symptom.name}
                                  </h3>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  )}
                                  <span
                                    className={isMobile ? "text-lg" : "text-xl"}
                                  >
                                    {severityStyle.icon}
                                  </span>
                                </div>
                                <p
                                  className={`text-muted-foreground mb-4 ${
                                    isMobile ? "text-sm" : ""
                                  }`}
                                >
                                  {symptom.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  <Badge className={severityStyle.color}>
                                    {severityStyle.label}
                                  </Badge>
                                  <Badge className={commonnessStyle.color}>
                                    {commonnessStyle.label} (
                                    {commonnessStyle.percentage}% 경험)
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-50"
                                  >
                                    {symptom.snomedCode}
                                  </Badge>
                                </div>

                                <div className="bg-muted/30 p-3 rounded-lg">
                                  <p
                                    className={`text-muted-foreground mb-1 ${
                                      isMobile ? "text-xs" : "text-xs"
                                    }`}
                                  >
                                    💡 {severityStyle.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {symptom.relatedQuestions && (
                              <div className="border-t pt-4">
                                <p
                                  className={`font-medium mb-2 ${
                                    isMobile ? "text-sm" : "text-sm"
                                  }`}
                                >
                                  이런 증상도 있나요?
                                </p>
                                <div className="space-y-1">
                                  {symptom.relatedQuestions.map(
                                    (question, index) => (
                                      <p
                                        key={index}
                                        className={`text-muted-foreground ${
                                          isMobile ? "text-xs" : "text-sm"
                                        }`}
                                      >
                                        • {question}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* 웹 버전용 넘어가기 버튼 추가 */}
                  {!isMobile && selectedSymptoms.length > 0 && (
                    <div className="text-center mt-8 pt-8 border-t border-border">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Badge variant="secondary" className="px-3 py-1">
                          {selectedSymptoms.length}개 선택됨
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          증상 선택됨
                        </span>
                      </div>
                      <Button
                        onClick={handleProceedToDetails}
                        className="gradient-primary text-white px-8 py-3"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        상세 정보 입력하기
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 빠른 검색 탭 */}
          <TabsContent value="search" className="flex-1 overflow-auto">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2
                  className={`font-semibold mb-2 ${
                    isMobile ? "text-lg" : "text-xl"
                  }`}
                >
                  증상을 직접 검색해보세요
                </h2>
                <p
                  className={`text-muted-foreground ${
                    isMobile ? "text-sm" : ""
                  }`}
                >
                  예: 두통, 기침, 복통, 어지러움, 가슴답답함 등
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡{" "}
                  {bodyParts.reduce(
                    (total, part) => total + part.commonSymptoms.length,
                    0
                  )}
                  개 이상의 증상을 검색할 수 있습니다
                </p>
              </div>

              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="증상을 입력하세요 (예: 머리아픔, 숨가쁨)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 py-3 ${isMobile ? "text-base" : "text-lg"}`}
                />
              </div>

              {searchQuery && (
                <div className="space-y-4">
                  <p
                    className={`text-center text-muted-foreground ${
                      isMobile ? "text-sm" : ""
                    }`}
                  >
                    "{searchQuery}"에 대한 검색 결과 (
                    {searchSymptoms(searchQuery).length}개)
                  </p>

                  {searchSymptoms(searchQuery).length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        검색된 증상이 없습니다
                      </p>
                      <p
                        className={`text-muted-foreground mt-2 ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}
                      >
                        다른 키워드로 검색해보세요
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {searchSymptoms(searchQuery).map((symptom) => {
                        const isSelected = selectedSymptoms.some(
                          (s) => s.id === symptom.id
                        );
                        const severityStyle = severityInfo[symptom.severity];

                        return (
                          <Card
                            key={symptom.id}
                            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              isSelected
                                ? "ring-2 ring-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => handleSymptomSelect(symptom)}
                          >
                            <CardContent className={isMobile ? "p-3" : "p-4"}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3
                                      className={`font-semibold ${
                                        isMobile ? "text-sm" : ""
                                      }`}
                                    >
                                      {symptom.name}
                                    </h3>
                                    {isSelected && (
                                      <CheckCircle className="w-5 h-5 text-primary" />
                                    )}
                                    <span
                                      className={
                                        isMobile ? "text-base" : "text-lg"
                                      }
                                    >
                                      {severityStyle.icon}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-muted-foreground mb-2 ${
                                      isMobile ? "text-xs" : "text-sm"
                                    }`}
                                  >
                                    {symptom.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className={severityStyle.color}>
                                      {severityStyle.label}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {symptom.snomedCode}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* 웹 버전용 검색 탭에서도 넘어가기 버튼 추가 */}
                  {!isMobile && selectedSymptoms.length > 0 && (
                    <div className="text-center mt-8 pt-8 border-t border-border">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Badge variant="secondary" className="px-3 py-1">
                          {selectedSymptoms.length}개 선택됨
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          증상 선택됨
                        </span>
                      </div>
                      <Button
                        onClick={handleProceedToDetails}
                        className="gradient-primary text-white px-8 py-3"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        상세 정보 입력하기
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 상세 정보 탭 */}
          <TabsContent value="review" className="flex-1 overflow-auto">
            <div className="space-y-6">
              {selectedSymptoms.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    선택된 증상이 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    먼저 증상을 선택해주세요
                  </p>
                  <Button
                    onClick={() => setActiveTab("select")}
                    className="gradient-primary text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    증상 선택하기
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2
                      className={`font-semibold mb-2 ${
                        isMobile ? "text-lg" : "text-xl"
                      }`}
                    >
                      선택된 증상 상세 정보
                    </h2>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-sm" : ""
                      }`}
                    >
                      각 증상의 정도와 기간을 정확히 입력해주세요
                    </p>
                  </div>

                  <div className="space-y-6">
                    {selectedSymptoms.map((symptom) => {
                      const severityStyle = severityInfo[symptom.severity];

                      return (
                        <Card key={symptom.id} className="border-glow">
                          <CardHeader
                            className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}
                          >
                            <CardTitle
                              className={`flex items-center gap-3 ${
                                isMobile ? "text-base" : "text-lg"
                              }`}
                            >
                              <span className="text-2xl">
                                {severityStyle.icon}
                              </span>
                              <div className="flex-1">
                                <h3>{symptom.name}</h3>
                                <p
                                  className={`text-muted-foreground font-normal ${
                                    isMobile ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  {symptom.description}
                                </p>
                              </div>
                              <Badge className={severityStyle.color}>
                                {severityStyle.label}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent
                            className={isMobile ? "p-4 pt-0" : "p-6 pt-0"}
                          >
                            <div className="space-y-4">
                              {/* 심각도 슬라이더 */}
                              <div>
                                <Label
                                  className={`block mb-2 ${
                                    isMobile ? "text-sm" : ""
                                  }`}
                                >
                                  증상 정도:{" "}
                                  <span className="text-primary font-medium">
                                    {symptom.intensity}/10
                                  </span>
                                </Label>
                                <Slider
                                  value={[symptom.intensity]}
                                  onValueChange={([value]: number[]) =>
                                    updateSymptomDetails(
                                      symptom.id,
                                      "intensity",
                                      value
                                    )
                                  }
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>가벼움</span>
                                  <span>보통</span>
                                  <span>심함</span>
                                </div>
                              </div>

                              {/* 지속 기간 */}
                              <div>
                                <Label
                                  className={`block mb-2 ${
                                    isMobile ? "text-sm" : ""
                                  }`}
                                >
                                  지속 기간
                                </Label>
                                <div
                                  className={`grid gap-2 ${
                                    isMobile ? "grid-cols-2" : "grid-cols-4"
                                  }`}
                                >
                                  {[
                                    "몇 시간",
                                    "1-2일",
                                    "3-7일",
                                    "1주일 이상",
                                  ].map((duration) => (
                                    <Button
                                      key={duration}
                                      variant={
                                        symptom.duration === duration
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        updateSymptomDetails(
                                          symptom.id,
                                          "duration",
                                          duration
                                        )
                                      }
                                      className={`${
                                        isMobile ? "text-xs py-2" : ""
                                      }`}
                                    >
                                      {duration}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {/* 발생 빈도 */}
                              <div>
                                <Label
                                  className={`block mb-2 ${
                                    isMobile ? "text-sm" : ""
                                  }`}
                                >
                                  발생 빈도
                                </Label>
                                <div
                                  className={`grid gap-2 ${
                                    isMobile ? "grid-cols-2" : "grid-cols-3"
                                  }`}
                                >
                                  {["가끔", "자주", "계속"].map((frequency) => (
                                    <Button
                                      key={frequency}
                                      variant={
                                        symptom.frequency === frequency
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        updateSymptomDetails(
                                          symptom.id,
                                          "frequency",
                                          frequency
                                        )
                                      }
                                      className={`${
                                        isMobile ? "text-xs py-2" : ""
                                      }`}
                                    >
                                      {frequency}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {/* 관련 질문들 */}
                              {symptom.relatedQuestions && (
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <p
                                    className={`font-medium mb-3 ${
                                      isMobile ? "text-sm" : ""
                                    }`}
                                  >
                                    💡 관련 질문들
                                  </p>
                                  <div className="space-y-2">
                                    {symptom.relatedQuestions.map(
                                      (question, qIndex) => (
                                        <div
                                          key={qIndex}
                                          className="flex items-start gap-3"
                                        >
                                          <Checkbox
                                            id={`${symptom.id}-q${qIndex}`}
                                          />
                                          <Label
                                            htmlFor={`${symptom.id}-q${qIndex}`}
                                            className={`text-muted-foreground cursor-pointer ${
                                              isMobile ? "text-xs" : "text-sm"
                                            }`}
                                          >
                                            {question}
                                          </Label>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* 분석 버튼 */}
                  <div className="text-center">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="gradient-primary text-white px-8 py-3"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          AI 분석 중...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          AI 질병 예측 분석
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* 예측 결과 탭 */}
          <TabsContent value="results" className="flex-1 overflow-auto">
            {analysisResult && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2
                    className={`font-semibold mb-2 ${
                      isMobile ? "text-lg" : "text-xl"
                    }`}
                  >
                    AI 질병 예측 결과
                  </h2>
                  <p
                    className={`text-muted-foreground ${
                      isMobile ? "text-sm" : ""
                    }`}
                  >
                    SNOMED CT 기반 정확한 분석 결과입니다
                  </p>
                </div>

                {/* 위험도 및 신뢰도 */}
                <Card className="border-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          analysisResult.riskLevel === "urgent"
                            ? "bg-red-100 text-red-600"
                            : analysisResult.riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3>전체 위험도</h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          분석 신뢰도: {analysisResult.confidence}%
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Progress
                        value={
                          analysisResult.riskLevel === "urgent"
                            ? 90
                            : analysisResult.riskLevel === "medium"
                            ? 60
                            : 30
                        }
                        className="w-full h-3"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        낮음
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          analysisResult.riskLevel === "urgent"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : analysisResult.riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }
                      >
                        {analysisResult.riskLevel === "urgent"
                          ? "높음"
                          : analysisResult.riskLevel === "medium"
                          ? "보통"
                          : "낮음"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        높음
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 추천사항 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      맞춤 추천사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.recommendations.map(
                        (rec: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <p className={isMobile ? "text-sm" : ""}>{rec}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 가능한 질환 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      가능한 질환
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.possibleConditions.map(
                        (condition: PossibleCondition, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4
                                className={`font-medium ${
                                  isMobile ? "text-sm" : ""
                                }`}
                              >
                                {condition.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={
                                  condition.probability === "high"
                                    ? "bg-red-100 text-red-800"
                                    : condition.probability === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {condition.probability === "high"
                                  ? "높음"
                                  : condition.probability === "medium"
                                  ? "보통"
                                  : "낮음"}
                              </Badge>
                            </div>
                            <p
                              className={`text-muted-foreground ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              {condition.description}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 다음 단계 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                      권장 다음 단계
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.nextSteps.map(
                        (step: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className={isMobile ? "text-sm" : ""}>{step}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 기타 서비스 연결 */}
                <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30">
                  <CardContent className="p-6">
                    <h3
                      className={`font-semibold mb-4 ${
                        isMobile ? "text-base" : "text-lg"
                      }`}
                    >
                      🩺 추가 도움이 필요하신가요?
                    </h3>
                    <div
                      className={`grid gap-3 ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      }`}
                    >
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => onNavigate("chat")}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI 상담하기
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => onNavigate("guide")}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        사용 가이드
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 다시 시작 버튼 */}
                <div className="text-center">
                  <Button
                    onClick={resetChecker}
                    variant="outline"
                    className="px-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    다시 진단하기
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div className="h-20" />
      {/* 하단 고정 버튼 (모바일) */}
      {isMobile && selectedSymptoms.length > 0 && activeTab !== "results" && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedSymptoms.length}개 선택됨
              </Badge>
              <span className="text-sm text-muted-foreground">증상 선택됨</span>
            </div>
            {activeTab === "select" || activeTab === "search" ? (
              <Button
                onClick={handleProceedToDetails}
                disabled={selectedSymptoms.length === 0}
                className="gradient-primary text-white px-6"
              >
                <ChevronRight className="w-4 h-4 mr-1" />
                상세 입력
              </Button>
            ) : (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || selectedSymptoms.length === 0}
                className="gradient-primary text-white px-6"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-1" />
                )}
                AI 분석
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
