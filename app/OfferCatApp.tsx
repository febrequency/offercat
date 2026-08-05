"use client";

import { type ChangeEvent, type CSSProperties, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlarmClock,
  ArrowLeft,
  Award,
  Bell,
  Bot,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  Edit3,
  FileText,
  Flag,
  Globe2,
  Grid2X2,
  GraduationCap,
  GripVertical,
  Hourglass,
  Link2,
  MapPin,
  Menu,
  NotebookPen,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  Target,
  Trash2,
  Upload,
  UsersRound,
  Download,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

type JobStatus = "待投递" | "收藏中" | "已投递" | "面试中" | "不合适";

type Job = {
  id: string;
  company: string;
  title: string;
  industry: string;
  city: string;
  deadline: string;
  applyUrl: string;
  batch: "校招" | "实习";
  companyType: string;
  education: string;
  status: JobStatus;
  tags: string[];
  updatedAt: string;
  description: string;
  announcementUrl?: string;
  examRequired?: string;
  majorRequirement?: string;
  recruitTarget?: string;
  source?: string;
  startDate?: string;
};

type JobImportPreview = {
  duplicates: Job[];
  errors: string[];
  fileName: string;
  fieldMatches: Array<{ label: string; matchedHeader: string; required?: boolean; sample: string }>;
  importedAt: string;
  rows: number;
  skippedRows: number;
  uniqueJobs: Job[];
};

type SourceLink = {
  id: string;
  name: string;
  region: string;
  url: string;
  status: string;
  note: string;
};

type ApplicationRecord = {
  id: string;
  company: string;
  role: string;
  direction: string;
  companyType: string;
  industry: string;
  location: string;
  recruitType: string;
  channel: string;
  applyDate: string;
  status: string;
  progress: string;
  nextAction: string;
  needsFollowUp: string;
  offerStatus: string;
  offerDeadline: string;
  salary: string;
  baseCity: string;
  priority: string;
  interest: string;
  source: string;
  sourceJobId?: string;
  applyUrl: string;
  jd: string;
  resumeVersion: string;
  assessment: string;
  writtenTest: string;
  interview: string;
  interviewRound: string;
  interviewFormat: string;
  interviewResult: string;
  notes: string;
  nextDeadline: string;
};

type CalendarEventKind = "deadline" | "interview" | "written" | "follow" | "offer" | "todo";
type CalendarTodoKind = CalendarEventKind | "student_work" | "thesis" | "study" | "personal" | "meeting";
type ScheduleCategoryValue = "student_work" | "job_search" | "thesis" | "study" | "personal";
type CalendarEventType =
  | "deadline"
  | "written"
  | "interview"
  | "follow"
  | "offer"
  | "meeting"
  | "course"
  | "thesis"
  | "todo"
  | "other";
type CalendarSourceType = "manual" | "todo" | "application" | "system";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  category: ScheduleCategoryValue;
  eventType: CalendarEventType;
  source?: string;
  sourceType?: CalendarSourceType;
  sourceId?: string;
  linkedTodoId?: string;
  linkedApplicationId?: string;
  location?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CalendarEventDraft = Omit<
  CalendarEvent,
  "id" | "source" | "sourceType" | "sourceId" | "linkedTodoId" | "linkedApplicationId" | "createdAt" | "updatedAt"
>;
type CalendarPanelMode = "dayList" | "createEvent" | "eventDetail" | "editEvent";
type TodoPanelMode = "todoList" | "createTodo" | "editTodo";
type AppView = "求职大盘" | "求职信息源" | "Offer 跟进" | "Offer 日历" | "Offer To Do" | "笔面试准备";
type TrendRange = "autumn" | "4w" | "8w" | "12w" | "6m" | "year";
type IconComponent = LucideIcon;
type CalendarFilterValue = "all" | ScheduleCategoryValue | CalendarEventType | "custom";
type PendingCalendarAction =
  | { type: "close" }
  | { type: "selectDay"; dateKey: string }
  | { type: "today" }
  | { type: "create"; dateKey: string }
  | { type: "detail"; eventId: string };

type CalendarTodo = {
  id: string;
  title: string;
  due: string;
  kind: CalendarTodoKind;
  done: boolean;
  priority: "P0" | "P1" | "P2" | "P3";
  owner: string;
};

type PrepItemType = "written_test" | "interview" | "research" | "material" | "review" | "other";
type PrepItemStatus = "not_started" | "in_progress" | "completed";

type PreparationItem = {
  id: string;
  workspaceId: string;
  title: string;
  type: PrepItemType;
  status: PrepItemStatus;
  completed: boolean;
  dueAt: string;
  scheduledAt: string;
  syncToTodo: boolean;
  syncToCalendar: boolean;
  linkedTodoId?: string;
  linkedCalendarEventId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceTask = {
  id: string;
  workspaceId: string;
  preparationItemId?: string;
  title: string;
  scheduledAt: string;
  completed: boolean;
  sortOrder: number;
  syncToTodo: boolean;
  syncToCalendar: boolean;
  linkedTodoId?: string;
  linkedCalendarEventId?: string;
  createdAt: string;
  updatedAt: string;
};

type InterviewWorkspace = {
  id: string;
  applicationId: string;
  industry: string;
  roleCategory: string;
  noteContent: string;
  items: PreparationItem[];
  tasks: WorkspaceTask[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

type DashboardMetric = {
  id: string;
  label: string;
  value: number;
  helper: string;
  color: string;
  icon: IconComponent;
  filterStatus: string;
};

type TrendPoint = {
  label: string;
  value: number;
};

type PipelineRow = {
  status: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  icon: IconComponent;
};

type DashboardReminder = {
  id: string;
  title: string;
  date: string;
  dateLabel: string;
  time: string;
  distance: string;
  color: string;
  isOverdue: boolean;
  view: AppView;
};

type CompanyTypeStat = {
  key: string;
  label: string;
  count: number;
  total: number;
  percent: number;
  color: string;
  icon: IconComponent;
};

type SearchResult = {
  id: string;
  title: string;
  detail: string;
  type: string;
  view: AppView;
};

type DashboardData = {
  companyTypes: CompanyTypeStat[];
  metrics: DashboardMetric[];
  notifications: DashboardReminder[];
  pipeline: PipelineRow[];
  progress: number;
  reminders: DashboardReminder[];
  trendPoints: TrendPoint[];
};

const blankApplication: ApplicationRecord = {
  id: "",
  company: "",
  role: "",
  direction: "",
  companyType: "互联网",
  industry: "",
  location: "",
  recruitType: "2027届秋招",
  channel: "官网",
  applyDate: "",
  status: "准备投递",
  progress: "",
  nextAction: "",
  needsFollowUp: "是",
  offerStatus: "暂无",
  offerDeadline: "",
  salary: "",
  baseCity: "",
  priority: "P1",
  interest: "高",
  source: "",
  sourceJobId: "",
  applyUrl: "",
  jd: "",
  resumeVersion: "",
  assessment: "未开始",
  writtenTest: "未开始",
  interview: "未开始",
  interviewRound: "",
  interviewFormat: "待确认",
  interviewResult: "待确认",
  notes: "",
  nextDeadline: "",
};

const initialJobs: Job[] = [
  {
    id: "baidu-2027",
    company: "百度",
    title: "2027届校招官网巡检",
    industry: "互联网 / AI",
    city: "待确认",
    deadline: "待确认",
    applyUrl: "https://talent.baidu.com/jobs/campus",
    batch: "校招",
    companyType: "民营企业",
    education: "2027届优先确认",
    status: "待投递",
    tags: ["官网巡检", "2027届", "AI/算法", "校园招聘", "实习"],
    updatedAt: "2026-07-21",
    description: "官网页面已出现 2027、27届、校招、校园招聘、实习等信号。",
  },
  {
    id: "tencent-campus",
    company: "腾讯",
    title: "校招官网巡检",
    industry: "互联网 / 游戏 / 云",
    city: "待确认",
    deadline: "待确认",
    applyUrl: "https://join.qq.com/",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    status: "待投递",
    tags: ["官网巡检", "校招", "游戏", "云计算"],
    updatedAt: "2026-07-21",
    description: "腾讯校招官网可访问，已识别校招信号。",
  },
  {
    id: "bytedance-campus",
    company: "字节跳动",
    title: "校园招聘官网巡检",
    industry: "互联网 / AI",
    city: "北京、上海、深圳",
    deadline: "待确认",
    applyUrl: "https://jobs.bytedance.com/campus",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    status: "收藏中",
    tags: ["官网巡检", "校招", "AI/算法", "产品/项目"],
    updatedAt: "2026-07-21",
    description: "字节跳动校园招聘官网可访问，后续需要补充专属岗位 adapter。",
  },
  {
    id: "netease-campus",
    company: "网易",
    title: "校园招聘官网巡检",
    industry: "互联网 / 游戏 / 内容",
    city: "广州、杭州、上海",
    deadline: "待确认",
    applyUrl: "https://campus.163.com/",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    status: "待投递",
    tags: ["官网巡检", "校园招聘", "游戏", "内容平台"],
    updatedAt: "2026-07-21",
    description: "网易校园招聘官网可访问，已识别校园招聘信号。",
  },
  {
    id: "robosense-sample",
    company: "RoboSense",
    title: "智能驾驶 / 感知算法相关岗位",
    industry: "自动驾驶 / AI",
    city: "深圳、上海",
    deadline: "待确认",
    applyUrl: "",
    batch: "校招",
    companyType: "民营企业",
    education: "本科可报、硕士可报",
    status: "待投递",
    tags: ["AI/算法", "自动驾驶", "机器学习算法", "软件研发"],
    updatedAt: "2026-07-21",
    description: "来自校招信息表结构的展示样例，等待正式数据源补齐。",
  },
];

const sourceLinks: SourceLink[] = [
  {
    id: "intern-2027",
    name: "27届实习提前批秋招汇总",
    region: "互联网 / 综合",
    url: "https://docs.qq.com/smartsheet/DRHVEc05MbE5CYUZa",
    status: "先保留链接",
    note: "等导出逻辑稳定后，再把公司、岗位、城市、截止时间映射进岗位库。",
  },
  {
    id: "south-state-owned",
    name: "华南央国企校招信息分享表",
    region: "广东 / 广西 / 海南",
    url: "https://docs.qq.com/sheet/DRHBtRmpoRk5OSEZy",
    status: "先保留链接",
    note: "适合作为央国企来源，后续可按地区、公司性质和网申入口清洗。",
  },
  {
    id: "yangtze-state-owned",
    name: "江浙沪央国企校招信息分享表",
    region: "江苏 / 浙江 / 上海",
    url: "https://docs.qq.com/sheet/DRGtwaFNWWFJLU2V5",
    status: "先保留链接",
    note: "适合补齐长三角地区岗位，暂时以外链方式保留在信息源中心。",
  },
];

const navItems: Array<{
  id: AppView;
  label: string;
  hint: string;
  icon: IconComponent;
}> = [
  { id: "求职大盘", label: "求职大盘", hint: "全局进展", icon: Grid2X2 },
  { id: "求职信息源", label: "信息源", hint: "岗位与来源", icon: FileText },
  { id: "Offer 跟进", label: "Offer 跟进", hint: "投递记录", icon: ShieldCheck },
  { id: "Offer 日历", label: "Offer 日历", hint: "日程节点", icon: CalendarDays },
  { id: "Offer To Do", label: "Offer To Do", hint: "待办清单", icon: CheckSquare },
  { id: "笔面试准备", label: "笔面试准备", hint: "岗位工作区", icon: BookOpen },
];
const applicationStorageKey = "offercat-applications-v1";
const jobsStorageKey = "offercat-jobs-v1";
const offerCatDatabaseName = "offercat-local-data";
const offerCatStoreName = "records";
const calendarTodoStorageKey = "offercat-calendar-todos-v1";
const calendarEventStorageKey = "offercat-calendar-events-v1";
const dismissedCalendarEventStorageKey = "offercat-dismissed-calendar-event-ids-v1";
const interviewWorkspaceStorageKey = "offercat-interview-workspaces-v1";
const dashboardTodayKey = "2026-07-27";
const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
const trendRanges: Array<{ value: TrendRange; label: string; weeks?: number }> = [
  { value: "autumn", label: "秋招周期" },
  { value: "4w", label: "近 4 周", weeks: 4 },
  { value: "8w", label: "近 8 周", weeks: 8 },
  { value: "12w", label: "近 12 周", weeks: 12 },
  { value: "6m", label: "近 6 个月", weeks: 26 },
  { value: "year", label: "本年度", weeks: 52 },
];

const companyTypeGroups = [
  { key: "互联网", label: "互联网", color: "blue", icon: Globe2, match: ["互联网", "民营企业"] },
  { key: "外企", label: "外企", color: "teal", icon: BriefcaseBusiness, match: ["外企"] },
  { key: "央国企", label: "央国企", color: "orange", icon: Building2, match: ["央国企", "国企"] },
  { key: "AI / 机器人", label: "AI/机器人", color: "purple", icon: Bot, match: ["AI", "机器人", "自动驾驶", "智能"] },
  { key: "品牌方", label: "品牌方", color: "violet", icon: Tags, match: ["品牌", "消费", "内容"] },
];

const statusVisuals = [
  { key: "收藏中", label: "已收藏", color: "blue", icon: Star },
  { key: "已投递", label: "已投递", color: "cyan", icon: Send },
  { key: "笔试中", label: "笔试中", color: "violet", icon: NotebookPen },
  { key: "面试中", label: "面试中", color: "orange", icon: UsersRound },
  { key: "Offer", label: "Offer", color: "green", icon: Award },
  { key: "已结束", label: "已结束", color: "slate", icon: BriefcaseBusiness },
];

const dailyTips = [
  "今天优先确认临近截止的网申和测评。",
  "面试前把 JD、项目经历和复盘材料放在同一处。",
  "每次投递后记录渠道和简历版本，后面复盘会轻松很多。",
  "对高意向岗位设置下一步提醒，避免信息散在聊天记录里。",
];

const scheduleCategories: Array<{
  value: ScheduleCategoryValue;
  label: string;
  color: "green" | "yellow" | "blue" | "purple" | "gray";
  description: string;
}> = [
  { value: "student_work", label: "学工事项", color: "green", description: "学生工作、学院事务、会议沟通" },
  { value: "job_search", label: "求职事项", color: "yellow", description: "投递、笔试、面试、offer 决策" },
  { value: "thesis", label: "论文事项", color: "blue", description: "论文节点、数据、导师沟通" },
  { value: "study", label: "课程学习", color: "purple", description: "课程、考试、学习计划" },
  { value: "personal", label: "个人事项", color: "gray", description: "个人安排和其他提醒" },
];

const eventTypeOptions: Array<{ value: CalendarEventType; label: string }> = [
  { value: "deadline", label: "投递截止" },
  { value: "written", label: "笔试/测评" },
  { value: "interview", label: "面试" },
  { value: "follow", label: "跟进" },
  { value: "offer", label: "Offer" },
  { value: "meeting", label: "会议" },
  { value: "course", label: "课程" },
  { value: "thesis", label: "论文节点" },
  { value: "todo", label: "Todo" },
  { value: "other", label: "其他" },
];

const todoKindOptions: Array<{ value: CalendarTodoKind; label: string }> = [
  { value: "todo", label: "通用 Todo" },
  { value: "follow", label: "求职跟进" },
  { value: "deadline", label: "投递截止" },
  { value: "written", label: "笔试/测评" },
  { value: "interview", label: "面试安排" },
  { value: "offer", label: "Offer 决策" },
  { value: "thesis", label: "论文事项" },
  { value: "student_work", label: "学校/学工事务" },
  { value: "study", label: "课程学习" },
  { value: "meeting", label: "会议/沟通" },
  { value: "personal", label: "个人事项" },
];

const defaultCalendarTodos: CalendarTodo[] = [
  {
    id: "todo-resume-baidu",
    title: "更新百度 AI 岗简历版本",
    due: "2026-07-27",
    kind: "todo",
    done: false,
    priority: "P1",
    owner: "我",
  },
  {
    id: "todo-tencent-source",
    title: "复查腾讯文档新增岗位",
    due: "2026-07-29",
    kind: "follow",
    done: false,
    priority: "P0",
    owner: "我",
  },
  {
    id: "todo-netease-deadline",
    title: "确认网易校招截止时间",
    due: "2026-08-01",
    kind: "deadline",
    done: false,
    priority: "P1",
    owner: "我",
  },
];

const seedCalendarEvents: CalendarEvent[] = [
  {
    id: "seed-baidu-follow",
    title: "百度官网入口复查",
    date: "2026-07-27",
    startTime: "10:00",
    category: "job_search",
    eventType: "follow",
    source: "官网巡检",
    sourceType: "system",
  },
  {
    id: "seed-tencent-written",
    title: "腾讯笔试准备",
    date: "2026-07-29",
    startTime: "19:30",
    category: "job_search",
    eventType: "written",
    source: "我的任务",
    sourceType: "system",
  },
  {
    id: "seed-bytedance-interview",
    title: "字节一面复盘",
    date: "2026-07-31",
    startTime: "15:00",
    category: "job_search",
    eventType: "interview",
    source: "面试",
    sourceType: "system",
  },
  {
    id: "seed-offer-decision",
    title: "offer 决策提醒",
    date: "2026-08-01",
    startTime: "18:00",
    category: "job_search",
    eventType: "offer",
    source: "Offer",
    sourceType: "system",
  },
];

const blankCalendarEvent: CalendarEventDraft = {
  title: "",
  date: "2026-07-26",
  startTime: "13:00",
  endTime: "13:30",
  category: "job_search",
  eventType: "interview",
  location: "",
  description: "",
};

export default function OfferCatApp() {
  const [activeView, setActiveView] = useState<AppView>("求职大盘");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [query, setQuery] = useState("");
  const [globalQuery, setGlobalQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [trendRange, setTrendRange] = useState<TrendRange>("autumn");
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [city, setCity] = useState("全部");
  const [batch, setBatch] = useState("全部");
  const [tag, setTag] = useState("全部");
  const [companyKind, setCompanyKind] = useState("全部");
  const [industryFilter, setIndustryFilter] = useState("全部");
  const [cohortFilter, setCohortFilter] = useState("2027暑期/秋招");
  const [suitabilityFilter, setSuitabilityFilter] = useState("只看合适");
  const [jobSort, setJobSort] = useState("latestUpdate");
  const [applicationFilter, setApplicationFilter] = useState("全部");
  const [form, setForm] = useState<ApplicationRecord>(blankApplication);
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const [calendarTodos, setCalendarTodos] = useState<CalendarTodo[]>(defaultCalendarTodos);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [dismissedCalendarEventIds, setDismissedCalendarEventIds] = useState<string[]>([]);
  const [interviewWorkspaces, setInterviewWorkspaces] = useState<InterviewWorkspace[]>([]);
  const [activeInterviewApplicationId, setActiveInterviewApplicationId] = useState<string | null>(null);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (cancelled) return;

      setApplications(readJsonStorage(applicationStorageKey, []));
      setCalendarTodos(readJsonStorage(calendarTodoStorageKey, defaultCalendarTodos, (items) => items.map(normalizeTodo)));
      setCalendarEvents(readJsonStorage<CalendarEvent[]>(calendarEventStorageKey, [], (items) => items.map(normalizeCalendarEvent)));
      setDismissedCalendarEventIds(readJsonStorage<string[]>(dismissedCalendarEventStorageKey, []));
      setInterviewWorkspaces(readJsonStorage<InterviewWorkspace[]>(interviewWorkspaceStorageKey, [], (items) => items.map(normalizeInterviewWorkspace)));
      const storedJobs = await readLargeJsonStorage<Job[]>(jobsStorageKey, initialJobs, (items) =>
        items.map((job, index) => normalizeJob(job, index)),
      );
      if (cancelled) return;
      setJobs(storedJobs);
      setIsStorageReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    void writeLargeJsonStorage(jobsStorageKey, jobs);
  }, [isStorageReady, jobs]);

  useEffect(() => {
    if (!isStorageReady) return;
    safeWriteJsonStorage(applicationStorageKey, applications);
  }, [applications, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    safeWriteJsonStorage(calendarTodoStorageKey, calendarTodos);
  }, [calendarTodos, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    safeWriteJsonStorage(calendarEventStorageKey, calendarEvents);
  }, [calendarEvents, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    safeWriteJsonStorage(dismissedCalendarEventStorageKey, dismissedCalendarEventIds);
  }, [dismissedCalendarEventIds, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    safeWriteJsonStorage(interviewWorkspaceStorageKey, interviewWorkspaces);
  }, [interviewWorkspaces, isStorageReady]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsDashboardLoading(false), 220);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isCommandK) return;

      event.preventDefault();
      setIsSearchActive(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cityOptions = useMemo(
    () => ["全部", ...Array.from(new Set(jobs.flatMap((job) => job.city.split(/[、,，/]/)).map((item) => item.trim()).filter(Boolean)))],
    [jobs],
  );

  const tagOptions = useMemo(
    () => ["全部", ...Array.from(new Set(jobs.flatMap((job) => job.tags)))],
    [jobs],
  );

  const companyKindOptions = useMemo(
    () => ["全部", ...Array.from(new Set([...jobs.map((job) => job.companyType), ...applications.map((record) => record.companyType)].filter(Boolean)))],
    [applications, jobs],
  );

  const industryOptions = useMemo(
    () => ["全部", ...Array.from(new Set(jobs.map((job) => job.industry).filter(Boolean)))],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const visibleJobs = jobs.filter((job) => {
      const haystack = [job.company, job.title, job.industry, job.city, job.description, job.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      const suitabilityMatched =
        suitabilityFilter === "全部含不合适" ||
        (suitabilityFilter === "只看不合适" ? job.status === "不合适" : job.status !== "不合适");

      return (
        (!query || haystack.includes(query.toLowerCase())) &&
        (city === "全部" || job.city.includes(city)) &&
        (batch === "全部" || job.batch === batch) &&
        (tag === "全部" || job.tags.includes(tag)) &&
        (companyKind === "全部" || job.companyType === companyKind) &&
        (industryFilter === "全部" || job.industry === industryFilter) &&
        (cohortFilter === "全部届次" || isTarget2027AutumnRecruitment(job)) &&
        suitabilityMatched
      );
    });

    return sortJobs(visibleJobs, jobSort);
  }, [batch, city, cohortFilter, companyKind, industryFilter, jobSort, jobs, query, suitabilityFilter, tag]);

  const visibleCalendarEvents = useMemo(
    () =>
      buildVisibleCalendarEvents({
        applications,
        customEvents: calendarEvents,
        dismissedEventIds: dismissedCalendarEventIds,
        todos: calendarTodos,
      }),
    [applications, calendarEvents, calendarTodos, dismissedCalendarEventIds],
  );
  const dashboardData = useMemo(
    () => buildDashboardData({ applications, events: visibleCalendarEvents, jobs, todos: calendarTodos, trendRange }),
    [applications, calendarTodos, jobs, trendRange, visibleCalendarEvents],
  );
  const searchResults = useMemo(
    () => buildSearchResults({
      applications,
      events: visibleCalendarEvents,
      jobs,
      query: globalQuery,
      todos: calendarTodos,
    }),
    [applications, calendarTodos, globalQuery, jobs, visibleCalendarEvents],
  );

  function updateJobStatus(jobId: string, status: JobStatus) {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status } : job)));
  }

  function keepJobs(jobIds: string[]) {
    const selected = new Set(jobIds);
    setJobs((current) => current.map((job) => (selected.has(job.id) ? { ...job, status: "收藏中" } : job)));
  }

  function markJobsUnsuitable(jobIds: string[]) {
    const selected = new Set(jobIds);
    setJobs((current) => current.map((job) => (selected.has(job.id) ? { ...job, status: "不合适" } : job)));
  }

  function editJob(jobId: string) {
    const target = jobs.find((job) => job.id === jobId);
    if (!target) return;

    const nextTitle = window.prompt("编辑岗位名称", target.title);
    if (nextTitle === null) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) return;

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              title: trimmedTitle,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : job,
      ),
    );
  }

  function removeJobs(jobIds: string[]) {
    const selected = new Set(jobIds);
    setJobs((current) => current.filter((job) => !selected.has(job.id)));
  }

  function importJobsFromPreview(preview: JobImportPreview) {
    if (preview.uniqueJobs.length === 0) return;
    setJobs((current) => {
      const existingKeys = new Set(current.map(getJobDuplicateKey));
      const safeJobs = preview.uniqueJobs.filter((job) => !existingKeys.has(getJobDuplicateKey(job)));
      return [...safeJobs, ...current];
    });
  }

  function dedupeExistingJobs() {
    setJobs((current) => {
      const seen = new Set<string>();
      return current.filter((job) => {
        const key = getJobDuplicateKey(job);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  }

  function updateForm<K extends keyof ApplicationRecord>(key: K, value: ApplicationRecord[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setFormMessage("先填公司和岗位名称，offercat 才能帮你建档。");
      return;
    }

    const nextRecord: ApplicationRecord = {
      ...form,
      id: editingApplicationId || window.crypto?.randomUUID?.() || `${Date.now()}`,
      company: form.company.trim(),
      role: form.role.trim(),
    };

    setApplications((current) =>
      editingApplicationId
        ? current.map((item) => (item.id === editingApplicationId ? nextRecord : item))
        : [nextRecord, ...current],
    );
    if (nextRecord.sourceJobId) {
      updateJobStatus(nextRecord.sourceJobId, "已投递");
    }
    setForm(blankApplication);
    setEditingApplicationId(null);
    setFormMessage(editingApplicationId ? "已更新这条求职记录。" : "已加入我的秋招记录。");
  }

  function resetApplicationForm() {
    setForm(blankApplication);
    setEditingApplicationId(null);
    setFormMessage("");
  }

  function editApplication(record: ApplicationRecord) {
    setForm(record);
    setEditingApplicationId(record.id);
    setFormMessage("正在编辑已有记录。");
  }

  function startApplicationFromJob(jobId: string) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    setForm(applicationDraftFromJob(job));
    setEditingApplicationId(null);
    setApplicationFilter("全部");
    setFormMessage(`已从信息源带入 ${job.company} 的基础信息，补充投递日期、简历版本和流程信息后保存。`);
    navigateToView("Offer 跟进");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function removeApplication(id: string) {
    setApplications((current) => current.filter((item) => item.id !== id));
    setCalendarEvents((current) =>
      current.filter((event) => event.linkedApplicationId !== id && !(event.sourceType === "application" && event.sourceId === id)),
    );
  }

  function addCalendarEvent(event: CalendarEventDraft) {
    const timestamp = new Date().toISOString();
    setCalendarEvents((current) => [
      {
        ...event,
        id: window.crypto?.randomUUID?.() || `${Date.now()}`,
        source: "手动新建",
        sourceType: "manual",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...current,
    ]);
  }

  function upsertCalendarEvent(event: CalendarEvent) {
    setCalendarEvents((current) =>
      current.some((item) => item.id === event.id)
        ? current.map((item) => (item.id === event.id ? { ...item, ...event, updatedAt: new Date().toISOString() } : item))
        : [{ ...event, updatedAt: new Date().toISOString() }, ...current],
    );
  }

  function removeCalendarEvent(id: string) {
    setCalendarEvents((current) => current.filter((event) => event.id !== id));
  }

  function dismissCalendarEvent(id: string) {
    setDismissedCalendarEventIds((current) => Array.from(new Set([id, ...current])));
    removeCalendarEvent(id);
  }

  function deleteCalendarEventLinkedSource(event: CalendarEvent) {
    if (event.sourceType === "todo" && event.linkedTodoId) {
      removeCalendarTodo(event.linkedTodoId);
      removeCalendarEvent(event.id);
      return;
    }

    if (event.sourceType === "application" && event.linkedApplicationId) {
      removeApplication(event.linkedApplicationId);
      removeCalendarEvent(event.id);
      return;
    }

    if (event.sourceType === "manual") {
      removeCalendarEvent(event.id);
      return;
    }

    dismissCalendarEvent(event.id);
  }

  function updateCalendarTodo(id: string, todo: Omit<CalendarTodo, "id" | "done">) {
    setCalendarTodos((current) => current.map((item) => (item.id === id ? { ...item, ...todo } : item)));
  }

  function addCalendarTodo(todo: Omit<CalendarTodo, "id" | "done">) {
    setCalendarTodos((current) => [
      {
        ...todo,
        id: window.crypto?.randomUUID?.() || `${Date.now()}`,
        done: false,
      },
      ...current,
    ]);
  }

  function toggleCalendarTodo(id: string) {
    setCalendarTodos((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function removeCalendarTodo(id: string) {
    setCalendarTodos((current) => current.filter((item) => item.id !== id));
    setCalendarEvents((current) =>
      current.filter((event) => event.linkedTodoId !== id && !(event.sourceType === "todo" && event.sourceId === id)),
    );
  }

  function openInterviewWorkspace(applicationId: string) {
    const application = applications.find((record) => record.id === applicationId);
    if (!application) return;

    setInterviewWorkspaces((current) => {
      if (current.some((workspace) => workspace.applicationId === applicationId)) return current;
      return [createInterviewWorkspace(application, visibleCalendarEvents), ...current];
    });
    setActiveInterviewApplicationId(applicationId);
  }

  function createWorkspaceFromApplication(applicationId: string) {
    openInterviewWorkspace(applicationId);
  }

  function returnToInterviewList() {
    setActiveInterviewApplicationId(null);
  }

  function updateInterviewWorkspace(workspaceId: string, updater: (workspace: InterviewWorkspace) => InterviewWorkspace) {
    setInterviewWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId
          ? normalizeInterviewWorkspace({ ...updater(workspace), updatedAt: new Date().toISOString() })
          : workspace,
      ),
    );
  }

  function addPrepItem(
    workspaceId: string,
    title: string,
    details: Partial<Pick<PreparationItem, "dueAt" | "scheduledAt" | "status">> = {},
  ) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    updateInterviewWorkspace(workspaceId, (workspace) => {
      const timestamp = new Date().toISOString();
      const nextOrder = Math.max(-1, ...workspace.items.map((item) => item.sortOrder)) + 1;
      return {
        ...workspace,
        items: [
          ...workspace.items,
          {
            id: window.crypto?.randomUUID?.() || `${Date.now()}`,
            workspaceId,
            title: trimmedTitle,
            type: inferPrepItemType(trimmedTitle),
            status: details.status || "not_started",
            completed: details.status === "completed",
            dueAt: details.dueAt || "",
            scheduledAt: details.scheduledAt || "",
            syncToTodo: false,
            syncToCalendar: false,
            sortOrder: nextOrder,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      };
    });
  }

  function updatePrepItem(workspaceId: string, itemId: string, patch: Partial<PreparationItem>) {
    updateInterviewWorkspace(workspaceId, (workspace) => ({
      ...workspace,
      items: workspace.items.map((item) =>
        item.id === itemId
          ? normalizePreparationItem({ ...item, ...patch, updatedAt: new Date().toISOString() }, workspaceId, item.sortOrder)
          : item,
      ),
    }));
  }

  function removePrepItem(workspaceId: string, itemId: string) {
    const workspace = interviewWorkspaces.find((entry) => entry.id === workspaceId);
    const item = workspace?.items.find((entry) => entry.id === itemId);
    if (item?.linkedTodoId) {
      removeCalendarTodo(item.linkedTodoId);
    }
    if (item?.linkedCalendarEventId) {
      removeCalendarEvent(item.linkedCalendarEventId);
    }

    updateInterviewWorkspace(workspaceId, (workspace) => ({
      ...workspace,
      items: workspace.items.filter((item) => item.id !== itemId).map((item, index) => ({ ...item, sortOrder: index })),
      tasks: workspace.tasks.filter((task) => task.preparationItemId !== itemId).map((task, index) => ({ ...task, sortOrder: index })),
    }));
  }

  function reorderPrepItem(workspaceId: string, sourceId: string, targetId: string) {
    updateInterviewWorkspace(workspaceId, (workspace) => ({
      ...workspace,
      items: reorderByIds(workspace.items, sourceId, targetId).map((item, index) => ({ ...item, sortOrder: index })),
    }));
  }

  function addPrepItemToToday(workspaceId: string, itemId: string) {
    updatePrepItem(workspaceId, itemId, {
      dueAt: dashboardTodayKey,
      scheduledAt: `${dashboardTodayKey}T18:00`,
      status: "in_progress",
    });
  }

  function syncPrepItemToTodo(workspaceId: string, itemId: string) {
    const workspace = interviewWorkspaces.find((entry) => entry.id === workspaceId);
    const item = workspace?.items.find((entry) => entry.id === itemId);
    if (!workspace || !item) return;

    if (item.syncToTodo && item.linkedTodoId) {
      removeCalendarTodo(item.linkedTodoId);
      updatePrepItem(workspaceId, itemId, { syncToTodo: false, linkedTodoId: undefined });
      return;
    }

    const todoId = window.crypto?.randomUUID?.() || `${Date.now()}`;
    const taskDate = item.scheduledAt.slice(0, 10) || item.dueAt || dashboardTodayKey;
    setCalendarTodos((current) => [
      {
        id: todoId,
        title: item.title,
        due: taskDate,
        kind: "todo",
        done: item.completed,
        priority: "P1",
        owner: "我",
      },
      ...current,
    ]);
    updatePrepItem(workspaceId, itemId, { linkedTodoId: todoId, syncToTodo: true });
  }

  function syncPrepItemToCalendar(workspaceId: string, itemId: string) {
    const workspace = interviewWorkspaces.find((entry) => entry.id === workspaceId);
    const application = applications.find((record) => record.id === workspace?.applicationId);
    const item = workspace?.items.find((entry) => entry.id === itemId);
    if (!workspace || !item) return;

    if (item.syncToCalendar && item.linkedCalendarEventId) {
      removeCalendarEvent(item.linkedCalendarEventId);
      updatePrepItem(workspaceId, itemId, { syncToCalendar: false, linkedCalendarEventId: undefined });
      return;
    }

    const eventId = window.crypto?.randomUUID?.() || `${Date.now()}`;
    const timestamp = new Date().toISOString();
    const eventDate = item.scheduledAt.slice(0, 10) || item.dueAt || dashboardTodayKey;
    const eventTime = item.scheduledAt.slice(11, 16) || "18:00";
    setCalendarEvents((current) => [
      {
        id: eventId,
        title: `${application?.company || "岗位"}准备：${item.title}`,
        date: eventDate,
        startTime: eventTime,
        category: "job_search",
        eventType: "todo",
        source: "笔面试准备",
        sourceType: "manual",
        location: "个人准备",
        description: application ? `${application.company} · ${application.role}` : "笔面试准备任务",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...current,
    ]);
    updatePrepItem(workspaceId, itemId, { linkedCalendarEventId: eventId, syncToCalendar: true });
  }

  function updateWorkspaceNote(workspaceId: string, noteContent: string) {
    updateInterviewWorkspace(workspaceId, (workspace) => ({ ...workspace, noteContent }));
  }

  function toggleWorkspacePin(workspaceId: string) {
    updateInterviewWorkspace(workspaceId, (workspace) => ({ ...workspace, pinned: !workspace.pinned }));
  }

  function regenerateWorkspace(workspaceId: string, mode: "append" | "replace") {
    const workspace = interviewWorkspaces.find((item) => item.id === workspaceId);
    const application = applications.find((record) => record.id === workspace?.applicationId);
    if (!workspace || !application) return;

    const generated = createInterviewWorkspace(application, visibleCalendarEvents);
    updateInterviewWorkspace(workspaceId, (current) => {
      if (mode === "replace") {
        return { ...generated, id: current.id, applicationId: current.applicationId, pinned: current.pinned };
      }

      const existingTitles = new Set(current.items.map((item) => item.title));
      const newItems = generated.items.filter((item) => !existingTitles.has(item.title));
      return {
        ...current,
        items: [
          ...current.items,
          ...newItems.map((item, index) => ({
            ...item,
            id: window.crypto?.randomUUID?.() || `${Date.now()}-${index}`,
            workspaceId: current.id,
            sortOrder: current.items.length + index,
          })),
        ],
      };
    });
  }

  function navigateToView(view: AppView) {
    setActiveView(view);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
  }

  function openApplicationStatus(status: string) {
    setApplicationFilter(status);
    navigateToView("Offer 跟进");
  }

  function openCompanyTypeFilter(companyType: string) {
    setCompanyKind(companyType === "互联网" ? "民营企业" : companyType);
    navigateToView("求职信息源");
  }

  function clearJobFilters() {
    setQuery("");
    setCity("全部");
    setBatch("全部");
    setTag("全部");
    setCompanyKind("全部");
    setIndustryFilter("全部");
    setCohortFilter("2027暑期/秋招");
    setSuitabilityFilter("只看合适");
    setJobSort("latestUpdate");
  }

  function handleSearchCommit(result = searchResults[0]) {
    if (!result) return;

    navigateToView(result.view);
    if (result.view === "求职信息源") setQuery(result.title);
    if (result.view === "Offer 跟进") setApplicationFilter("全部");
    setIsSearchActive(false);
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar
        activeView={activeView}
        navItems={navItems}
        onNavigate={navigateToView}
        tip={dailyTips[Number(dashboardTodayKey.slice(-2)) % dailyTips.length]}
      />

      <section className="dashboard-workspace">
        <DashboardHeader
          activeView={activeView}
          dashboardData={dashboardData}
          globalQuery={globalQuery}
          isNotificationOpen={isNotificationOpen}
          isSearchActive={isSearchActive}
          isUserMenuOpen={isUserMenuOpen}
          searchResults={searchResults}
          onNavigate={navigateToView}
          onSearchChange={(value) => {
            setGlobalQuery(value);
          }}
          onSearchCommit={handleSearchCommit}
          onSearchOpenChange={setIsSearchActive}
          onNotificationOpenChange={setIsNotificationOpen}
          onUserMenuOpenChange={setIsUserMenuOpen}
        />

        {activeView === "求职大盘" && (
          <DashboardOverview
            data={dashboardData}
            isLoading={isDashboardLoading}
            trendRange={trendRange}
            onCompanyTypeClick={openCompanyTypeFilter}
            onNavigate={navigateToView}
            onStatusClick={openApplicationStatus}
            onTrendRangeChange={setTrendRange}
          />
        )}

        {activeView === "求职信息源" && (
          <>
            <ViewHeading
              count={`${filteredJobs.length} 个岗位可见`}
              subtitle="集中管理官网巡检岗位、腾讯文档信息源和后续可同步入口。"
              title="求职信息源"
            />
            <section className="filters" aria-label="职位筛选">
              <label>
                搜索
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="公司、岗位、城市、技能"
                  value={query}
                />
              </label>
              <label>
                工作地点
                <select onChange={(event) => setCity(event.target.value)} value={city}>
                  {cityOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                批次
                <select onChange={(event) => setBatch(event.target.value)} value={batch}>
                  <option>全部</option>
                  <option>校招</option>
                  <option>实习</option>
                </select>
              </label>
              <label>
                岗位方向
                <select onChange={(event) => setTag(event.target.value)} value={tag}>
                  {tagOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                公司类型
                <select onChange={(event) => setCompanyKind(event.target.value)} value={companyKind}>
                  {companyKindOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                行业
                <select onChange={(event) => setIndustryFilter(event.target.value)} value={industryFilter}>
                  {industryOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                届次范围
                <select onChange={(event) => setCohortFilter(event.target.value)} value={cohortFilter}>
                  <option>2027暑期/秋招</option>
                  <option>全部届次</option>
                </select>
              </label>
              <label>
                合适度
                <select onChange={(event) => setSuitabilityFilter(event.target.value)} value={suitabilityFilter}>
                  <option>只看合适</option>
                  <option>只看不合适</option>
                  <option>全部含不合适</option>
                </select>
              </label>
              <label>
                排序
                <select onChange={(event) => setJobSort(event.target.value)} value={jobSort}>
                  <option value="latestUpdate">最新更新时间</option>
                  <option value="companyTypeThenUpdate">企业类型分组 + 更新时间</option>
                  <option value="deadlineAsc">截止时间从近到远</option>
                </select>
              </label>
              <button onClick={clearJobFilters} type="button">
                清空筛选
              </button>
            </section>
            <JobImportPanel
              existingJobs={jobs}
              onDedupeExisting={dedupeExistingJobs}
              onImport={importJobsFromPreview}
            />
            <JobsTable
              jobs={filteredJobs}
              onEditJob={editJob}
              onKeepJobs={keepJobs}
              onMarkJobsUnsuitable={markJobsUnsuitable}
              onRemoveJobs={removeJobs}
              onStartApplication={startApplicationFromJob}
              onStatusChange={updateJobStatus}
            />

            <section className="source-area source-area--embedded">
              <div className="source-intro">
                <span>Source center</span>
                <h3>外部信息源先稳定收口。</h3>
                <p>
                  当前保留入口和清洗说明；后续导出规则稳定后，再接成自动同步。
                </p>
              </div>
              <div className="source-grid">
                {sourceLinks.map((source) => (
                  <article className="source-card" key={source.id}>
                    <span>{source.region}</span>
                    <h3>{source.name}</h3>
                    <strong>{source.status}</strong>
                    <p>{source.note}</p>
                    <a href={source.url} rel="noreferrer" target="_blank">打开信息源</a>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "Offer 跟进" && (
          <OfferTrackingPage
            filter={applicationFilter}
            form={form}
            formMessage={formMessage}
            isEditing={Boolean(editingApplicationId)}
            records={applications}
            onChange={updateForm}
            onClearFilter={() => setApplicationFilter("全部")}
            onEdit={editApplication}
            onFilterChange={setApplicationFilter}
            onRemove={removeApplication}
            onResetForm={resetApplicationForm}
            onSubmit={submitApplication}
          />
        )}

        {activeView === "Offer 日历" && (
          <CalendarPlanner
            applications={applications}
            todos={calendarTodos}
            customEvents={calendarEvents}
            dismissedEventIds={dismissedCalendarEventIds}
            onAddEvent={addCalendarEvent}
            onDeleteLinkedSource={deleteCalendarEventLinkedSource}
            onDismissEvent={dismissCalendarEvent}
            onRemoveEvent={removeCalendarEvent}
            onUpdateEvent={upsertCalendarEvent}
          />
        )}

        {activeView === "Offer To Do" && (
          <OfferTodoPage
            todos={calendarTodos}
            onAddTodo={addCalendarTodo}
            onRemoveTodo={removeCalendarTodo}
            onToggleTodo={toggleCalendarTodo}
            onUpdateTodo={updateCalendarTodo}
          />
        )}

        {activeView === "笔面试准备" && (
          <InterviewPrepPage
            activeApplicationId={activeInterviewApplicationId}
            applications={applications}
            events={visibleCalendarEvents}
            todayKey={dashboardTodayKey}
            workspaces={interviewWorkspaces}
            onAddItem={addPrepItem}
            onAddItemToToday={addPrepItemToToday}
            onCreateWorkspace={createWorkspaceFromApplication}
            onOpenWorkspace={openInterviewWorkspace}
            onRegenerateWorkspace={regenerateWorkspace}
            onRemoveItem={removePrepItem}
            onReorderItem={reorderPrepItem}
            onReturnToList={returnToInterviewList}
            onSyncItemToCalendar={syncPrepItemToCalendar}
            onSyncItemToTodo={syncPrepItemToTodo}
            onTogglePin={toggleWorkspacePin}
            onUpdateItem={updatePrepItem}
            onUpdateNote={updateWorkspaceNote}
            onNavigate={navigateToView}
          />
        )}
      </section>
    </main>
  );
}

function DashboardSidebar({
  activeView,
  navItems,
  onNavigate,
  tip,
}: {
  activeView: AppView;
  navItems: Array<{ id: AppView; label: string; hint: string; icon: IconComponent }>;
  onNavigate: (view: AppView) => void;
  tip: string;
}) {
  const nav = (
    <nav aria-label="主导航" className="sidebar-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            aria-label={item.label}
            className={activeView === item.id ? "active" : ""}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true" className="sidebar-nav-icon"><Icon /></span>
            <span className="sidebar-nav-copy">
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      <Sheet>
        <SheetTrigger
          render={
            <Button aria-label="打开导航" className="mobile-sidebar-trigger" size="icon-lg" type="button" variant="outline" />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent className="dashboard-mobile-sheet" side="left">
          <SheetHeader>
            <SheetTitle>offercat</SheetTitle>
            <SheetDescription>秋招项目管理</SheetDescription>
          </SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>

      <aside className="dashboard-sidebar">
      <Button className="sidebar-brand" onClick={() => onNavigate("求职大盘")} type="button" variant="ghost">
        <img src="/assets/brand/offercat-logo.png" alt="" />
        <span>
          <strong>offercat</strong>
          秋招项目管理
        </span>
      </Button>

      {nav}

      <article className="sidebar-campaign">
        <span>本周行动</span>
        <h3>优先处理临近截止和待跟进岗位。</h3>
        <p>把信息源、投递记录和日历节点保持同步。</p>
        <Button onClick={() => onNavigate("Offer To Do")} size="sm" type="button" variant="secondary">查看待办</Button>
        <div aria-hidden="true" className="campaign-mark"><Sparkles /></div>
      </article>

      <article className="sidebar-tip">
        <span>小贴士</span>
        <p>{tip}</p>
      </article>
    </aside>
    </>
  );
}

function DashboardHeader({
  activeView,
  dashboardData,
  globalQuery,
  isNotificationOpen,
  isSearchActive,
  isUserMenuOpen,
  searchResults,
  onNavigate,
  onSearchChange,
  onSearchCommit,
  onSearchOpenChange,
  onNotificationOpenChange,
  onUserMenuOpenChange,
}: {
  activeView: AppView;
  dashboardData: DashboardData;
  globalQuery: string;
  isNotificationOpen: boolean;
  isSearchActive: boolean;
  isUserMenuOpen: boolean;
  searchResults: SearchResult[];
  onNavigate: (view: AppView) => void;
  onSearchChange: (value: string) => void;
  onSearchCommit: (result?: SearchResult) => void;
  onSearchOpenChange: (open: boolean) => void;
  onNotificationOpenChange: (open: boolean) => void;
  onUserMenuOpenChange: (open: boolean) => void;
}) {
  const current = navItems.find((item) => item.id === activeView);

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title">
        <h1>{activeView === "求职大盘" ? "求职总览" : activeView}</h1>
        <p>{activeView === "求职大盘" ? "掌握全局进展，规划下一步行动。" : current?.hint || "持续更新你的秋招工作台。"}</p>
      </div>

      <GlobalSearch
        isOpen={isSearchActive}
        query={globalQuery}
        results={searchResults}
        onChange={onSearchChange}
        onCommit={onSearchCommit}
        onOpenChange={onSearchOpenChange}
      />

      <div className="topbar-actions">
        <Popover open={isNotificationOpen} onOpenChange={onNotificationOpenChange}>
          <PopoverTrigger
            render={
              <Button aria-label="打开通知面板" className="notification-button" size="icon-lg" type="button" variant="ghost" />
            }
          >
            <Bell />
            {dashboardData.notifications.length > 0 && <strong>{Math.min(dashboardData.notifications.length, 9)}</strong>}
          </PopoverTrigger>
          <NotificationPanel
            notifications={dashboardData.notifications}
            onNavigate={onNavigate}
          />
        </Popover>

        <DropdownMenu open={isUserMenuOpen} onOpenChange={onUserMenuOpenChange}>
          <DropdownMenuTrigger render={<Button className="user-button" type="button" variant="ghost" />}>
            <Avatar className="user-avatar-mini">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <span className="user-meta">
              <strong>rockittycat</strong>
              <small>2027 届求职中</small>
            </span>
            <ChevronDown />
          </DropdownMenuTrigger>
          <UserMenu />
        </DropdownMenu>
      </div>
    </header>
  );
}

function GlobalSearch({
  isOpen,
  query,
  results,
  onChange,
  onCommit,
  onOpenChange,
}: {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  onChange: (value: string) => void;
  onCommit: (result?: SearchResult) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((groups, result) => {
    groups[result.type] = [...(groups[result.type] || []), result];
    return groups;
  }, {});

  return (
    <div className="global-search">
      <Button className="global-search-trigger" onClick={() => onOpenChange(true)} type="button" variant="outline">
        <Search data-icon="inline-start" />
        <span>搜索公司、岗位、日程、待办...</span>
        <kbd>⌘ K</kbd>
      </Button>
      <CommandDialog
        className="global-command-dialog"
        description="搜索 offercat 中的岗位、投递记录、日程和待办。"
        onOpenChange={onOpenChange}
        open={isOpen}
        showCloseButton
        title="全局搜索"
      >
        <Command shouldFilter={false}>
          <CommandInput onValueChange={onChange} placeholder="搜索公司、岗位、日程、待办..." value={query} />
          <CommandList>
            <CommandEmpty>没有找到匹配结果。</CommandEmpty>
            {Object.entries(groupedResults).map(([group, items]) => (
              <CommandGroup heading={group} key={group}>
                {items.map((result) => (
                  <CommandItem key={result.id} onSelect={() => onCommit(result)} value={`${result.type}-${result.title}-${result.detail}`}>
                    <span className="command-result">
                      <strong>{result.title}</strong>
                      <small>{result.detail}</small>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

function NotificationPanel({
  notifications,
  onNavigate,
}: {
  notifications: DashboardReminder[];
  onNavigate: (view: AppView) => void;
}) {
  return (
    <PopoverContent align="end" className="notification-panel" sideOffset={12}>
      <PopoverHeader>
        <PopoverTitle>近期通知</PopoverTitle>
        <PopoverDescription>临近节点、逾期事项和待跟进动作。</PopoverDescription>
      </PopoverHeader>
      <Button onClick={() => onNavigate("Offer 日历")} size="sm" type="button" variant="outline">查看全部</Button>
      {notifications.length === 0 ? (
        <p>暂无临近节点。</p>
      ) : (
        notifications.slice(0, 5).map((item) => (
          <Button className="notification-row" key={item.id} onClick={() => onNavigate(item.view)} type="button" variant="ghost">
            <span className={`reminder-dot reminder-dot--${item.color}`} />
            <strong>{item.title}</strong>
            <small>{item.dateLabel} / {item.distance}</small>
          </Button>
        ))
      )}
    </PopoverContent>
  );
}

function UserMenu() {
  return (
    <DropdownMenuContent align="end" className="user-menu" sideOffset={10}>
      <DropdownMenuLabel>账户</DropdownMenuLabel>
      <DropdownMenuGroup>
        {["个人资料", "数据设置", "账号设置"].map((item) => (
          <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <Separator />
      <DropdownMenuGroup>
        <DropdownMenuItem variant="destructive">退出登录</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}

function DashboardOverview({
  data,
  isLoading,
  trendRange,
  onCompanyTypeClick,
  onNavigate,
  onStatusClick,
  onTrendRangeChange,
}: {
  data: DashboardData;
  isLoading: boolean;
  trendRange: TrendRange;
  onCompanyTypeClick: (companyType: string) => void;
  onNavigate: (view: AppView) => void;
  onStatusClick: (status: string) => void;
  onTrendRangeChange: (range: TrendRange) => void;
}) {
  return (
    <section className="overview-grid">
      <div className="metric-grid">
        {data.metrics.map((metric) => (
          <MetricCard
            isLoading={isLoading}
            key={metric.id}
            metric={metric}
            onClick={() => onStatusClick(metric.filterStatus)}
          />
        ))}
      </div>

      <ApplicationTrendChart
        points={data.trendPoints}
        range={trendRange}
        onRangeChange={onTrendRangeChange}
      />
      <RecruitmentPipeline rows={data.pipeline} onStatusClick={onStatusClick} />
      <UpcomingReminderList reminders={data.reminders} onNavigate={onNavigate} />
      <CompanyTypeDistribution groups={data.companyTypes} onCompanyTypeClick={onCompanyTypeClick} onNavigate={onNavigate} />
      <MotivationCard progress={data.progress} />
    </section>
  );
}

function MetricCard({
  isLoading,
  metric,
  onClick,
}: {
  isLoading: boolean;
  metric: DashboardMetric;
  onClick: () => void;
}) {
  const Icon = metric.icon;
  const isNegative = metric.helper.includes("-");

  return (
    <Card className={`dashboard-card metric-card metric-card--${metric.color}`}>
      <Button className="metric-card-button" onClick={onClick} type="button" variant="ghost">
        <span aria-hidden="true" className="metric-icon"><Icon /></span>
        <span className="metric-copy">
          <small>{metric.label}</small>
          {isLoading ? <Skeleton className="skeleton-line skeleton-line--number" /> : <strong>{metric.value}</strong>}
          <Badge data-trend={isNegative ? "down" : "up"} variant="secondary">{metric.helper}</Badge>
        </span>
      </Button>
    </Card>
  );
}

function ApplicationTrendChart({
  points,
  range,
  onRangeChange,
}: {
  points: TrendPoint[];
  range: TrendRange;
  onRangeChange: (range: TrendRange) => void;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const chartMax = Math.max(maxValue, 50);
  const chartPoints = points.map((point, index) => {
    const x = points.length <= 1 ? 72 : 58 + (index * 438) / (points.length - 1);
    const y = 218 - (point.value / chartMax) * 152;
    return { ...point, x, y };
  });
  const path = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = chartPoints.length > 0 ? `${path} L ${chartPoints[chartPoints.length - 1].x} 226 L ${chartPoints[0].x} 226 Z` : "";
  const yTicks = [0, 10, 20, 30, 40, 50];
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const average = Math.round(total / Math.max(points.length, 1));
  const trendDescription = range === "autumn"
    ? `秋招周期 ${total} 次投递，平均每阶段 ${average} 次。`
    : `当前周期 ${total} 次投递，平均每周 ${average} 次。`;

  return (
    <Card className="dashboard-card trend-card">
      <CardHeader className="card-heading">
        <div>
          <CardTitle>近期投递趋势</CardTitle>
          <CardDescription>{trendDescription}</CardDescription>
        </div>
        <CardAction>
        <select aria-label="趋势时间范围" onChange={(event) => onRangeChange(event.currentTarget.value as TrendRange)} value={range}>
          {trendRanges.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        </CardAction>
      </CardHeader>
      <CardContent className="trend-chart">
        <p className="chart-legend"><span className="legend-dot" /> 投递数</p>
        <svg aria-label="近期投递趋势折线图" role="img" viewBox="0 0 540 270">
          <defs>
            <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5166ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#5166ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => {
            const y = 218 - (tick / chartMax) * 152;
            return (
              <g key={tick}>
                <text className="axis-label" x="26" y={y + 4}>{tick}</text>
                <line className="grid-line" x1="54" x2="510" y1={y} y2={y} />
              </g>
            );
          })}
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={path} fill="none" stroke="#5166ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {chartPoints.map((point) => (
            <g key={point.label}>
              <text className="point-label" x={point.x} y={point.y - 14}>{point.value}</text>
              <circle cx={point.x} cy={point.y} r="5.5" />
            </g>
          ))}
          {chartPoints.map((point) => (
            <text className="x-label" key={`x-${point.label}`} x={point.x} y="252">{point.label}</text>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}

function RecruitmentPipeline({
  rows,
  onStatusClick,
}: {
  rows: PipelineRow[];
  onStatusClick: (status: string) => void;
}) {
  return (
    <Card className="dashboard-card pipeline-card">
      <CardHeader className="card-heading">
        <div>
          <CardTitle>求职流程总览</CardTitle>
          <CardDescription>状态占比按当前投递记录计算。</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pipeline-list">
        {rows.map((row) => (
          <Button className={`pipeline-row pipeline-row--${row.color}`} key={row.status} onClick={() => onStatusClick(row.status)} type="button" variant="ghost">
            <span aria-hidden="true"><row.icon /></span>
            <strong>{row.label}</strong>
            <em>{row.count}</em>
            <Badge variant="secondary">{row.percent}%</Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function UpcomingReminderList({
  reminders,
  onNavigate,
}: {
  reminders: DashboardReminder[];
  onNavigate: (view: AppView) => void;
}) {
  return (
    <Card className="dashboard-card reminders-card">
      <CardHeader className="card-heading">
        <div>
          <CardTitle>近期提醒</CardTitle>
          <CardDescription>未来节点按时间排序。</CardDescription>
        </div>
        <CardAction>
          <Button onClick={() => onNavigate("Offer 日历")} size="sm" type="button" variant="ghost">查看全部</Button>
        </CardAction>
      </CardHeader>
      {reminders.length === 0 ? (
        <EmptyState title="暂无近期提醒" description="添加日程、Todo 或下一步截止时间后会显示在这里。" />
      ) : (
        <CardContent className="reminder-list">
          {reminders.slice(0, 5).map((reminder) => (
            <Button className={reminder.isOverdue ? "overdue" : ""} key={reminder.id} onClick={() => onNavigate(reminder.view)} type="button" variant="ghost">
              <span className={`reminder-dot reminder-dot--${reminder.color}`}><ReminderIcon color={reminder.color} /></span>
              <strong>{reminder.title}</strong>
              <small>{reminder.dateLabel} {reminder.time}</small>
              <em>{reminder.distance}</em>
            </Button>
          ))}
        </CardContent>
      )}
      <CardContent>
        <Button className="add-reminder-button" onClick={() => onNavigate("Offer 日历")} type="button" variant="outline">添加提醒</Button>
      </CardContent>
    </Card>
  );
}

function CompanyTypeDistribution({
  groups,
  onCompanyTypeClick,
  onNavigate,
}: {
  groups: CompanyTypeStat[];
  onCompanyTypeClick: (companyType: string) => void;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <Card className="dashboard-card company-type-card">
      <CardHeader className="card-heading">
        <div>
          <CardTitle>目标公司类型分布</CardTitle>
          <CardDescription>根据岗位库和投递记录实时归类。</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="company-type-grid">
        {groups.map((group) => (
          <Button className={`company-type company-type--${group.color}`} key={group.label} onClick={() => onCompanyTypeClick(group.key)} type="button" variant="ghost">
            <span aria-hidden="true"><group.icon /></span>
            <strong>{group.label}</strong>
            <em>{group.percent}%</em>
            <small>{group.count} / {group.total}</small>
          </Button>
        ))}
      </CardContent>
      <div className="company-card-footer">
        <span>继续投递优质岗位，扩大选择空间。</span>
        <Button onClick={() => onNavigate("求职信息源")} size="sm" type="button" variant="ghost">查看全部公司</Button>
      </div>
    </Card>
  );
}

function MotivationCard({
  progress,
}: {
  progress: number;
}) {
  return (
    <Card className="dashboard-card motivation-card">
      <div>
        <Badge variant="secondary">本周行动</Badge>
        <h2>求职进度</h2>
        <p>保持稳定节奏，优先推进高意向岗位。</p>
        <Progress aria-label="求职进度" className="motivation-progress" value={progress} />
        <dl className="weekly-stats">
          <div><dt>完成度</dt><dd>{progress}%</dd></div>
          <div><dt>下一步</dt><dd>检查提醒</dd></div>
        </dl>
      </div>
      <div aria-hidden="true" className="weekly-orbit">
        <Target />
        <CheckCircle2 />
        <ClipboardList />
      </div>
    </Card>
  );
}

function ReminderIcon({ color }: { color: string }) {
  if (color === "red") return <AlarmClock />;
  if (color === "green") return <Award />;
  if (color === "cyan") return <Link2 />;
  return <ClipboardList />;
}

function ViewHeading({
  count,
  subtitle,
  title,
}: {
  count: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="view-heading">
      <div>
        <span>Workspace</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <strong>{count}</strong>
    </div>
  );
}

function EmptyState({ description, title }: { description: string; title: string }) {
  return (
    <div className="dashboard-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function CalendarPlanner({
  applications,
  customEvents,
  dismissedEventIds,
  onAddEvent,
  onDeleteLinkedSource,
  onDismissEvent,
  onRemoveEvent,
  onUpdateEvent,
  todos,
}: {
  applications: ApplicationRecord[];
  customEvents: CalendarEvent[];
  dismissedEventIds: string[];
  onAddEvent: (event: CalendarEventDraft) => void;
  onDeleteLinkedSource: (event: CalendarEvent) => void;
  onDismissEvent: (id: string) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  todos: CalendarTodo[];
}) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));
  const [panelMode, setPanelMode] = useState<CalendarPanelMode>("dayList");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [eventDraft, setEventDraft] = useState<CalendarEventDraft>(() => ({
    ...blankCalendarEvent,
    date: toDateKey(today),
  }));
  const [eventDraftBase, setEventDraftBase] = useState<CalendarEventDraft>(() => ({
    ...blankCalendarEvent,
    date: toDateKey(today),
  }));
  const [pendingCalendarAction, setPendingCalendarAction] = useState<PendingCalendarAction | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [linkedEventToDelete, setLinkedEventToDelete] = useState<CalendarEvent | null>(null);
  const [calendarNotice, setCalendarNotice] = useState("");
  const [activeCalendarFilter, setActiveCalendarFilter] = useState<CalendarFilterValue>("all");

  const events = useMemo(
    () =>
      buildVisibleCalendarEvents({
        applications,
        customEvents,
        dismissedEventIds,
        todos,
      }),
    [applications, customEvents, dismissedEventIds, todos],
  );
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const filteredEvents = useMemo(
    () => events.filter((event) => calendarEventMatchesFilter(event, activeCalendarFilter)),
    [activeCalendarFilter, events],
  );
  const selectedEvents = sortCalendarEvents(filteredEvents.filter((event) => event.date === selectedDate));
  const activeEvent = activeEventId ? events.find((event) => event.id === activeEventId) : null;
  const monthLabel = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  const monthPrefix = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = events.filter((event) => event.date.startsWith(monthPrefix));
  const writtenCount = monthEvents.filter((event) => event.eventType === "written").length;
  const interviewCount = monthEvents.filter((event) => event.eventType === "interview").length;
  const deadlineCount = monthEvents.filter((event) => event.eventType === "deadline" || event.eventType === "offer").length;
  const doneTodoCount = todos.filter((todo) => todo.done).length;
  const completionRate = todos.length === 0 ? 0 : Math.round((doneTodoCount / todos.length) * 100);
  const todayKey = toDateKey(today);
  const todayEvents = sortCalendarEvents(filteredEvents.filter((event) => event.date === todayKey)).slice(0, 4);
  const upcomingEvents = sortCalendarEvents(filteredEvents.filter((event) => event.date >= todayKey)).slice(0, 5);
  const isEventFormDirty = (panelMode === "createEvent" || panelMode === "editEvent") && !calendarDraftsEqual(eventDraft, eventDraftBase);
  const calendarFilters: Array<{ value: CalendarFilterValue; label: string; icon: IconComponent }> = [
    { value: "all", label: "全部", icon: Grid2X2 },
    { value: "student_work", label: "学工事项", icon: GraduationCap },
    { value: "job_search", label: "找工作", icon: BriefcaseBusiness },
    { value: "written", label: "笔试", icon: NotebookPen },
    { value: "interview", label: "面试", icon: UsersRound },
    { value: "deadline", label: "截止日", icon: AlarmClock },
    { value: "custom", label: "自定义", icon: Plus },
  ];

  useEffect(() => {
    if (!calendarNotice) return;

    const timer = window.setTimeout(() => setCalendarNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [calendarNotice]);

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function openComposer(dateKey = selectedDate) {
    const nextAction: PendingCalendarAction = { type: "create", dateKey };
    if (guardDirtyCalendarAction(nextAction)) return;
    applyCalendarAction(nextAction);
  }

  function applyOpenComposer(dateKey = selectedDate) {
    const nextDraft = {
      ...blankCalendarEvent,
      date: dateKey,
    };
    setSelectedDate(dateKey);
    setActiveEventId(null);
    setFormError("");
    setEventDraft(nextDraft);
    setEventDraftBase(nextDraft);
    setPanelMode("createEvent");
  }

  function selectDay(dateKey: string) {
    const nextAction: PendingCalendarAction = { type: "selectDay", dateKey };
    if (guardDirtyCalendarAction(nextAction)) return;
    applyCalendarAction(nextAction);
  }

  function applySelectDay(dateKey: string) {
    setSelectedDate(dateKey);
    setActiveEventId(null);
    setPanelMode("dayList");
    setFormError("");
  }

  function goToday() {
    const nextAction: PendingCalendarAction = { type: "today" };
    if (guardDirtyCalendarAction(nextAction)) return;
    applyCalendarAction(nextAction);
  }

  function showEventDetail(event: CalendarEvent) {
    const nextAction: PendingCalendarAction = { type: "detail", eventId: event.id };
    if (guardDirtyCalendarAction(nextAction)) return;
    applyCalendarAction(nextAction);
  }

  function applyShowEventDetail(event: CalendarEvent) {
    setSelectedDate(event.date);
    setActiveEventId(event.id);
    setPanelMode("eventDetail");
    setFormError("");
  }

  function startEditEvent(event: CalendarEvent) {
    const nextDraft = calendarEventToDraft(event);
    setActiveEventId(event.id);
    setEventDraft(nextDraft);
    setEventDraftBase(nextDraft);
    setPanelMode("editEvent");
    setFormError("");
  }

  function closePanel() {
    const nextAction: PendingCalendarAction = { type: "close" };
    if (guardDirtyCalendarAction(nextAction)) return;
    applyCalendarAction(nextAction);
  }

  function applyClosePanel() {
    setPanelMode("dayList");
    setActiveEventId(null);
    setFormError("");
  }

  function guardDirtyCalendarAction(action: PendingCalendarAction) {
    if (!isEventFormDirty) return false;
    setPendingCalendarAction(action);
    return true;
  }

  function applyCalendarAction(action: PendingCalendarAction) {
    setPendingCalendarAction(null);
    if (action.type === "close") {
      applyClosePanel();
      return;
    }
    if (action.type === "selectDay") {
      applySelectDay(action.dateKey);
      return;
    }
    if (action.type === "today") {
      const todayKey = toDateKey(today);
      setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      applySelectDay(todayKey);
      return;
    }
    if (action.type === "create") {
      applyOpenComposer(action.dateKey);
      return;
    }
    const event = events.find((item) => item.id === action.eventId);
    if (event) applyShowEventDetail(event);
  }

  function confirmDiscardCalendarChanges() {
    if (pendingCalendarAction) applyCalendarAction(pendingCalendarAction);
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedDraft = calendarDraftFromForm(event.currentTarget, eventDraft);
    const validationError = validateEventDraft(submittedDraft);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const nextEvent = {
      ...submittedDraft,
      title: submittedDraft.title.trim(),
      location: submittedDraft.location?.trim() || "",
      description: submittedDraft.description?.trim() || "",
    };

    if (panelMode === "editEvent" && activeEvent) {
      onUpdateEvent({
        ...activeEvent,
        ...nextEvent,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddEvent(nextEvent);
    }

    setSelectedDate(submittedDraft.date);
    setEventDraft({
      ...blankCalendarEvent,
      date: submittedDraft.date,
    });
    setEventDraftBase({
      ...blankCalendarEvent,
      date: submittedDraft.date,
    });
    setPanelMode("dayList");
    setActiveEventId(null);
    setFormError("");
  }

  function confirmDeleteEvent(event: CalendarEvent) {
    setEventToDelete(event);
  }

  function deleteActiveEvent() {
    if (!eventToDelete) return;
    setSelectedDate(eventToDelete.date);
    if (eventToDelete.sourceType === "manual") {
      onRemoveEvent(eventToDelete.id);
    } else {
      onDismissEvent(eventToDelete.id);
    }
    setEventToDelete(null);
    setCalendarNotice(eventToDelete.sourceType === "manual" ? "日程已删除。" : "已从日历移除，原始内容仍保留。");
    applyClosePanel();
  }

  function cancelDeleteEvent() {
    setEventToDelete(null);
  }

  function handleCalendarDraftChange(nextDraft: CalendarEventDraft | ((current: CalendarEventDraft) => CalendarEventDraft)) {
    setEventDraft(nextDraft);
  }

  function handleDiscardStay() {
    setPendingCalendarAction(null);
  }

  function handleDayDoubleClick(dateKey: string) {
    openComposer(dateKey);
  }

  function handleEventDeleteFromDetail(event: CalendarEvent) {
    setSelectedDate(event.date);
    confirmDeleteEvent(event);
  }

  function removeEventFromCalendarOnly(event: CalendarEvent) {
    setSelectedDate(event.date);
    if (event.sourceType === "manual") {
      onRemoveEvent(event.id);
    } else {
      onDismissEvent(event.id);
    }
    setEventToDelete(null);
    setCalendarNotice("已从日历移除，原始内容仍保留。");
    applyClosePanel();
  }

  function requestDeleteLinkedSource(event: CalendarEvent) {
    setEventToDelete(null);
    setLinkedEventToDelete(event);
  }

  function cancelLinkedDelete() {
    setLinkedEventToDelete(null);
  }

  function confirmDeleteLinkedSource() {
    if (!linkedEventToDelete) return;
    setSelectedDate(linkedEventToDelete.date);
    onDeleteLinkedSource(linkedEventToDelete);
    setLinkedEventToDelete(null);
    setCalendarNotice("日程及关联内容已删除。");
    applyClosePanel();
  }

  return (
    <section className="calendar-planner offer-calendar-page">
      <div className="calendar-summary-grid">
        <CalendarSummaryCard color="indigo" icon={NotebookPen} label="本月笔试" trend="+2" value={writtenCount} />
        <CalendarSummaryCard color="purple" icon={UsersRound} label="本月面试" trend="+1" value={interviewCount} />
        <CalendarSummaryCard color="orange" icon={AlarmClock} label="本月截止" trend="-1" value={deadlineCount} />
        <CalendarSummaryCard color="green" icon={CheckCircle2} label="完成率" trend="+12%" value={`${completionRate}%`} />
      </div>

      <div className="calendar-filter-bar" aria-label="日历筛选">
        {calendarFilters.map((filterItem) => {
          const Icon = filterItem.icon;
          return (
            <button
              className={activeCalendarFilter === filterItem.value ? "calendar-filter-chip calendar-filter-chip--active" : "calendar-filter-chip"}
              key={filterItem.value}
              onClick={() => setActiveCalendarFilter(filterItem.value)}
              type="button"
            >
              <Icon aria-hidden="true" />
              {filterItem.label}
            </button>
          );
        })}
        <button className="calendar-add-button" onClick={() => openComposer(selectedDate)} type="button">
          <Plus aria-hidden="true" />
          添加日程
        </button>
      </div>

      <div className="calendar-workbench">
        <aside className="calendar-agenda-rail">
          <section className="agenda-card">
            <div className="agenda-card-title">
              <h3>今日安排 <span>{todayEvents.length}</span></h3>
              <small>{formatDateLabel(todayKey).replace("2026年", "")}</small>
            </div>
            <div className="agenda-list">
              {todayEvents.length === 0 ? (
                <button className="agenda-empty" onClick={() => openComposer(todayKey)} type="button">今天暂无安排，添加一项</button>
              ) : (
                todayEvents.map((event) => (
                  <button className={`agenda-item schedule-category--${event.category}`} key={event.id} onClick={() => showEventDetail(event)} type="button">
                    <span>{eventTypeIcon(event.eventType)}</span>
                    <strong>{event.title}</strong>
                    <small>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ""}</small>
                    <em>{eventTypeLabel(event.eventType)}</em>
                  </button>
                ))
              )}
            </div>
            <button className="agenda-link" onClick={() => selectDay(todayKey)} type="button">查看全天日程</button>
          </section>

          <section className="agenda-card">
            <div className="agenda-card-title">
              <h3>即将到来 <span>{upcomingEvents.length}</span></h3>
            </div>
            <div className="upcoming-list">
              {upcomingEvents.map((event) => (
                <button className={`upcoming-item schedule-category--${event.category}`} key={event.id} onClick={() => showEventDetail(event)} type="button">
                  <span>{eventTypeIcon(event.eventType)}</span>
                  <div>
                    <small>{formatDateLabel(event.date).replace("2026年", "")}</small>
                    <strong>{event.title}</strong>
                    <em>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ""}</em>
                  </div>
                </button>
              ))}
            </div>
            <button className="agenda-link" onClick={() => setActiveCalendarFilter("all")} type="button">查看全部日程</button>
          </section>
        </aside>

        <div className="calendar-main calendar-month-card">
          <div className="calendar-toolbar">
            <div className="calendar-controls">
              <button aria-label="上个月" onClick={() => shiftMonth(-1)} type="button">‹</button>
              <button aria-label="下个月" onClick={() => shiftMonth(1)} type="button">›</button>
            </div>
            <h3>{monthLabel}</h3>
            <button onClick={goToday} type="button">今天</button>
          </div>

          <div className="calendar-grid" aria-label="Offer 日历月视图">
            {weekdayLabels.map((day) => (
              <div className="calendar-weekday" key={day}>周{day}</div>
            ))}
            {calendarDays.map((day) => {
              const dayEvents = sortCalendarEvents(filteredEvents.filter((event) => event.date === day.key));
              return (
                <button
                  className={[
                    "calendar-day",
                    day.isCurrentMonth ? "" : "calendar-day--muted",
                    day.key === selectedDate ? "calendar-day--selected" : "",
                    day.key === todayKey ? "calendar-day--today" : "",
                  ].filter(Boolean).join(" ")}
                  key={day.key}
                  onClick={() => selectDay(day.key)}
                  onDoubleClick={() => handleDayDoubleClick(day.key)}
                  type="button"
                >
                  <span className="calendar-day-number">{day.date.getDate()}</span>
                  <div className="calendar-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span className={`calendar-event schedule-category--${event.category}`} key={event.id}>
                        <i>{event.startTime || "全天"}</i>
                        <b>{event.title}</b>
                      </span>
                    ))}
                    {dayEvents.length > 3 && <span className="calendar-more">+{dayEvents.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="calendar-detail-panel calendar-assist-panel">
          {panelMode === "createEvent" || panelMode === "editEvent" ? (
            <ScheduleEventForm
              draft={eventDraft}
              error={formError}
              mode={panelMode}
              onCancel={closePanel}
              onChange={handleCalendarDraftChange}
              onSubmit={submitEvent}
            />
          ) : panelMode === "eventDetail" && activeEvent ? (
            <ScheduleEventDetail
              event={activeEvent}
              onBack={closePanel}
              onDelete={() => handleEventDeleteFromDetail(activeEvent)}
              onEdit={() => startEditEvent(activeEvent)}
            />
          ) : (
            <>
              <SelectedDayEvents
                events={selectedEvents}
                selectedDate={selectedDate}
                onAdd={() => openComposer(selectedDate)}
                onSelect={showEventDetail}
              />
              <div className="calendar-tip-card">
                <div className="calendar-tip-figure" aria-hidden="true">
                  <CalendarDays />
                  <Bell />
                </div>
                <strong>保持日程更新，不错过每一个机会！</strong>
                <p><CheckCircle2 aria-hidden="true" />及时添加笔试、面试与截止日</p>
                <p><Bell aria-hidden="true" />设置提醒，避免错过时间</p>
                <p><MapPin aria-hidden="true" />合理安排时间，提升成功率</p>
                <button onClick={() => openComposer(selectedDate)} type="button">去添加日程</button>
              </div>
            </>
          )}
        </aside>
      </div>
      {calendarNotice && <p className="calendar-toast" role="status">{calendarNotice}</p>}

      {pendingCalendarAction && (
        <ConfirmDialog
          cancelLabel="继续编辑"
          confirmLabel="放弃修改"
          message="当前内容尚未保存，确定要放弃修改吗？"
          onCancel={handleDiscardStay}
          onConfirm={confirmDiscardCalendarChanges}
          title="未保存的日程"
        />
      )}

      {eventToDelete && (
        eventHasLinkedSource(eventToDelete) ? (
          <DeleteLinkedEventDialog
            event={eventToDelete}
            onCancel={cancelDeleteEvent}
            onDeleteLinked={() => requestDeleteLinkedSource(eventToDelete)}
            onRemoveOnly={() => removeEventFromCalendarOnly(eventToDelete)}
          />
        ) : (
          <ConfirmDialog
            cancelLabel="取消"
            confirmLabel="确认删除"
            danger
            message="确定删除该日程吗？删除后无法恢复。"
            onCancel={cancelDeleteEvent}
            onConfirm={deleteActiveEvent}
            title="删除日程"
          />
        )
      )}

      {linkedEventToDelete && (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="确认删除"
          danger
          message={`确定同时删除${sourceTypeLabel(linkedEventToDelete.sourceType)}中的关联内容吗？删除后无法恢复。`}
          onCancel={cancelLinkedDelete}
          onConfirm={confirmDeleteLinkedSource}
          title="删除关联内容"
        />
      )}
    </section>
  );
}

function CalendarSummaryCard({
  color,
  icon: Icon,
  label,
  trend,
  value,
}: {
  color: string;
  icon: IconComponent;
  label: string;
  trend: string;
  value: number | string;
}) {
  return (
    <article className={`calendar-summary-card calendar-summary-card--${color}`}>
      <span><Icon aria-hidden="true" /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>较上月 {trend}</em>
      </div>
    </article>
  );
}

function SelectedDayEvents({
  events,
  selectedDate,
  onAdd,
  onSelect,
}: {
  events: CalendarEvent[];
  selectedDate: string;
  onAdd: () => void;
  onSelect: (event: CalendarEvent) => void;
}) {
  return (
    <div className="selected-day-panel">
      <div className="panel-title-row">
        <div>
          <span>Selected Day</span>
          <h3>{formatDateLabel(selectedDate)}的日程</h3>
        </div>
        <button onClick={onAdd} type="button">添加日程</button>
      </div>
      <div className="selected-event-list">
        {events.length === 0 ? (
          <div className="calendar-empty-state">
            <strong>当天暂无日程</strong>
            <p>可以把笔试、面试、论文节点或学工会议放到这一天。</p>
            <button onClick={onAdd} type="button">添加日程</button>
          </div>
        ) : (
          events.map((event) => {
            const category = getScheduleCategory(event.category);
            return (
              <button
                className={`selected-event schedule-category--${event.category}`}
                key={event.id}
                onClick={() => onSelect(event)}
                type="button"
              >
                <span>{event.startTime || "全天"}</span>
                <strong>{event.title}</strong>
                <small>{category.label} · {eventTypeLabel(event.eventType)}</small>
                <em>{event.location || event.source || "未填写地点"}</em>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function ScheduleEventDetail({
  event,
  onBack,
  onDelete,
  onEdit,
}: {
  event: CalendarEvent;
  onBack: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const category = getScheduleCategory(event.category);

  return (
    <div className="schedule-detail-view">
      <div className="panel-title-row">
        <div>
          <span>日程详情</span>
          <h3>{event.title}</h3>
        </div>
        <button onClick={onBack} type="button">返回</button>
      </div>

      <dl className={`schedule-detail-card schedule-category--${event.category}`}>
        <div>
          <dt>日期时间</dt>
          <dd>{formatDateLabel(event.date)} {event.startTime || "全天"}{event.endTime ? ` - ${event.endTime}` : ""}</dd>
        </div>
        <div>
          <dt>所属领域</dt>
          <dd><span className={`category-chip schedule-category--${event.category}`}>{category.label}</span></dd>
        </div>
        <div>
          <dt>日程类型</dt>
          <dd>{eventTypeLabel(event.eventType)}</dd>
        </div>
        <div>
          <dt>地点/方式</dt>
          <dd>{event.location || "未填写"}</dd>
        </div>
        <div>
          <dt>备注</dt>
          <dd>{event.description || "暂无备注"}</dd>
        </div>
        {event.source && (
          <div>
            <dt>来源</dt>
            <dd>{event.source}</dd>
          </div>
        )}
      </dl>

      <div className="panel-actions">
        {onEdit && <button className="secondary-button" onClick={onEdit} type="button">编辑</button>}
        {onDelete && <button className="danger-button" onClick={onDelete} type="button">删除</button>}
      </div>
    </div>
  );
}

function ScheduleEventForm({
  draft,
  error,
  mode,
  onCancel,
  onChange,
  onSubmit,
}: {
  draft: CalendarEventDraft;
  error: string;
  mode: "createEvent" | "editEvent";
  onCancel: () => void;
  onChange: (draft: CalendarEventDraft | ((current: CalendarEventDraft) => CalendarEventDraft)) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="event-composer" onSubmit={onSubmit}>
      <div className="panel-title-row">
        <div>
          <span>{mode === "editEvent" ? "编辑日程" : "新增日程"}</span>
          <h3>{mode === "editEvent" ? "调整日程信息" : "创建新的日历节点"}</h3>
        </div>
        <button aria-label="关闭日程表单" className="icon-close-button" onClick={onCancel} title="关闭" type="button">×</button>
      </div>

      <label className="composer-field composer-field--wide">
        日程标题
        <input
          name="title"
          required
          placeholder="例如：腾讯笔试、论文中期汇报"
          value={draft.title}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange((current) => ({ ...current, title: value }));
          }}
        />
      </label>

      <fieldset className="category-picker">
        <legend>所属领域</legend>
        <div>
          {scheduleCategories.map((category) => (
            <label className={`category-option schedule-category--${category.value}`} key={category.value}>
              <input
                checked={draft.category === category.value}
                name="category"
                onChange={() => onChange((current) => ({ ...current, category: category.value }))}
                type="radio"
                value={category.value}
              />
              <span>{category.label}</span>
              <small>{category.description}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="composer-grid">
        <label className="composer-field">
          日程类型
          <select
            name="eventType"
            value={draft.eventType}
            onChange={(event) => {
              const value = event.currentTarget.value as CalendarEventType;
              onChange((current) => ({ ...current, eventType: value }));
            }}
          >
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="composer-field">
          日期
          <input
            name="date"
            required
            type="date"
            value={draft.date}
            onInput={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, date: value }));
            }}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, date: value }));
            }}
          />
        </label>
        <label className="composer-field">
          开始时间
          <input
            name="startTime"
            required
            type="time"
            value={draft.startTime}
            onInput={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, startTime: value }));
            }}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, startTime: value }));
            }}
          />
        </label>
        <label className="composer-field">
          结束时间
          <input
            name="endTime"
            type="time"
            value={draft.endTime || ""}
            onInput={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, endTime: value }));
            }}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, endTime: value }));
            }}
          />
        </label>
        <label className="composer-field composer-field--wide">
          地点 / 方式
          <input
            name="location"
            placeholder="线上、线下、会议链接、具体地址"
            value={draft.location || ""}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, location: value }));
            }}
          />
        </label>
        <label className="composer-field composer-field--wide">
          描述或备注
          <textarea
            name="description"
            placeholder="联系人、准备材料、复盘提醒"
            value={draft.description || ""}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onChange((current) => ({ ...current, description: value }));
            }}
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="composer-actions">
        <button onClick={onCancel} type="button">取消</button>
        <button type="submit">保存</button>
      </div>
    </form>
  );
}

function InterviewPrepPage({
  activeApplicationId,
  applications,
  events,
  onAddItem,
  onAddItemToToday,
  onCreateWorkspace,
  onNavigate,
  onOpenWorkspace,
  onRegenerateWorkspace,
  onRemoveItem,
  onReorderItem,
  onReturnToList,
  onSyncItemToCalendar,
  onSyncItemToTodo,
  onTogglePin,
  onUpdateItem,
  onUpdateNote,
  todayKey,
  workspaces,
}: {
  activeApplicationId: string | null;
  applications: ApplicationRecord[];
  events: CalendarEvent[];
  onAddItem: (workspaceId: string, title: string, details?: Partial<Pick<PreparationItem, "dueAt" | "scheduledAt" | "status">>) => void;
  onAddItemToToday: (workspaceId: string, itemId: string) => void;
  onCreateWorkspace: (applicationId: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenWorkspace: (applicationId: string) => void;
  onRegenerateWorkspace: (workspaceId: string, mode: "append" | "replace") => void;
  onRemoveItem: (workspaceId: string, itemId: string) => void;
  onReorderItem: (workspaceId: string, sourceId: string, targetId: string) => void;
  onReturnToList: () => void;
  onSyncItemToCalendar: (workspaceId: string, itemId: string) => void;
  onSyncItemToTodo: (workspaceId: string, itemId: string) => void;
  onTogglePin: (workspaceId: string) => void;
  onUpdateItem: (workspaceId: string, itemId: string, patch: Partial<PreparationItem>) => void;
  onUpdateNote: (workspaceId: string, noteContent: string) => void;
  todayKey: string;
  workspaces: InterviewWorkspace[];
}) {
  const activeApplication = applications.find((record) => record.id === activeApplicationId);
  const activeWorkspace = activeApplication
    ? workspaces.find((workspace) => workspace.applicationId === activeApplication.id) || createInterviewWorkspace(activeApplication, events)
    : null;

  if (activeApplication && activeWorkspace) {
    return (
      <InterviewWorkspaceDetail
        application={activeApplication}
        events={events}
        key={activeWorkspace.id}
        todayKey={todayKey}
        workspace={activeWorkspace}
        onAddItem={onAddItem}
        onAddItemToToday={onAddItemToToday}
        onRegenerateWorkspace={onRegenerateWorkspace}
        onRemoveItem={onRemoveItem}
        onReorderItem={onReorderItem}
        onReturnToList={onReturnToList}
        onSyncItemToCalendar={onSyncItemToCalendar}
        onSyncItemToTodo={onSyncItemToTodo}
        onUpdateItem={onUpdateItem}
        onUpdateNote={onUpdateNote}
      />
    );
  }

  return (
    <InterviewPrepList
      applications={applications}
      events={events}
      todayKey={todayKey}
      workspaces={workspaces}
      onCreateWorkspace={onCreateWorkspace}
      onNavigate={onNavigate}
      onOpenWorkspace={onOpenWorkspace}
      onTogglePin={onTogglePin}
    />
  );
}

function InterviewPrepList({
  applications,
  events,
  onCreateWorkspace,
  onNavigate,
  onOpenWorkspace,
  onTogglePin,
  todayKey,
  workspaces,
}: {
  applications: ApplicationRecord[];
  events: CalendarEvent[];
  onCreateWorkspace: (applicationId: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenWorkspace: (applicationId: string) => void;
  onTogglePin: (workspaceId: string) => void;
  todayKey: string;
  workspaces: InterviewWorkspace[];
}) {
  const [industryFilter, setIndustryFilter] = useState("全部");
  const [roleFilter, setRoleFilter] = useState("全部");
  const [prepQuery, setPrepQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(applications[0]?.id || "");
  const selectedApplicationValue = selectedApplicationId || applications[0]?.id || "";
  const workspaceByApplication = new Map(workspaces.map((workspace) => [workspace.applicationId, workspace]));
  const industryOptions = ["全部", "互联网", "央国企", "外企", "AI / 机器人", "品牌方", "其他"];
  const roleOptions = useMemo(
    () => ["全部", ...Array.from(new Set(applications.map((record) => inferRoleCategory(record)).filter(Boolean)))],
    [applications],
  );
  const weekEnd = addDays(todayKey, 7);
  const cards = applications
    .map((application) => {
      const workspace = workspaceByApplication.get(application.id) || createInterviewWorkspace(application, events);
      const nextEvent = findNextPrepEvent(application, events, todayKey);
      const progress = calculateWorkspaceProgress(workspace);
      return { application, nextEvent, progress, workspace };
    })
    .filter(({ application, workspace }) => {
      const haystack = [
        application.company,
        application.role,
        application.industry,
        application.companyType,
        application.direction,
        workspace.noteContent,
        workspace.items.map((item) => item.title).join(" "),
      ].join(" ").toLowerCase();
      return (
        (industryFilter === "全部" || normalizePrepIndustry(application) === industryFilter) &&
        (roleFilter === "全部" || inferRoleCategory(application) === roleFilter) &&
        (!prepQuery || haystack.includes(prepQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (a.workspace.pinned !== b.workspace.pinned) return a.workspace.pinned ? -1 : 1;
      const priorityDiff =
        prepPriorityScore(b.application, b.workspace, b.nextEvent, todayKey) -
        prepPriorityScore(a.application, a.workspace, a.nextEvent, todayKey);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.nextEvent?.date || "9999-12-31").localeCompare(b.nextEvent?.date || "9999-12-31");
    });
  const weeklyPrepEvents = events.filter((event) => event.date >= todayKey && event.date <= weekEnd && isPrepEvent(event));
  const urgentCount = cards.filter(({ application, nextEvent, workspace }) => prepPriorityScore(application, workspace, nextEvent, todayKey) >= 70).length;

  return (
    <section className="interview-prep-page">
      <div className="prep-page-header">
        <div>
          <h2>笔面试准备</h2>
          <p>先选择一个投递岗位，进入对应的笔试 / 面试准备工作区。</p>
        </div>
        <div className="prep-header-controls">
          <label>行业<select value={industryFilter} onChange={(event) => setIndustryFilter(event.currentTarget.value)}>{industryOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>岗位类型<select value={roleFilter} onChange={(event) => setRoleFilter(event.currentTarget.value)}>{roleOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="prep-search-field">搜索<span><Search aria-hidden="true" /><input placeholder="公司 / 岗位 / 准备内容" value={prepQuery} onChange={(event) => setPrepQuery(event.currentTarget.value)} /></span></label>
          <button onClick={() => setIsCreateOpen(true)} type="button"><Plus aria-hidden="true" />新建工作区</button>
        </div>
      </div>

      <div className="prep-summary-grid">
        <PrepSummaryCard icon={CalendarDays} label="待准备岗位" value={`${cards.filter(({ progress }) => progress < 100).length}个`} note="需要制定准备计划" />
        <PrepSummaryCard icon={NotebookPen} label="本周笔面试" value={`${weeklyPrepEvents.length}场`} note="未来七天内" />
        <PrepSummaryCard icon={AlarmClock} label="需优先处理" value={`${urgentCount}个`} note="时间临近且准备度较低" />
      </div>

      {applications.length === 0 ? (
        <section className="prep-empty-card">
          <h3>还没有可准备的岗位</h3>
          <p>请先在 Offer 跟进中添加投递记录，再为岗位创建笔面试准备工作区。</p>
          <div>
            <button onClick={() => onNavigate("Offer 跟进")} type="button">前往 Offer 跟进</button>
            <button onClick={() => setIsCreateOpen(true)} type="button">选择已有岗位</button>
          </div>
        </section>
      ) : (
        <div className="prep-list-layout">
          <div className="prep-card-grid">
            {cards.length === 0 ? (
              <div className="prep-empty-card prep-empty-card--inline"><h3>搜索无结果</h3><p>换一个公司、岗位或准备关键词试试。</p></div>
            ) : (
              cards.map(({ application, nextEvent, progress, workspace }) => (
                <button className="prep-position-card" key={application.id} onClick={() => onOpenWorkspace(application.id)} type="button">
                  <div className="prep-card-topline">
                    <CompanyAvatar company={application.company} />
                    <div>
                      <h3>{application.company || "未命名公司"}｜{application.role || "岗位待填写"}</h3>
                      <span className={`status-pill status-pill--${statusTone(application.status)}`}>{application.status || "准备中"}</span>
                    </div>
                    <span
                      aria-label={workspace.pinned ? "取消置顶" : "置顶岗位"}
                      className={workspace.pinned ? "prep-pin prep-pin--active" : "prep-pin"}
                      onClick={(event) => {
                        event.stopPropagation();
                        onTogglePin(workspace.id);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <Star aria-hidden="true" />
                    </span>
                  </div>
                  <div className="prep-next-block">
                    <span>下一场：{nextEvent ? eventTypeLabel(nextEvent.eventType) : application.nextAction || "待确认"}</span>
                    <strong>{nextEvent ? `${formatDateLabel(nextEvent.date).replace("2026年", "")} ${nextEvent.startTime}` : "时间待定"}</strong>
                  </div>
                  <div className="prep-card-progress"><ProgressRing value={progress} /><span>准备进度</span></div>
                  <div className="prep-tags">
                    <span>{normalizePrepIndustry(application)}</span>
                    <span>{inferRoleCategory(application)}</span>
                    {buildPrepFocusTags(application).slice(0, 1).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <strong className="prep-enter-link">进入工作区 <span aria-hidden="true">→</span></strong>
                </button>
              ))
            )}
          </div>

          <aside className="prep-side-rail">
            <section>
              <div className="prep-side-title"><h3>最近提醒</h3><button type="button">查看全部</button></div>
              {cards.slice(0, 3).map(({ application, nextEvent }) => (
                <button key={application.id} onClick={() => onOpenWorkspace(application.id)} type="button">
                  <CompanyAvatar company={application.company} />
                  <span>
                    <strong>{nextEvent ? `优先准备${application.company}${eventTypeLabel(nextEvent.eventType)}` : `补充${application.company}准备材料`}</strong>
                    <small>{nextEvent ? `${formatDateLabel(nextEvent.date).replace("2026年", "")} ${nextEvent.startTime}` : application.nextAction || "下一步待确认"}</small>
                  </span>
                </button>
              ))}
            </section>
            <section className="prep-advice-card">
              <h3>准备建议</h3>
              <ul>
                <li>根据笔面试时间倒排准备计划。</li>
                <li>优先处理近期场次。</li>
                <li>针对薄弱知识点补充材料。</li>
                <li>面试结束后及时记录复盘。</li>
              </ul>
            </section>
          </aside>
        </div>
      )}

      {isCreateOpen && (
        <div className="confirm-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
          <section aria-modal="true" className="confirm-dialog prep-create-dialog" role="dialog">
            <h3>选择已有岗位</h3>
            {applications.length === 0 ? (
              <p>当前还没有可选择的投递记录。</p>
            ) : (
              <label>
                投递岗位
                <select value={selectedApplicationValue} onChange={(event) => setSelectedApplicationId(event.currentTarget.value)}>
                  {applications.map((record) => <option key={record.id} value={record.id}>{record.company}｜{record.role}</option>)}
                </select>
              </label>
            )}
            <div className="confirm-actions">
              <button onClick={() => setIsCreateOpen(false)} type="button">取消</button>
              <button onClick={() => { if (selectedApplicationValue) onCreateWorkspace(selectedApplicationValue); setIsCreateOpen(false); }} type="button">创建工作区</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function InterviewWorkspaceDetail({
  application,
  events,
  onAddItem,
  onAddItemToToday,
  onRegenerateWorkspace,
  onRemoveItem,
  onReorderItem,
  onReturnToList,
  onSyncItemToCalendar,
  onSyncItemToTodo,
  onUpdateItem,
  onUpdateNote,
  todayKey,
  workspace,
}: {
  application: ApplicationRecord;
  events: CalendarEvent[];
  onAddItem: (workspaceId: string, title: string, details?: Partial<Pick<PreparationItem, "dueAt" | "scheduledAt" | "status">>) => void;
  onAddItemToToday: (workspaceId: string, itemId: string) => void;
  onRegenerateWorkspace: (workspaceId: string, mode: "append" | "replace") => void;
  onRemoveItem: (workspaceId: string, itemId: string) => void;
  onReorderItem: (workspaceId: string, sourceId: string, targetId: string) => void;
  onReturnToList: () => void;
  onSyncItemToCalendar: (workspaceId: string, itemId: string) => void;
  onSyncItemToTodo: (workspaceId: string, itemId: string) => void;
  onUpdateItem: (workspaceId: string, itemId: string, patch: Partial<PreparationItem>) => void;
  onUpdateNote: (workspaceId: string, noteContent: string) => void;
  todayKey: string;
  workspace: InterviewWorkspace;
}) {
  const [itemDraft, setItemDraft] = useState<{ dueAt: string; id?: string; scheduledAt: string; status: PrepItemStatus; title: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState(workspace.noteContent);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "failed">("saved");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const noteEditorRef = useRef<HTMLTextAreaElement>(null);
  const nextEvent = findNextPrepEvent(application, events, todayKey);
  const progress = calculateWorkspaceProgress(workspace);
  const sortedItems = workspace.items.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const pendingItems = sortedItems.filter((item) => !item.completed);
  const noteOutline = useMemo(() => extractNoteOutline(noteDraft), [noteDraft]);
  const noteTools = [
    { label: "正文", snippet: "正文内容" },
    { label: "H1", snippet: "# 一级标题" },
    { label: "H2", snippet: "## 二级标题" },
    { label: "H3", snippet: "### 三级标题" },
    { label: "列表", snippet: "- 要点一\n- 要点二\n- 要点三" },
    { label: "待办", snippet: "- [ ] 待完成事项" },
    { label: "高亮", snippet: "==重点内容==" },
    { label: "链接", snippet: "[链接文字](https://)" },
  ];

  function insertNoteSnippet(snippet: string) {
    const editor = noteEditorRef.current;
    let cursorPosition = 0;

    setNoteDraft((current) => {
      if (!editor) {
        const prefix = current.trim() ? "\n\n" : "";
        const next = `${current.trimEnd()}${prefix}${snippet}`;
        cursorPosition = next.length;
        return next;
      }

      const start = editor.selectionStart ?? current.length;
      const end = editor.selectionEnd ?? start;
      const before = current.slice(0, start);
      const after = current.slice(end);
      const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
      const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
      const inserted = `${prefix}${snippet}${suffix}`;
      cursorPosition = before.length + inserted.length;
      return `${before}${inserted}${after}`;
    });
    setSaveState("saving");
    window.requestAnimationFrame(() => {
      noteEditorRef.current?.focus();
      noteEditorRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  function openCreatePrepItem() {
    setItemDraft({ dueAt: "", scheduledAt: "", status: "not_started", title: "" });
  }

  function openEditPrepItem(item: PreparationItem) {
    setItemDraft({ dueAt: item.dueAt, id: item.id, scheduledAt: item.scheduledAt, status: item.status, title: item.title });
  }

  function focusNoteLine(lineNumber: number) {
    const editor = noteEditorRef.current;
    if (!editor) return;
    const lines = noteDraft.split("\n");
    const cursorPosition = lines.slice(0, Math.max(0, lineNumber - 1)).join("\n").length + (lineNumber > 1 ? 1 : 0);
    editor.focus();
    editor.setSelectionRange(cursorPosition, cursorPosition);
  }

  function submitPrepItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemDraft?.title.trim()) return;

    if (itemDraft.id) {
      onUpdateItem(workspace.id, itemDraft.id, {
        completed: itemDraft.status === "completed",
        dueAt: itemDraft.dueAt,
        scheduledAt: itemDraft.scheduledAt,
        status: itemDraft.status,
        title: itemDraft.title.trim(),
      });
    } else {
      onAddItem(workspace.id, itemDraft.title.trim(), {
        dueAt: itemDraft.dueAt,
        scheduledAt: itemDraft.scheduledAt,
        status: itemDraft.status,
      });
    }

    setItemDraft(null);
  }

  useEffect(() => {
    if (noteDraft === workspace.noteContent) return;
    const timer = window.setTimeout(() => {
      try {
        onUpdateNote(workspace.id, noteDraft);
        setSaveState("saved");
      } catch {
        setSaveState("failed");
      }
    }, 520);
    return () => window.clearTimeout(timer);
  }, [noteDraft, onUpdateNote, workspace.id, workspace.noteContent]);

  return (
    <section className="interview-prep-page interview-prep-page--detail">
      <div className="prep-detail-header">
        <button onClick={onReturnToList} type="button"><ArrowLeft aria-hidden="true" />返回岗位列表</button>
        <div><h2>{application.company || "未命名公司"}｜{application.role || "岗位待填写"}</h2><p>笔试 / 面试准备工作区</p></div>
        <div className="prep-detail-actions">
          <span>{normalizePrepIndustry(application)}</span>
          <span>{inferRoleCategory(application)}</span>
          <button onClick={() => onRegenerateWorkspace(workspace.id, "append")} type="button"><RefreshCw aria-hidden="true" />重新生成准备建议</button>
        </div>
      </div>

      <div className="prep-summary-grid prep-summary-grid--detail">
        <PrepSummaryCard icon={CalendarDays} label={nextEvent ? `距下一场${eventTypeLabel(nextEvent.eventType)}` : "暂无笔面试安排"} value={nextEvent ? distanceLabel(nextEvent.date, todayKey).replace("还有 ", "").replace("截止", "") : "待定"} note={nextEvent ? `${formatDateLabel(nextEvent.date).replace("2026年", "")} ${nextEvent.startTime}` : "在日历中新增节点后自动同步"} />
        <PrepSummaryCard icon={Target} label="准备进度" value={`${progress}%`} note={`笔试 ${calculateTypeProgress(workspace, "written_test")}% · 面试 ${calculateTypeProgress(workspace, "interview")}%`} />
        <PrepSummaryCard icon={FileText} label="待整理内容" value={`${pendingItems.length}个`} note={`面试 ${pendingItems.filter((item) => item.type === "interview").length} 个 · 笔试 ${pendingItems.filter((item) => item.type === "written_test").length} 个`} />
      </div>

      <div className="prep-workspace-grid">
        <section className="prep-work-panel prep-checklist-panel">
          <div className="prep-panel-heading">
            <div><h3>本岗位准备清单</h3><p>列表只保留事项名，需要编辑时打开详情。</p></div>
            <button className="prep-add-item-button" onClick={openCreatePrepItem} type="button"><Plus aria-hidden="true" />新增事项</button>
          </div>
          <div className="prep-item-list">
            {sortedItems.map((item) => (
              <article className="prep-item-row" draggable key={item.id} onDragOver={(event) => event.preventDefault()} onDragStart={() => setDraggedItemId(item.id)} onDrop={() => { if (draggedItemId && draggedItemId !== item.id) onReorderItem(workspace.id, draggedItemId, item.id); setDraggedItemId(null); }}>
                <GripVertical aria-hidden="true" />
                <input aria-label={`完成 ${item.title}`} checked={item.completed} type="checkbox" onChange={(event) => onUpdateItem(workspace.id, item.id, { completed: event.currentTarget.checked, status: event.currentTarget.checked ? "completed" : "in_progress" })} />
                <button className="prep-item-title-button" onClick={() => openEditPrepItem(item)} type="button">
                  <strong>{item.title}</strong>
                  <small>
                    {prepStatusLabel(item.status)}
                    {item.scheduledAt ? ` · ${item.scheduledAt.slice(0, 10)} ${item.scheduledAt.slice(11, 16)}` : item.dueAt ? ` · ${formatDateLabel(item.dueAt).replace("2026年", "")}` : ""}
                  </small>
                </button>
                <div className="prep-item-row-actions">
                  <button onClick={() => onAddItemToToday(workspace.id, item.id)} type="button">设为今日</button>
                  <button onClick={() => onSyncItemToTodo(workspace.id, item.id)} type="button">{item.syncToTodo ? "取消 Todo" : "同步 Todo"}</button>
                  <button onClick={() => onSyncItemToCalendar(workspace.id, item.id)} type="button">{item.syncToCalendar ? "取消日历" : "同步日历"}</button>
                  <button onClick={() => openEditPrepItem(item)} type="button">编辑</button>
                  <button className="prep-danger-link" onClick={() => onRemoveItem(workspace.id, item.id)} type="button">删除</button>
                </div>
              </article>
            ))}
            {sortedItems.length === 0 && <p className="prep-side-empty">还没有准备事项，先新增一条要做的准备。</p>}
          </div>
        </section>

        <section className="prep-work-panel prep-note-panel">
          <div className="prep-panel-heading">
            <div><h3>我的笔记</h3><p>每个岗位独立保存，输入后自动保存</p></div>
            <span className={`prep-save-state prep-save-state--${saveState}`}><Save aria-hidden="true" />{saveState === "saving" ? "保存中" : saveState === "failed" ? "保存失败" : `已自动保存 ${formatClock(workspace.updatedAt)}`}</span>
          </div>
          <div className="prep-editor-toolbar">
            {noteTools.map((item) => (
              <button key={item.label} onClick={() => insertNoteSnippet(item.snippet)} type="button">{item.label}</button>
            ))}
          </div>
          <div className="prep-note-body">
            <textarea
              aria-label="岗位准备笔记"
              className="prep-note-editor"
              ref={noteEditorRef}
              value={noteDraft}
              onChange={(event) => {
                setNoteDraft(event.currentTarget.value);
                setSaveState("saving");
              }}
            />
            <aside aria-label="笔记目录预览" className="prep-note-outline">
              <div className="prep-heading-sample">
                <span>标题层级</span>
                <strong>一级标题</strong>
                <em>二级标题</em>
              </div>
              <h4>目录预览</h4>
              {noteOutline.length === 0 ? (
                <p className="prep-outline-empty">使用 H1 / H2 / H3 后会自动生成目录。</p>
              ) : (
                <nav className="prep-outline-list">
                  {noteOutline.map((heading) => (
                    <button
                      className={`prep-outline-item prep-outline-item--${heading.level}`}
                      key={heading.id}
                      onClick={() => focusNoteLine(heading.line)}
                      type="button"
                    >
                      {heading.title}
                    </button>
                  ))}
                </nav>
              )}
            </aside>
          </div>
        </section>

      </div>

      {itemDraft && (
        <div className="confirm-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setItemDraft(null); }}>
          <form aria-modal="true" className="prep-item-dialog" onSubmit={submitPrepItem} role="dialog">
            <div className="panel-title-row">
              <div>
                <span>{itemDraft.id ? "Edit preparation" : "New preparation"}</span>
                <h3>{itemDraft.id ? "编辑准备事项" : "新增准备事项"}</h3>
              </div>
              <button aria-label="关闭准备事项表单" className="icon-close-button" onClick={() => setItemDraft(null)} title="关闭" type="button">×</button>
            </div>
            <label className="composer-field composer-field--wide">
              事项名称
              <input
                autoFocus
                placeholder="例如：整理 3 个 STAR 案例"
                value={itemDraft.title}
                onChange={(event) => setItemDraft((current) => current ? { ...current, title: event.currentTarget.value } : current)}
              />
            </label>
            <div className="composer-grid">
              <label className="composer-field">
                状态
                <select
                  value={itemDraft.status}
                  onChange={(event) => {
                    const status = event.currentTarget.value as PrepItemStatus;
                    setItemDraft((current) => current ? { ...current, status } : current);
                  }}
                >
                  {prepStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="composer-field">
                截止日期
                <input
                  type="date"
                  value={itemDraft.dueAt}
                  onChange={(event) => setItemDraft((current) => current ? { ...current, dueAt: event.currentTarget.value } : current)}
                />
              </label>
              <label className="composer-field">
                执行时间
                <input
                  type="datetime-local"
                  value={itemDraft.scheduledAt}
                  onChange={(event) => setItemDraft((current) => current ? { ...current, scheduledAt: event.currentTarget.value } : current)}
                />
              </label>
            </div>
            <div className="composer-actions">
              <button onClick={() => setItemDraft(null)} type="button">取消</button>
              <button type="submit">{itemDraft.id ? "保存修改" : "保存事项"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function PrepSummaryCard({ icon: Icon, label, note, value }: { icon: IconComponent; label: string; note: string; value: string }) {
  return (
    <Card className="prep-summary-card">
      <CardContent>
        <span className="prep-summary-icon"><Icon aria-hidden="true" /></span>
        <div><p>{label}</p><strong>{value}</strong><small>{note}</small></div>
      </CardContent>
    </Card>
  );
}

function CompanyAvatar({ company }: { company: string }) {
  return (
    <Avatar className="company-avatar">
      <AvatarFallback>{(company || "职").slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <span className="prep-ring" style={{ "--progress": `${safeValue}%` } as CSSProperties}>
      <strong>{safeValue}%</strong>
      <small>准备进度</small>
    </span>
  );
}

function OfferTodoPage({
  todos,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
  onUpdateTodo,
}: {
  todos: CalendarTodo[];
  onAddTodo: (todo: Omit<CalendarTodo, "id" | "done">) => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onUpdateTodo: (id: string, todo: Omit<CalendarTodo, "id" | "done">) => void;
}) {
  const todayKey = toDateKey(new Date());
  const [panelMode, setPanelMode] = useState<TodoPanelMode>("todoList");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todoDraft, setTodoDraft] = useState<Omit<CalendarTodo, "id" | "done">>(() => blankTodoDraft(todayKey));
  const [todoDraftBase, setTodoDraftBase] = useState<Omit<CalendarTodo, "id" | "done">>(() => blankTodoDraft(todayKey));
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<CalendarTodo | null>(null);
  const openTodos = todos.filter((todo) => !todo.done);
  const overdueTodos = openTodos.filter((todo) => todo.due < todayKey);
  const p0Todos = openTodos.filter((todo) => todo.priority === "P0");
  const sortedTodos = todos
    .map(normalizeTodo)
    .slice()
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.due.localeCompare(b.due));
  const isTodoFormOpen = panelMode === "createTodo" || panelMode === "editTodo";
  const isTodoDirty = isTodoFormOpen && !todoDraftsEqual(todoDraft, todoDraftBase);

  const clearTodoForm = useCallback(() => {
    const nextDraft = blankTodoDraft(todayKey);
    setTodoDraft(nextDraft);
    setTodoDraftBase(nextDraft);
    setEditingTodoId(null);
    setPanelMode("todoList");
    setShowDiscardConfirm(false);
  }, [todayKey]);

  const requestCloseTodoForm = useCallback(() => {
    if (isTodoDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    clearTodoForm();
  }, [clearTodoForm, isTodoDirty]);

  useEffect(() => {
    if (!isTodoFormOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestCloseTodoForm();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTodoFormOpen, requestCloseTodoForm]);

  function openCreateTodo() {
    const nextDraft = blankTodoDraft(todayKey);
    setTodoDraft(nextDraft);
    setTodoDraftBase(nextDraft);
    setEditingTodoId(null);
    setPanelMode("createTodo");
  }

  function openEditTodo(todo: CalendarTodo) {
    const normalized = normalizeTodo(todo);
    const nextDraft = {
      title: normalized.title,
      due: normalized.due,
      kind: normalized.kind,
      priority: normalized.priority,
      owner: normalized.owner,
    };
    setTodoDraft(nextDraft);
    setTodoDraftBase(nextDraft);
    setEditingTodoId(todo.id);
    setPanelMode("editTodo");
  }

  function discardTodoChanges() {
    clearTodoForm();
  }

  function submitTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!todoDraft.title.trim()) return;

    const nextTodo = {
      ...todoDraft,
      title: todoDraft.title.trim(),
      owner: todoDraft.owner.trim() || "我",
    };

    if (panelMode === "editTodo" && editingTodoId) {
      onUpdateTodo(editingTodoId, nextTodo);
    } else {
      onAddTodo(nextTodo);
    }

    clearTodoForm();
  }

  function requestDeleteTodo(todo: CalendarTodo) {
    setTodoToDelete(todo);
  }

  function confirmDeleteTodo() {
    if (!todoToDelete) return;
    onRemoveTodo(todoToDelete.id);
    setTodoToDelete(null);
  }

  function cancelDeleteTodo() {
    setTodoToDelete(null);
  }

  return (
    <section className="offer-todo-page">
      <div className="todo-summary-grid">
        <Metric label="全部事项" value={todos.length} />
        <Metric label="已完成" value={todos.filter((todo) => todo.done).length} />
        <Metric label="P0 高优" value={p0Todos.length} />
        <Metric label="已延期" value={overdueTodos.length} />
      </div>

      <section className="todo-table-panel">
        <div className="todo-table-toolbar">
          <div>
            <span>Todo list</span>
            <h3>事项明细</h3>
          </div>
          <div className="todo-toolbar-actions">
            <button onClick={openCreateTodo} type="button">+ 添加记录</button>
            <button type="button">筛选</button>
            <button type="button">排序</button>
          </div>
        </div>

        <div className="todo-data-table">
          <div className="todo-data-head">
            <span>待办事项</span>
            <span>截止日期</span>
            <span>距离截止日</span>
            <span>是否已完成</span>
            <span>优先级</span>
            <span>执行人</span>
            <span>操作</span>
          </div>
          {sortedTodos.length === 0 ? (
            <div className="todo-empty-state">
              <strong>暂无待办事项</strong>
              <p>把投递准备、复盘提醒和截止动作放进这里。</p>
              <button onClick={openCreateTodo} type="button">新建 Todo</button>
            </div>
          ) : (
            sortedTodos.map((todo) => (
              <article className={`todo-data-row todo-data-row--${todo.kind} ${todo.done ? "todo-data-row--done" : ""}`} key={todo.id}>
                <strong>{todo.title}</strong>
                <span>{formatDateLabel(todo.due)}</span>
                <span>{distanceLabel(todo.due, todayKey)}</span>
                <button aria-label={todo.done ? "取消完成" : "标记完成"} onClick={() => onToggleTodo(todo.id)} type="button">
                  {todo.done ? "取消完成" : "标记完成"}
                </button>
                <small className={`priority-pill priority-pill--${todo.priority.toLowerCase()}`}>{priorityLabel(todo.priority)}</small>
                <span>{todo.owner}</span>
                <div className="todo-row-actions">
                  <button onClick={() => openEditTodo(todo)} type="button">编辑</button>
                  <button className="danger-inline-button" onClick={() => requestDeleteTodo(todo)} type="button">删除</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {isTodoFormOpen && (
        <div className="todo-drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestCloseTodoForm();
        }}>
          <form aria-modal="true" className="todo-entry-form" onSubmit={submitTodo} role="dialog">
            <div className="panel-title-row">
              <div>
                <span>{panelMode === "editTodo" ? "Edit Todo" : "New Todo"}</span>
                <h3>{panelMode === "editTodo" ? "编辑待办事项" : "新建 Todo"}</h3>
              </div>
              <button aria-label="关闭 Todo 表单" className="icon-close-button" onClick={requestCloseTodoForm} title="关闭" type="button">×</button>
            </div>
            <label className="composer-field composer-field--wide">
              待办事项
              <input
                aria-label="待办事项"
                placeholder="例如：准备腾讯一面自我介绍"
                value={todoDraft.title}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setTodoDraft((current) => ({ ...current, title: value }));
                }}
              />
            </label>
            <div className="composer-grid">
              <label className="composer-field">
                截止日期
                <input
                  aria-label="Todo 截止日期"
                  type="date"
                  value={todoDraft.due}
                  onInput={(event) => {
                    const value = event.currentTarget.value;
                    setTodoDraft((current) => ({ ...current, due: value }));
                  }}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setTodoDraft((current) => ({ ...current, due: value }));
                  }}
                />
              </label>
              <label className="composer-field">
                Todo 类型
                <select
                  aria-label="Todo 类型"
                  value={todoDraft.kind}
                  onChange={(event) => {
                    const value = event.currentTarget.value as CalendarTodoKind;
                    setTodoDraft((current) => ({ ...current, kind: value }));
                  }}
                >
                  {todoKindOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="composer-field">
                优先级
                <select
                  aria-label="优先级"
                  value={todoDraft.priority}
                  onChange={(event) => {
                    const value = event.currentTarget.value as CalendarTodo["priority"];
                    setTodoDraft((current) => ({ ...current, priority: value }));
                  }}
                >
                  <option value="P0">P0-高优</option>
                  <option value="P1">P1-重要</option>
                  <option value="P2">P2-普通</option>
                  <option value="P3">P3-低优</option>
                </select>
              </label>
              <label className="composer-field">
                执行人
                <input
                  aria-label="执行人"
                  placeholder="执行人"
                  value={todoDraft.owner}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setTodoDraft((current) => ({ ...current, owner: value }));
                  }}
                />
              </label>
            </div>
            <div className="composer-actions">
              <button className="todo-cancel-button" onClick={requestCloseTodoForm} type="button">取消</button>
              <button className="todo-save-button" type="submit">保存 Todo</button>
            </div>
          </form>
        </div>
      )}

      {showDiscardConfirm && (
        <ConfirmDialog
          cancelLabel="继续编辑"
          confirmLabel="放弃修改"
          message="当前内容尚未保存，确定要放弃修改吗？"
          onCancel={() => setShowDiscardConfirm(false)}
          onConfirm={discardTodoChanges}
          title="未保存的 Todo"
        />
      )}

      {todoToDelete && (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="确认删除"
          danger
          message="确定删除该任务吗？删除后无法恢复。"
          onCancel={cancelDeleteTodo}
          onConfirm={confirmDeleteTodo}
          title="删除 Todo"
        />
      )}
    </section>
  );
}

function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  danger = false,
  message,
  onCancel,
  onConfirm,
  title,
}: {
  cancelLabel: string;
  confirmLabel: string;
  danger?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section aria-modal="true" className="confirm-dialog" role="dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button onClick={onCancel} type="button">{cancelLabel}</button>
          <button className={danger ? "danger-button" : ""} onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function DeleteLinkedEventDialog({
  event,
  onCancel,
  onDeleteLinked,
  onRemoveOnly,
}: {
  event: CalendarEvent;
  onCancel: () => void;
  onDeleteLinked: () => void;
  onRemoveOnly: () => void;
}) {
  const sourceLabel = sourceTypeLabel(event.sourceType);

  useEffect(() => {
    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onCancel();
      }}
    >
      <section aria-modal="true" className="confirm-dialog delete-scope-dialog" role="dialog">
        <h3>删除该日程</h3>
        <p>该日程由 {sourceLabel} 自动生成。请选择删除方式。</p>
        <div className="delete-scope-summary">
          <strong>{event.title}</strong>
          <span>{formatDateLabel(event.date)} {event.startTime || "全天"}</span>
        </div>
        <div className="delete-scope-actions">
          <button onClick={onCancel} type="button">取消</button>
          <button onClick={onRemoveOnly} type="button">仅从日历中移除</button>
          <button className="danger-button" onClick={onDeleteLinked} type="button">同时删除关联内容</button>
        </div>
      </section>
    </div>
  );
}

function buildDashboardData({
  applications,
  events,
  jobs,
  todos,
  trendRange,
}: {
  applications: ApplicationRecord[];
  events: CalendarEvent[];
  jobs: Job[];
  todos: CalendarTodo[];
  trendRange: TrendRange;
}): DashboardData {
  const submittedJobCount = jobs.filter((job) => job.status === "已投递" || job.status === "面试中").length;
  const totalApplications = applications.length + submittedJobCount;
  const writtenCount = applications.filter((record) => record.status === "笔试中" || isActiveStage(record.writtenTest)).length
    + events.filter((event) => event.eventType === "written").length;
  const interviewCount = applications.filter((record) => record.status === "面试中" || isActiveStage(record.interview)).length
    + events.filter((event) => event.eventType === "interview").length;
  const offerCount = applications.filter((record) => record.status === "Offer" || record.offerStatus !== "暂无").length
    + events.filter((event) => event.eventType === "offer").length;
  const followCount = applications.filter((record) => record.needsFollowUp === "是" && record.status !== "已结束").length
    + todos.filter((todo) => !todo.done && todo.kind === "follow").length;
  const reminders = buildDashboardReminders({ applications, events, todos });
  const openTodos = todos.filter((todo) => !todo.done).length;
  const doneTodos = todos.filter((todo) => todo.done).length;
  const progressBase = openTodos + doneTodos + totalApplications;
  const progressDone = doneTodos + applications.filter((record) => record.status === "已结束" || record.offerStatus === "已接受").length;

  return {
    companyTypes: buildCompanyTypeStats(jobs, applications),
    metrics: [
      { id: "total", label: "总投递数", value: totalApplications, helper: "暂无对比数据", color: "blue", icon: Send, filterStatus: "全部" },
      { id: "written", label: "笔试中", value: writtenCount, helper: "暂无对比数据", color: "indigo", icon: NotebookPen, filterStatus: "笔试中" },
      { id: "interview", label: "面试中", value: interviewCount, helper: "暂无对比数据", color: "purple", icon: UsersRound, filterStatus: "面试中" },
      { id: "offer", label: "Offer", value: offerCount, helper: "暂无对比数据", color: "orange", icon: Award, filterStatus: "Offer" },
      { id: "follow", label: "待跟进", value: followCount, helper: "暂无对比数据", color: "red", icon: AlarmClock, filterStatus: "待跟进" },
    ],
    notifications: reminders.filter((reminder) => reminder.isOverdue || reminder.distance === "今天截止" || reminder.distance === "还有 1 天"),
    pipeline: buildPipelineRows({ applications, jobs, totalApplications }),
    progress: progressBase === 0 ? 0 : Math.min(100, Math.round((progressDone / progressBase) * 100)),
    reminders,
    trendPoints: buildTrendPoints({ applications, jobs, trendRange }),
  };
}

function buildPipelineRows({
  applications,
  jobs,
  totalApplications,
}: {
  applications: ApplicationRecord[];
  jobs: Job[];
  totalApplications: number;
}) {
  const rows = statusVisuals.map((item) => {
    const count = countStatus(item.key, applications, jobs);
    const denominator = item.key === "收藏中" ? Math.max(jobs.length, 1) : Math.max(totalApplications, 1);
    return {
      status: item.key,
      label: item.label,
      count,
      percent: Math.min(100, Math.round((count / denominator) * 100)),
      color: item.color,
      icon: item.icon,
    };
  });

  return rows;
}

function countStatus(status: string, applications: ApplicationRecord[], jobs: Job[]) {
  if (status === "收藏中") return jobs.filter((job) => job.status === "收藏中").length;
  if (status === "笔试中") return applications.filter((record) => record.status === "笔试中" || isActiveStage(record.writtenTest)).length;
  if (status === "面试中") return applications.filter((record) => record.status === "面试中" || isActiveStage(record.interview)).length;
  if (status === "Offer") return applications.filter((record) => record.status === "Offer" || record.offerStatus !== "暂无").length;
  if (status === "已结束") return applications.filter((record) => record.status === "已结束").length;
  return applications.filter((record) => record.status === status).length + jobs.filter((job) => job.status === status).length;
}

function isActiveStage(value: string) {
  return Boolean(value && value !== "未开始" && value !== "无" && value !== "待确认");
}

function buildCompanyTypeStats(jobs: Job[], applications: ApplicationRecord[]): CompanyTypeStat[] {
  const entries = [
    ...jobs.map((job) => `${job.companyType} ${job.industry} ${job.tags.join(" ")}`),
    ...applications.map((record) => `${record.companyType} ${record.industry} ${record.direction}`),
  ].filter(Boolean);
  const total = Math.max(entries.length, 1);

  return companyTypeGroups.map((group) => {
    const count = group.key === "其他"
      ? entries.filter((entry) => !companyTypeGroups.some((candidate) => candidate.key !== "其他" && candidate.match.some((keyword) => entry.includes(keyword)))).length
      : entries.filter((entry) => group.match.some((keyword) => entry.includes(keyword))).length;

    return {
      key: group.key,
      label: group.label,
      count,
      total: entries.length,
      percent: Math.round((count / total) * 100),
      color: group.color,
      icon: group.icon,
    };
  });
}

function buildTrendPoints({
  applications,
  jobs,
  trendRange,
}: {
  applications: ApplicationRecord[];
  jobs: Job[];
  trendRange: TrendRange;
}) {
  const range = trendRanges.find((item) => item.value === trendRange) || trendRanges[1];
  if (trendRange === "autumn") {
    const autumnBuckets = [
      { label: "8.1-8.31", start: "2026-08-01", end: "2026-08-31" },
      { label: "9.1-9.30", start: "2026-09-01", end: "2026-09-30" },
      { label: "10.1-10.31", start: "2026-10-01", end: "2026-10-31" },
      { label: "11.1-11.30", start: "2026-11-01", end: "2026-11-30" },
      { label: "12.1-12.30", start: "2026-12-01", end: "2026-12-30" },
    ];

    return autumnBuckets.map((bucket) => {
      const bucketStart = new Date(`${bucket.start}T00:00:00`);
      const bucketEnd = new Date(`${bucket.end}T23:59:59`);
      const value = applications.filter((record) => dateInRange(record.applyDate, bucketStart, bucketEnd)).length
        + jobs.filter((job) => (job.status === "已投递" || job.status === "面试中") && dateInRange(job.updatedAt, bucketStart, bucketEnd)).length;

      return { label: bucket.label, value };
    });
  }

  const today = new Date(`${dashboardTodayKey}T00:00:00`);
  const start = new Date(today);
  const weeks = range.weeks || 8;
  start.setDate(today.getDate() - weeks * 7 + 1);

  return Array.from({ length: Math.min(weeks, 12) }, (_, index) => {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + index * 7);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + 6);
    const value = applications.filter((record) => dateInRange(record.applyDate, bucketStart, bucketEnd)).length
      + jobs.filter((job) => (job.status === "已投递" || job.status === "面试中") && dateInRange(job.updatedAt, bucketStart, bucketEnd)).length;

    return {
      label: `${bucketStart.getMonth() + 1}.${bucketStart.getDate()}-${bucketEnd.getMonth() + 1}.${bucketEnd.getDate()}`,
      value,
    };
  });
}

function buildDashboardReminders({
  applications,
  events,
  todos,
}: {
  applications: ApplicationRecord[];
  events: CalendarEvent[];
  todos: CalendarTodo[];
}) {
  const reminders: DashboardReminder[] = [];

  events.forEach((event) => {
    reminders.push({
      id: `event-${event.id}`,
      title: event.title,
      date: event.date,
      dateLabel: formatDateLabel(event.date),
      time: event.startTime || "全天",
      distance: distanceLabel(event.date, dashboardTodayKey),
      color: colorFromEventType(event.eventType),
      isOverdue: event.date < dashboardTodayKey,
      view: "Offer 日历",
    });
  });

  todos.filter((todo) => !todo.done).forEach((todo) => {
    reminders.push({
      id: `todo-reminder-${todo.id}`,
      title: todo.title,
      date: todo.due,
      dateLabel: formatDateLabel(todo.due),
      time: "待办",
      distance: distanceLabel(todo.due, dashboardTodayKey),
      color: colorFromEventType(todo.kind),
      isOverdue: todo.due < dashboardTodayKey,
      view: "Offer To Do",
    });
  });

  applications.forEach((record) => {
    if (record.nextDeadline) {
      reminders.push(buildApplicationReminder(record, "next"));
    }
    if (record.offerDeadline) {
      reminders.push(buildApplicationReminder(record, "offer"));
    }
  });

  return reminders
    .filter((reminder) => Boolean(reminder.date))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function buildApplicationReminder(record: ApplicationRecord, kind: "next" | "offer"): DashboardReminder {
  const date = kind === "offer" ? record.offerDeadline : record.nextDeadline.slice(0, 10);
  const time = kind === "offer" ? "18:00" : record.nextDeadline.slice(11, 16) || "09:00";
  return {
    id: `${record.id}-${kind}-reminder`,
    title: kind === "offer" ? `${record.company} Offer 决策` : `${record.company} · ${record.nextAction || record.role}`,
    date,
    dateLabel: formatDateLabel(date),
    time,
    distance: distanceLabel(date, dashboardTodayKey),
    color: kind === "offer" ? "green" : "purple",
    isOverdue: date < dashboardTodayKey,
    view: "Offer 跟进",
  };
}

function buildSearchResults({
  applications,
  events,
  jobs,
  query,
  todos,
}: {
  applications: ApplicationRecord[];
  events: CalendarEvent[];
  jobs: Job[];
  query: string;
  todos: CalendarTodo[];
}): SearchResult[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];

  const results: SearchResult[] = [];
  jobs.forEach((job) => {
    const haystack = [job.company, job.title, job.description, job.tags.join(" ")].join(" ").toLowerCase();
    if (haystack.includes(keyword)) {
      results.push({ id: `job-${job.id}`, title: `${job.company} · ${job.title}`, detail: job.city, type: "岗位", view: "求职信息源" });
    }
  });
  applications.forEach((record) => {
    const haystack = [record.company, record.role, record.notes, record.jd, record.nextAction].join(" ").toLowerCase();
    if (haystack.includes(keyword)) {
      results.push({ id: `application-${record.id}`, title: `${record.company} · ${record.role}`, detail: record.status, type: "投递", view: "Offer 跟进" });
    }
  });
  events.forEach((event) => {
    const haystack = [event.title, event.description, event.location, event.source].join(" ").toLowerCase();
    if (haystack.includes(keyword)) {
      results.push({ id: `event-${event.id}`, title: event.title, detail: `${formatDateLabel(event.date)} ${event.startTime}`, type: "日程", view: "Offer 日历" });
    }
  });
  todos.forEach((todo) => {
    const haystack = [todo.title, todo.owner, todo.kind].join(" ").toLowerCase();
    if (haystack.includes(keyword)) {
      results.push({ id: `todo-${todo.id}`, title: todo.title, detail: `${formatDateLabel(todo.due)} · ${priorityLabel(todo.priority)}`, type: "待办", view: "Offer To Do" });
    }
  });

  return results.slice(0, 8);
}

function colorFromEventType(eventType: CalendarEventType | CalendarTodoKind) {
  if (eventType === "deadline") return "red";
  if (eventType === "written") return "indigo";
  if (eventType === "interview") return "purple";
  if (eventType === "offer") return "green";
  if (eventType === "follow") return "cyan";
  if (eventType === "thesis") return "indigo";
  if (eventType === "student_work" || eventType === "meeting") return "green";
  if (eventType === "study") return "purple";
  if (eventType === "personal") return "slate";
  return "slate";
}

function dateInRange(dateKey: string, start: Date, end: Date) {
  const parsed = new Date(`${dateKey.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= start && parsed <= end;
}

function buildApplicationEvents(applications: ApplicationRecord[]): CalendarEvent[] {
  return applications.flatMap((record) => {
    const events: CalendarEvent[] = [];
    const sourceFields = {
      sourceType: "application" as const,
      sourceId: record.id,
      linkedApplicationId: record.id,
    };

    if (record.nextDeadline) {
      events.push({
        id: `${record.id}-next`,
        title: `${record.company} · ${record.nextAction || record.role}`,
        date: record.nextDeadline.slice(0, 10),
        startTime: record.nextDeadline.slice(11, 16) || "09:00",
        category: "job_search",
        eventType: record.interview !== "未开始" ? "interview" : "follow",
        source: "我的秋招",
        ...sourceFields,
      });
    }
    if (record.offerDeadline) {
      events.push({
        id: `${record.id}-offer`,
        title: `${record.company} offer 决策`,
        date: record.offerDeadline,
        startTime: "18:00",
        category: "job_search",
        eventType: "offer",
        source: "Offer",
        ...sourceFields,
      });
    }
    if (record.applyDate) {
      events.push({
        id: `${record.id}-apply`,
        title: `${record.company} 已投递`,
        date: record.applyDate,
        startTime: "09:00",
        category: "job_search",
        eventType: "todo",
        source: record.channel,
        ...sourceFields,
      });
    }
    return events;
  });
}

function buildTodoEvents(todos: CalendarTodo[]): CalendarEvent[] {
  return todos.map((todo) => {
    const normalizedTodo = normalizeTodo(todo);
    return {
      id: `todo-${normalizedTodo.id}`,
      title: normalizedTodo.title,
      date: normalizedTodo.due,
      startTime: "09:00",
      category: categoryFromLegacyKind(normalizedTodo.kind),
      eventType: todoKindToEventType(normalizedTodo.kind),
      source: "Todo",
      sourceType: "todo",
      sourceId: normalizedTodo.id,
      linkedTodoId: normalizedTodo.id,
      description: `${priorityLabel(normalizedTodo.priority)} · ${normalizedTodo.done ? "已完成" : "未完成"} · ${normalizedTodo.owner}`,
    };
  });
}

function buildVisibleCalendarEvents({
  applications,
  customEvents,
  dismissedEventIds,
  todos,
}: {
  applications: ApplicationRecord[];
  customEvents: CalendarEvent[];
  dismissedEventIds: string[];
  todos: CalendarTodo[];
}) {
  const dismissedIds = new Set(dismissedEventIds);
  const normalizedCustomEvents = customEvents.map(normalizeCalendarEvent);
  const customEventIds = new Set(normalizedCustomEvents.map((event) => event.id));
  const generatedEvents = [
    ...seedCalendarEvents,
    ...buildApplicationEvents(applications),
    ...buildTodoEvents(todos),
  ].map(normalizeCalendarEvent);

  return [
    ...generatedEvents.filter((event) => !customEventIds.has(event.id)),
    ...normalizedCustomEvents,
  ].filter((event) => !dismissedIds.has(event.id));
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function getScheduleCategory(category: ScheduleCategoryValue) {
  return scheduleCategories.find((item) => item.value === category) || scheduleCategories[1];
}

function eventTypeLabel(eventType: CalendarEventType) {
  return eventTypeOptions.find((option) => option.value === eventType)?.label || "其他";
}

function normalizeCalendarEvent(event: Partial<CalendarEvent> & { kind?: CalendarTodoKind; time?: string }): CalendarEvent {
  const legacyKind = event.kind || "todo";
  const eventType = normalizeEventType(event.eventType || legacyKind);
  const category = normalizeCategory(event.category || categoryFromLegacyKind(legacyKind));
  const sourceType = normalizeSourceType(event.sourceType, event.source);

  return {
    id: event.id || `${event.title || "event"}-${event.date || Date.now()}`,
    title: event.title || "未命名日程",
    date: event.date || toDateKey(new Date()),
    startTime: event.startTime || event.time || "09:00",
    endTime: event.endTime || "",
    category,
    eventType,
    source: event.source,
    sourceType,
    sourceId: event.sourceId,
    linkedTodoId: event.linkedTodoId,
    linkedApplicationId: event.linkedApplicationId,
    location: event.location || "",
    description: event.description || "",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function normalizeSourceType(sourceType?: string, source?: string): CalendarSourceType {
  if (sourceType === "manual" || sourceType === "todo" || sourceType === "application" || sourceType === "system") {
    return sourceType;
  }
  if (source === "手动新建") return "manual";
  return "system";
}

function normalizeCategory(category: string): ScheduleCategoryValue {
  if (scheduleCategories.some((item) => item.value === category)) return category as ScheduleCategoryValue;
  return "job_search";
}

function normalizeEventType(eventType: string): CalendarEventType {
  if (eventTypeOptions.some((option) => option.value === eventType)) return eventType as CalendarEventType;
  return "other";
}

function eventHasLinkedSource(event: CalendarEvent) {
  return Boolean(
    (event.sourceType === "todo" && event.linkedTodoId) ||
    (event.sourceType === "application" && event.linkedApplicationId),
  );
}

function sourceTypeLabel(sourceType?: CalendarSourceType) {
  if (sourceType === "todo") return "Todo";
  if (sourceType === "application") return "求职流程";
  if (sourceType === "system") return "系统自动生成";
  return "手动创建";
}

function categoryFromLegacyKind(kind: CalendarTodoKind): ScheduleCategoryValue {
  if (kind === "student_work" || kind === "meeting") return "student_work";
  if (kind === "thesis") return "thesis";
  if (kind === "study") return "study";
  if (kind === "todo") return "personal";
  if (kind === "personal") return "personal";
  return "job_search";
}

function todoKindToEventType(kind: CalendarTodoKind): CalendarEventType {
  if (kind === "thesis") return "thesis";
  if (kind === "study") return "course";
  if (kind === "student_work" || kind === "meeting") return "meeting";
  if (kind === "personal") return "todo";
  return normalizeEventType(kind);
}

function calendarEventToDraft(event: CalendarEvent): CalendarEventDraft {
  return {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime || "",
    category: event.category,
    eventType: event.eventType,
    location: event.location || "",
    description: event.description || "",
  };
}

function calendarDraftsEqual(a: CalendarEventDraft, b: CalendarEventDraft) {
  return (
    a.title === b.title &&
    a.date === b.date &&
    a.startTime === b.startTime &&
    (a.endTime || "") === (b.endTime || "") &&
    a.category === b.category &&
    a.eventType === b.eventType &&
    (a.location || "") === (b.location || "") &&
    (a.description || "") === (b.description || "")
  );
}

function validateEventDraft(draft: CalendarEventDraft) {
  if (!draft.title.trim()) return "请先填写日程标题。";
  if (!draft.category) return "请选择所属领域。";
  if (!draft.eventType) return "请选择日程类型。";
  if (!draft.date) return "请选择日期。";
  if (!draft.startTime) return "请选择开始时间。";
  if (draft.endTime && draft.endTime <= draft.startTime) return "结束时间需要晚于开始时间。";
  return "";
}

function calendarDraftFromForm(form: HTMLFormElement, fallback: CalendarEventDraft): CalendarEventDraft {
  const formData = new FormData(form);
  const getValue = (key: string) => String(formData.get(key) || "");

  return {
    title: getValue("title") || fallback.title,
    date: getValue("date") || fallback.date,
    startTime: getValue("startTime") || fallback.startTime,
    endTime: getValue("endTime"),
    category: normalizeCategory(getValue("category") || fallback.category),
    eventType: normalizeEventType(getValue("eventType") || fallback.eventType),
    location: getValue("location"),
    description: getValue("description"),
  };
}

function sortCalendarEvents(events: CalendarEvent[]) {
  return events.slice().sort((a, b) => {
    const timeCompare = (a.startTime || "23:59").localeCompare(b.startTime || "23:59");
    if (timeCompare !== 0) return timeCompare;
    return a.title.localeCompare(b.title, "zh-Hans-CN");
  });
}

function readJsonStorage<T>(key: string, fallback: T, normalize?: (value: T) => T): T {
  if (typeof window === "undefined") return fallback;

  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved) as T;
    return normalize ? normalize(parsed) : parsed;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function safeWriteJsonStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function readLargeJsonStorage<T>(key: string, fallback: T, normalize?: (value: T) => T): Promise<T> {
  const fromIndexedDb = await readIndexedDbValue<T>(key);
  if (fromIndexedDb) return normalize ? normalize(fromIndexedDb) : fromIndexedDb;

  const fromLocalStorage = readJsonStorage(key, fallback, normalize);
  if (fromLocalStorage !== fallback) {
    await writeLargeJsonStorage(key, fromLocalStorage);
  }
  return fromLocalStorage;
}

async function writeLargeJsonStorage<T>(key: string, value: T) {
  const wroteToIndexedDb = await writeIndexedDbValue(key, value);
  if (wroteToIndexedDb && typeof window !== "undefined") {
    window.localStorage.removeItem(key);
    return;
  }

  safeWriteJsonStorage(key, value);
}

function openOfferCatDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = window.indexedDB.open(offerCatDatabaseName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(offerCatStoreName)) {
        database.createObjectStore(offerCatStoreName, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

async function readIndexedDbValue<T>(key: string): Promise<T | null> {
  const database = await openOfferCatDatabase();
  if (!database) return null;

  return new Promise((resolve) => {
    const transaction = database.transaction(offerCatStoreName, "readonly");
    const store = transaction.objectStore(offerCatStoreName);
    const request = store.get(key);

    request.onsuccess = () => resolve((request.result?.value as T | undefined) || null);
    request.onerror = () => resolve(null);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

async function writeIndexedDbValue<T>(key: string, value: T): Promise<boolean> {
  const database = await openOfferCatDatabase();
  if (!database) return false;

  return new Promise((resolve) => {
    const transaction = database.transaction(offerCatStoreName, "readwrite");
    const store = transaction.objectStore(offerCatStoreName);
    const request = store.put({ key, value });

    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

function normalizeTodo(todo: CalendarTodo): CalendarTodo {
  return {
    ...todo,
    kind: todoKindOptions.some((option) => option.value === todo.kind) ? todo.kind : "todo",
    priority: todo.priority || "P1",
    owner: todo.owner || "我",
  };
}

function blankTodoDraft(todayKey: string): Omit<CalendarTodo, "id" | "done"> {
  return {
    title: "",
    due: todayKey,
    kind: "todo",
    priority: "P1",
    owner: "我",
  };
}

function todoDraftsEqual(a: Omit<CalendarTodo, "id" | "done">, b: Omit<CalendarTodo, "id" | "done">) {
  return a.title === b.title && a.due === b.due && a.kind === b.kind && a.priority === b.priority && a.owner === b.owner;
}

function priorityLabel(priority: CalendarTodo["priority"]) {
  return {
    P0: "P0-高优",
    P1: "P1-重要",
    P2: "P2-普通",
    P3: "P3-低优",
  }[priority];
}

function priorityRank(priority: CalendarTodo["priority"]) {
  return {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
  }[priority];
}

const prepStatusOptions: Array<{ value: PrepItemStatus; label: string }> = [
  { value: "not_started", label: "待开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
];

function prepStatusLabel(status: PrepItemStatus) {
  return prepStatusOptions.find((option) => option.value === status)?.label || "待开始";
}

function extractNoteOutline(note: string) {
  return note
    .split("\n")
    .map((line, index) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
      if (!match) return null;
      return {
        id: `note-heading-${index}-${match[2].slice(0, 18)}`,
        level: match[1].length,
        line: index + 1,
        title: match[2].replace(/[#*_`[\]]/g, "").trim(),
      };
    })
    .filter((item): item is { id: string; level: number; line: number; title: string } => Boolean(item?.title));
}

function normalizeInterviewWorkspace(workspace: Partial<InterviewWorkspace>): InterviewWorkspace {
  const timestamp = workspace.updatedAt || workspace.createdAt || new Date().toISOString();
  const workspaceId = workspace.id || `prep-${workspace.applicationId || Date.now()}`;
  return {
    id: workspaceId,
    applicationId: workspace.applicationId || "",
    industry: workspace.industry || "互联网",
    roleCategory: workspace.roleCategory || "其他",
    noteContent: workspace.noteContent || "",
    items: (workspace.items || []).map((item, index) => normalizePreparationItem(item, workspaceId, index)),
    tasks: (workspace.tasks || []).map((task, index) => normalizeWorkspaceTask(task, workspaceId, index)),
    pinned: Boolean(workspace.pinned),
    createdAt: workspace.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizePreparationItem(item: Partial<PreparationItem>, workspaceId: string, index: number): PreparationItem {
  const timestamp = item.updatedAt || item.createdAt || new Date().toISOString();
  const status = item.status || (item.completed ? "completed" : "not_started");
  return {
    id: item.id || `${workspaceId}-item-${index}`,
    workspaceId,
    title: item.title || "未命名准备事项",
    type: normalizePrepItemType(item.type || inferPrepItemType(item.title || "")),
    status,
    completed: status === "completed" || Boolean(item.completed),
    dueAt: item.dueAt || "",
    scheduledAt: item.scheduledAt || "",
    syncToTodo: Boolean(item.syncToTodo),
    syncToCalendar: Boolean(item.syncToCalendar),
    linkedTodoId: item.linkedTodoId,
    linkedCalendarEventId: item.linkedCalendarEventId,
    sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : index,
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizeWorkspaceTask(task: Partial<WorkspaceTask>, workspaceId: string, index: number): WorkspaceTask {
  const timestamp = task.updatedAt || task.createdAt || new Date().toISOString();
  return {
    id: task.id || `${workspaceId}-task-${index}`,
    workspaceId,
    preparationItemId: task.preparationItemId,
    title: task.title || "未命名任务",
    scheduledAt: task.scheduledAt || `${dashboardTodayKey}T18:00`,
    completed: Boolean(task.completed),
    sortOrder: Number.isFinite(task.sortOrder) ? Number(task.sortOrder) : index,
    syncToTodo: Boolean(task.syncToTodo),
    syncToCalendar: Boolean(task.syncToCalendar),
    linkedTodoId: task.linkedTodoId,
    linkedCalendarEventId: task.linkedCalendarEventId,
    createdAt: task.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function createInterviewWorkspace(application: ApplicationRecord, events: CalendarEvent[]): InterviewWorkspace {
  const timestamp = new Date().toISOString();
  const workspaceId = `prep-${application.id || application.company || Date.now()}`;
  const nextEvent = findNextPrepEvent(application, events, dashboardTodayKey);
  const templates = buildPrepTemplates(application);
  const items = templates.items.map((item, index) => ({
    id: `${workspaceId}-item-${index}`,
    workspaceId,
    title: item.title,
    type: item.type,
    status: index < 2 ? "in_progress" as const : "not_started" as const,
    completed: false,
    dueAt: nextEvent?.date || "",
    scheduledAt: nextEvent ? `${nextEvent.date}T${nextEvent.startTime || "18:00"}` : "",
    syncToTodo: false,
    syncToCalendar: false,
    sortOrder: index,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
  const tasks = templates.tasks.map((task, index) => ({
    id: `${workspaceId}-task-${index}`,
    workspaceId,
    preparationItemId: items[index]?.id,
    title: task,
    scheduledAt: `${dashboardTodayKey}T${["09:30", "11:00", "15:00", "18:00"][index] || "18:00"}`,
    completed: false,
    sortOrder: index,
    syncToTodo: false,
    syncToCalendar: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return {
    id: workspaceId,
    applicationId: application.id,
    industry: normalizePrepIndustry(application),
    roleCategory: inferRoleCategory(application),
    noteContent: templates.note,
    items,
    tasks,
    pinned: application.priority === "P0",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function buildPrepTemplates(application: ApplicationRecord): {
  items: Array<{ title: string; type: PrepItemType }>;
  note: string;
  tasks: string[];
} {
  const industry = normalizePrepIndustry(application);
  const roleCategory = inferRoleCategory(application);
  const isStateOwned = industry === "央国企";
  const isAiProduct = /AI|人工智能|大模型|算法|机器人/.test([application.industry, application.direction, application.role, application.jd].join(" "));
  const baseItems: Array<{ title: string; type: PrepItemType }> = [
    { title: "拆解 JD 关键词", type: "research" },
    { title: "准备 1 分钟自我介绍", type: "interview" },
    { title: "整理 3 个 STAR 案例", type: "material" },
    { title: "准备反问问题", type: "interview" },
    { title: "过往项目复盘", type: "review" },
  ];
  const extraItems = isStateOwned
    ? [
        { title: "刷 20 道行测题", type: "written_test" as const },
        { title: "整理结构化面试素材", type: "interview" as const },
        { title: "补充近期政策与单位动态", type: "research" as const },
      ]
    : isAiProduct
      ? [
          { title: "梳理 AI 产品理解与模型边界", type: "research" as const },
          { title: "准备 AI 产品设计题", type: "interview" as const },
          { title: "整理竞品与商业化案例", type: "material" as const },
        ]
      : [
          { title: `${roleCategory}专项练习`, type: roleCategory === "技术" ? "written_test" as const : "interview" as const },
          { title: "行业分析与竞品梳理", type: "research" as const },
          { title: "补充业务和产品矩阵", type: "material" as const },
        ];
  const focus = buildPrepFocusTags(application).join("、");
  const note = isStateOwned
    ? `单位概况\n- 单位性质：${application.companyType || "待补充"}\n- 核心业务：${application.industry || "待补充"}\n- 发展战略：待补充\n\n岗位理解\n- 统筹协调\n- 文字综合\n- 沟通执行\n- 服务业务\n\n答题提醒\n- 政治素养\n- 责任担当\n- 逻辑清晰\n- 结合岗位实际\n\n我的案例素材\n- 项目背景：\n- 我的任务：\n- 关键行动：\n- 最终结果：`
    : `公司信息\n- 公司业务：${application.industry || "待补充"}\n- 产品矩阵：待补充\n- 近期动态：待补充\n- 竞争对手：待补充\n\n岗位理解\n- 岗位职责：${application.direction || application.role || "待补充"}\n- 核心能力：${focus || "待补充"}\n- JD 关键词：\n- 与个人经历的匹配点：\n\n答题提醒\n- 结论先行\n- 分点展开\n- 用数据说明结果\n- 从用户与业务视角回答\n\n我的案例素材\n- 项目背景：\n- 我的任务：\n- 关键行动：\n- 最终结果：`;

  return {
    items: [...baseItems, ...extraItems],
    note,
    tasks: ["复习岗位常见题", "整理 STAR 案例素材", "准备面试反问问题", "复盘 JD 与项目匹配点"],
  };
}

function normalizePrepIndustry(application: ApplicationRecord) {
  const text = [application.companyType, application.industry, application.company, application.role, application.jd].join(" ");
  if (/央企|国企|事业单位|国家电网|银行|政策|公基|行测/.test(text)) return "央国企";
  if (/外企|跨国|Microsoft|Google|Amazon|Apple|IBM|Oracle|SAP/.test(text)) return "外企";
  if (/AI|人工智能|大模型|算法|机器人|自动驾驶|智能/.test(text)) return "AI / 机器人";
  if (/品牌|消费|内容|小红书|运营|市场/.test(text)) return "品牌方";
  if (/互联网|软件|云|平台|电商|游戏|产品/.test(text)) return "互联网";
  return "其他";
}

function inferRoleCategory(application: ApplicationRecord) {
  const text = [application.role, application.direction, application.jd].join(" ");
  if (/产品|PM|Product/i.test(text)) return "产品";
  if (/运营|增长|用户|内容/.test(text)) return "运营";
  if (/综合|管培|管理|职能|人力|行政|财务/.test(text)) return "综合管理";
  if (/市场|品牌|营销|商务/.test(text)) return "市场";
  if (/工程师|开发|算法|测试|前端|后端|Java|Python|C\+\+|Go/.test(text)) return "技术";
  if (/设计|UI|UX|交互/.test(text)) return "设计";
  return "其他";
}

function buildPrepFocusTags(application: ApplicationRecord) {
  const industry = normalizePrepIndustry(application);
  const roleCategory = inferRoleCategory(application);
  if (industry === "央国企") return ["行测", "申论", "公基", "时政", "结构化面试"];
  if (/AI|人工智能|大模型|算法/.test([application.industry, application.direction, application.role, application.jd].join(" "))) {
    return ["AI 产品理解", "模型能力边界", "用户场景", "竞品分析", "商业化"];
  }
  if (roleCategory === "产品") return ["产品设计", "业务分析", "用户洞察", "数据分析", "竞品研究"];
  if (roleCategory === "技术") return ["基础算法", "项目复盘", "系统设计", "代码能力", "技术表达"];
  if (roleCategory === "运营") return ["用户增长", "内容策略", "活动复盘", "数据分析", "业务理解"];
  return ["自我介绍", "STAR 案例", "岗位理解", "反问问题", "复盘记录"];
}

function normalizePrepItemType(type: string): PrepItemType {
  if (type === "written_test" || type === "interview" || type === "research" || type === "material" || type === "review" || type === "other") {
    return type;
  }
  return "other";
}

function inferPrepItemType(title: string): PrepItemType {
  if (/行测|笔试|测评|算法|刷题/.test(title)) return "written_test";
  if (/面试|自我介绍|反问|结构化/.test(title)) return "interview";
  if (/公司|行业|竞品|JD|业务|动态/.test(title)) return "research";
  if (/素材|案例|STAR|简历/.test(title)) return "material";
  if (/复盘|总结/.test(title)) return "review";
  return "other";
}

function calculateWorkspaceProgress(workspace: InterviewWorkspace) {
  if (workspace.items.length === 0) return 0;
  const score = workspace.items.reduce((total, item) => {
    if (item.completed || item.status === "completed") return total + 1;
    if (item.status === "in_progress") return total + 0.45;
    return total;
  }, 0);
  return Math.round((score / workspace.items.length) * 100);
}

function calculateTypeProgress(workspace: InterviewWorkspace, type: PrepItemType) {
  const items = workspace.items.filter((item) => item.type === type);
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.completed || item.status === "completed").length / items.length) * 100);
}

function isPrepEvent(event: CalendarEvent) {
  return event.eventType === "written" || event.eventType === "interview" || /笔试|面试|测评/.test(event.title);
}

function findNextPrepEvent(application: ApplicationRecord, events: CalendarEvent[], todayKey: string) {
  const company = application.company.toLowerCase();
  const role = application.role.toLowerCase();
  return sortCalendarEvents(
    events.filter((event) => {
      const text = `${event.title} ${event.description || ""}`.toLowerCase();
      return event.date >= todayKey && isPrepEvent(event) && (text.includes(company) || (role && text.includes(role)));
    }),
  )[0];
}

function prepPriorityScore(application: ApplicationRecord, workspace: InterviewWorkspace, nextEvent: CalendarEvent | undefined, todayKey: string) {
  const progress = calculateWorkspaceProgress(workspace);
  const dayMs = 24 * 60 * 60 * 1000;
  const days = nextEvent
    ? Math.max(0, Math.round((new Date(`${nextEvent.date}T00:00:00`).getTime() - new Date(`${todayKey}T00:00:00`).getTime()) / dayMs))
    : 99;
  const urgency = days <= 2 ? 48 : days <= 7 ? 30 : days <= 14 ? 14 : 0;
  const intent = application.priority === "P0" ? 24 : application.priority === "P1" ? 16 : 8;
  return urgency + intent + Math.max(0, 32 - progress / 3);
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function reorderByIds<T extends { id: string }>(items: T[], sourceId: string, targetId: string) {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return items;
  const next = items.slice();
  const [source] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, source);
  return next;
}

function formatClock(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const jobImportFieldConfig = [
  { key: "company", label: "企业名称", required: true, aliases: ["公司", "企业名称", "公司名称", "单位", "招聘单位"] },
  { key: "companyType", label: "企业类型", aliases: ["企业类型", "公司类型", "企业性质", "单位性质"] },
  { key: "industry", label: "所属行业", aliases: ["行业类别", "所属行业", "行业", "公司行业", "领域"] },
  { key: "updatedAt", label: "更新日期", aliases: ["更新时间", "更新日期", "最近进度日期"] },
  { key: "batch", label: "招聘类型", aliases: ["批次（暑期实习）", "批次暑期实习", "招聘类型", "批次", "岗位类型"] },
  { key: "recruitTarget", label: "招聘届次", aliases: ["招聘届次", "届次要求", "面向届次", "年级"] },
  { key: "city", label: "工作城市", aliases: ["工作地点", "工作城市", "城市", "base地", "base", "工作地"] },
  { key: "title", label: "岗位列表", required: true, aliases: ["招聘岗位", "岗位列表", "岗位", "职位", "职位名称", "岗位名称"] },
  { key: "startDate", label: "开始日期", aliases: ["开始时间", "开始日期", "开放时间"] },
  { key: "deadline", label: "截止日期", aliases: ["截止时间", "截止日期", "网申截止", "招聘截止时间", "deadline"] },
  { key: "applyUrl", label: "投递地址", aliases: ["简历投递链接", "投递地址", "投递链接", "网申链接", "申请链接"] },
  { key: "announcementUrl", label: "公告地址", aliases: ["公告链接", "公告地址", "原文链接"] },
  { key: "examRequired", label: "是否笔试", aliases: ["是否笔试", "是否笔试1", "笔试", "测评"] },
  { key: "source", label: "公告来源", aliases: ["公告来源", "信息来源", "来源"] },
  { key: "description", label: "备注", aliases: ["备注", "补充说明", "信息备注"] },
  { key: "majorRequirement", label: "专业要求", aliases: ["专业要求", "专业", "适配专业"] },
  { key: "education", label: "学历要求", aliases: ["学历要求", "学历"] },
] as const;

type JobImportFieldKey = (typeof jobImportFieldConfig)[number]["key"];
type JobImportMapping = Record<JobImportFieldKey, number>;
type SpreadsheetCell = string | number | boolean | Date | null | undefined;

function normalizeJob(job: Partial<Job>, index = 0): Job {
  const timestamp = new Date().toISOString().slice(0, 10);
  const company = cleanImportText(job.company) || "未命名公司";
  const title = cleanImportText(job.title) || "未命名岗位";
  const batch = job.batch === "实习" ? "实习" : "校招";
  return {
    id: job.id || `job-${normalizeDuplicateText(company)}-${normalizeDuplicateText(title)}-${index}-${Date.now()}`,
    company,
    title,
    industry: cleanImportText(job.industry) || "待确认",
    city: cleanImportText(job.city) || "待确认",
    deadline: cleanImportText(job.deadline) || "待确认",
    applyUrl: cleanImportText(job.applyUrl) || cleanImportText(job.announcementUrl),
    batch,
    companyType: cleanImportText(job.companyType) || "待确认",
    education: cleanImportText(job.education) || cleanImportText(job.recruitTarget) || "本科及以上",
    status: job.status || "待投递",
    tags: Array.from(new Set((job.tags || []).map(cleanImportText).filter(Boolean))).slice(0, 10),
    updatedAt: cleanImportText(job.updatedAt) || timestamp,
    description: cleanImportText(job.description),
    announcementUrl: cleanImportText(job.announcementUrl),
    examRequired: cleanImportText(job.examRequired),
    majorRequirement: cleanImportText(job.majorRequirement),
    recruitTarget: cleanImportText(job.recruitTarget),
    source: cleanImportText(job.source),
    startDate: cleanImportText(job.startDate),
  };
}

function countDuplicateJobs(jobs: Job[]) {
  const seen = new Set<string>();
  return jobs.reduce((count, job) => {
    const key = getJobDuplicateKey(job);
    if (seen.has(key)) return count + 1;
    seen.add(key);
    return count;
  }, 0);
}

function getJobDuplicateKey(job: Pick<Job, "company" | "title" | "applyUrl" | "city" | "deadline">) {
  const company = normalizeDuplicateText(job.company);
  const title = normalizeDuplicateText(job.title);
  const applyUrl = normalizeDuplicateUrl(job.applyUrl);
  if (applyUrl) return `${company}|${title}|${applyUrl}`;
  return `${company}|${title}|${normalizeDuplicateText(job.city)}|${normalizeDuplicateText(job.deadline)}`;
}

async function parseJobImportFile(file: File, existingJobs: Job[]): Promise<JobImportPreview> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: false,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("没有读取到工作表，请确认文件内容。");

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<SpreadsheetCell[]>(sheet, { header: 1, defval: "", blankrows: false });
  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex < 0) throw new Error("没有识别到有效表头，请确认表格包含公司、岗位等字段。");

  const headers = rows[headerRowIndex].map((cell) => cleanImportText(spreadsheetValueToText(cell)));
  const mapping = buildImportMapping(headers);
  const fieldMatches = jobImportFieldConfig.map((field) => {
    const columnIndex = mapping[field.key];
    const sample = rows
      .slice(headerRowIndex + 1, headerRowIndex + 10)
      .map((row) => cleanImportText(spreadsheetValueToText(row[columnIndex])))
      .find(Boolean) || "";
    const isRequired = "required" in field && field.required;
    return {
      label: field.label,
      matchedHeader: columnIndex >= 0 ? headers[columnIndex] : "",
      required: Boolean(isRequired),
      sample,
    };
  });

  const missingRequired = fieldMatches.filter((field) => field.required && !field.matchedHeader);
  if (missingRequired.length > 0) {
    throw new Error(`缺少必填字段：${missingRequired.map((field) => field.label).join("、")}。`);
  }

  const existingKeys = new Set(existingJobs.map(getJobDuplicateKey));
  const fileKeys = new Set<string>();
  const uniqueJobs: Job[] = [];
  const duplicates: Job[] = [];
  const errors: string[] = [];
  const dataRows = rows.slice(headerRowIndex + 1);
  let skippedRows = 0;

  dataRows.forEach((row, index) => {
    const rowHasValue = row.some((cell) => cleanImportText(spreadsheetValueToText(cell)));
    const job = buildImportedJob(row, mapping, index);
    if (!job) {
      if (rowHasValue) {
        skippedRows += 1;
      }
      return;
    }

    if (!isTarget2027AutumnRecruitment(job)) {
      skippedRows += 1;
      return;
    }

    if (!job.company || !job.title) {
      if (rowHasValue) {
        errors.push(`第 ${headerRowIndex + index + 2} 行缺少企业名称或岗位，已跳过。`);
      }
      return;
    }

    const key = getJobDuplicateKey(job);
    if (existingKeys.has(key) || fileKeys.has(key)) {
      duplicates.push(job);
      return;
    }

    fileKeys.add(key);
    uniqueJobs.push(job);
  });

  return {
    duplicates,
    errors,
    fileName: file.name,
    fieldMatches,
    importedAt: new Date().toISOString(),
    rows: dataRows.length,
    skippedRows,
    uniqueJobs,
  };
}

function findHeaderRowIndex(rows: SpreadsheetCell[][]) {
  let bestIndex = -1;
  let bestScore = 0;
  rows.slice(0, 12).forEach((row, index) => {
    const normalizedHeaders = row.map((cell) => normalizeImportHeader(spreadsheetValueToText(cell)));
    const score = jobImportFieldConfig.reduce((total, field) => {
      return total + (field.aliases.some((alias) => normalizedHeaders.includes(normalizeImportHeader(alias))) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestScore >= 2 ? bestIndex : -1;
}

function buildImportMapping(headers: string[]): JobImportMapping {
  const normalizedHeaders = headers.map(normalizeImportHeader);
  return jobImportFieldConfig.reduce((mapping, field) => {
    const index = field.aliases.findIndex((alias) => normalizedHeaders.includes(normalizeImportHeader(alias)));
    const headerIndex = index >= 0 ? normalizedHeaders.indexOf(normalizeImportHeader(field.aliases[index])) : -1;
    return { ...mapping, [field.key]: headerIndex };
  }, {} as JobImportMapping);
}

function buildImportedJob(row: SpreadsheetCell[], mapping: JobImportMapping, index: number): Job | null {
  const read = (key: JobImportFieldKey) => {
    const columnIndex = mapping[key];
    return columnIndex >= 0 ? cleanImportText(spreadsheetValueToText(row[columnIndex])) : "";
  };

  const company = read("company");
  const title = read("title");
  if (!company || !title || isInstructionImportRow(company, title)) return null;

  const startDate = normalizeSpreadsheetDate(read("startDate"));
  const deadline = normalizeSpreadsheetDate(read("deadline")) || read("deadline") || "招满为止";
  const updatedAt = normalizeSpreadsheetDate(read("updatedAt")) || read("updatedAt") || new Date().toISOString().slice(0, 10);
  const applyUrl = read("applyUrl");
  const announcementUrl = read("announcementUrl");
  const industry = read("industry");
  const companyType = read("companyType");
  const recruitTarget = read("recruitTarget");
  const majorRequirement = read("majorRequirement");
  const examRequired = read("examRequired");
  const source = read("source");
  const description = [read("description"), majorRequirement && `专业要求：${majorRequirement}`, source && `公告来源：${source}`, examRequired && `是否笔试：${examRequired}`]
    .filter(Boolean)
    .join("；");
  const batch = normalizeImportBatch(read("batch") || recruitTarget);
  const idBase = [company, title, read("city"), applyUrl || announcementUrl || deadline].map(normalizeDuplicateText).filter(Boolean).join("-");

  return normalizeJob(
    {
      id: `import-${idBase || index}`,
      company,
      title,
      industry,
      city: read("city"),
      deadline,
      applyUrl: applyUrl || announcementUrl,
      announcementUrl,
      batch,
      companyType,
      education: read("education") || recruitTarget,
      status: "待投递",
      tags: splitImportTags(companyType, industry, batch, recruitTarget, examRequired, majorRequirement),
      updatedAt,
      description,
      examRequired,
      majorRequirement,
      recruitTarget,
      source,
      startDate,
    },
    index,
  );
}

function isInstructionImportRow(company: string, title: string) {
  const text = `${company} ${title}`;
  return /使用说明|获取校招|补充表格|飞书云文档|复制|教程|免责声明/.test(text);
}

function normalizeImportBatch(value: string): Job["batch"] {
  if (/实习|提前批|暑期/.test(value)) return "实习";
  return "校招";
}

function isTarget2027AutumnRecruitment(job: Job) {
  const text = [
    job.company,
    job.title,
    job.batch,
    job.education,
    job.recruitTarget,
    job.description,
    job.tags.join(" "),
  ].join(" ");
  const is2027 = /2027|27届|二七届|廿七届/.test(text);
  const isSpring = /春招|2026届|26届/.test(text) && !/2027|27届/.test(text);
  const isTargetBatch = /暑期|实习|秋招|校招|提前批|正式批|补录|应届/.test(text);
  return is2027 && isTargetBatch && !isSpring;
}

function sortJobs(jobs: Job[], sort: string) {
  const sorted = jobs.slice();
  if (sort === "companyTypeThenUpdate") {
    return sorted.sort((a, b) => {
      const typeCompare = a.companyType.localeCompare(b.companyType, "zh-Hans-CN");
      if (typeCompare !== 0) return typeCompare;
      return compareJobDateDesc(a.updatedAt, b.updatedAt);
    });
  }
  if (sort === "deadlineAsc") {
    return sorted.sort((a, b) => compareJobDateAsc(a.deadline, b.deadline));
  }
  return sorted.sort((a, b) => compareJobDateDesc(a.updatedAt, b.updatedAt));
}

function compareJobDateDesc(a: string, b: string) {
  return jobDateSortValue(b) - jobDateSortValue(a);
}

function compareJobDateAsc(a: string, b: string) {
  return jobDateSortValue(a, Number.MAX_SAFE_INTEGER) - jobDateSortValue(b, Number.MAX_SAFE_INTEGER);
}

function jobDateSortValue(value: string, fallback = 0) {
  const normalized = normalizeSpreadsheetDate(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return fallback;
  return new Date(`${normalized}T00:00:00`).getTime();
}

function applicationDraftFromJob(job: Job): ApplicationRecord {
  const deadline = normalizeSpreadsheetDate(job.deadline);
  const city = cleanImportText(job.city);
  const tags = job.tags.filter((tag) => !["校招", "实习", "2027届", "官网巡检"].includes(tag));
  const examRequired = cleanImportText(job.examRequired);
  const majorRequirement = cleanImportText(job.majorRequirement);
  const notes = [
    job.description,
    job.companyType && `企业类型：${job.companyType}`,
    majorRequirement && `专业要求：${majorRequirement}`,
    examRequired && `是否笔试：${examRequired}`,
    job.startDate && `开始时间：${job.startDate}`,
    job.deadline && `截止时间：${job.deadline}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...blankApplication,
    id: "",
    company: job.company,
    role: job.title,
    direction: tags[0] || inferRoleCategoryFromJob(job),
    companyType: normalizeApplicationCompanyType(job.companyType),
    industry: job.industry,
    location: city,
    recruitType: normalizeApplicationRecruitType(job),
    channel: job.applyUrl ? "官网" : job.source || "信息源",
    applyDate: "",
    status: "准备投递",
    progress: "已从信息源加入流程，待补充投递信息",
    nextAction: "完善投递信息并提交申请",
    nextDeadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? `${deadline}T23:59` : "",
    needsFollowUp: "是",
    baseCity: city.split(/[、,，/]/)[0] || "",
    source: job.source || "求职信息源导入",
    sourceJobId: job.id,
    applyUrl: job.applyUrl || job.announcementUrl || "",
    jd: job.description,
    assessment: examRequired.includes("测评") ? "进行中" : "未开始",
    writtenTest: /是|笔试|测评/.test(examRequired) ? "未开始" : "未开始",
    notes,
  };
}

function normalizeApplicationCompanyType(companyType: string) {
  if (/央|国企|事业/.test(companyType)) return "央国企";
  if (/外企|跨国/.test(companyType)) return "外企";
  if (/高校|科研/.test(companyType)) return "高校/科研";
  if (/民营|私企|互联网/.test(companyType)) return "民营企业";
  return companyType || "其他";
}

function normalizeApplicationRecruitType(job: Job) {
  const text = [job.batch, job.recruitTarget, job.education, job.tags.join(" "), job.title].join(" ");
  if (/暑期/.test(text)) return "暑期实习";
  if (/实习|提前批/.test(text)) return "实习提前批";
  if (/补录/.test(text)) return "补录";
  return "2027届秋招";
}

function inferRoleCategoryFromJob(job: Job) {
  const text = [job.title, job.industry, job.tags.join(" ")].join(" ");
  if (/产品|PM|Product/i.test(text)) return "产品/项目";
  if (/算法|开发|工程师|后端|前端|测试|软件|硬件|芯片|Java|Python|C\+\+|Go/.test(text)) return "技术研发";
  if (/运营|增长|内容|用户/.test(text)) return "运营";
  if (/市场|品牌|商务|销售/.test(text)) return "市场/商业";
  if (/管培|综合|职能|人力|财务|行政/.test(text)) return "综合管理";
  return job.industry || "待确认";
}

function splitImportTags(...values: string[]) {
  return Array.from(
    new Set(
      values
        .join(" / ")
        .split(/[、,，/|；;\s]+/)
        .map(cleanImportText)
        .filter((item) => item && item.length <= 16),
    ),
  ).slice(0, 8);
}

function spreadsheetValueToText(value: SpreadsheetCell) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return toDateKey(value);
  return String(value).replace(/\r?\n/g, " ").trim();
}

function normalizeSpreadsheetDate(value: SpreadsheetCell) {
  if (value === null || value === undefined || value === "") return "";
  if (value instanceof Date) return toDateKey(value);
  if (typeof value === "number" && value > 30000 && value < 70000) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
    }
  }

  const text = cleanImportText(spreadsheetValueToText(value));
  const dateMatch = text.match(/(20\d{2})[./年-]\s*(\d{1,2})[./月-]\s*(\d{1,2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
  }
  const shortMatch = text.match(/(\d{1,2})[./月-]\s*(\d{1,2})/);
  if (shortMatch) {
    return `2026-${shortMatch[1].padStart(2, "0")}-${shortMatch[2].padStart(2, "0")}`;
  }
  if (/招满|尽快|待定|长期|不限|滚动/.test(text)) return text;
  return text;
}

function cleanImportText(value: SpreadsheetCell) {
  return spreadsheetValueToText(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImportHeader(value: string) {
  return cleanImportText(value)
    .replace(/\(\d+\)$/g, "")
    .replace(/[（）()[\]\s:_：-]/g, "")
    .toLowerCase();
}

function normalizeDuplicateText(value: string) {
  return cleanImportText(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/g, "")
    .replace(/[（）()[\]\s:_：\-—/|、,，.。]/g, "")
    .toLowerCase();
}

function normalizeDuplicateUrl(value: string) {
  return cleanImportText(value)
    .replace(/^https?:\/\//i, "")
    .replace(/[?#].*$/g, "")
    .replace(/\/$/g, "")
    .toLowerCase();
}

function distanceLabel(due: string, today: string) {
  const dayMs = 24 * 60 * 60 * 1000;
  const diff = Math.round((new Date(`${due}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / dayMs);
  if (diff < 0) return `已延期 ${Math.abs(diff)} 天`;
  if (diff === 0) return "今天截止";
  return `还有 ${diff} 天`;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function JobImportPanel({
  existingJobs,
  onDedupeExisting,
  onImport,
}: {
  existingJobs: Job[];
  onDedupeExisting: () => void;
  onImport: (preview: JobImportPreview) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<JobImportPreview | null>(null);
  const [message, setMessage] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const currentDuplicateCount = useMemo(() => countDuplicateJobs(existingJobs), [existingJobs]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setIsParsing(true);
    setMessage("");
    try {
      const nextPreview = await parseJobImportFile(file, existingJobs);
      setPreview(nextPreview);
      setMessage(
        `已读取 ${nextPreview.rows} 行，按 2027 届暑期实习 / 秋招筛选后可新增 ${nextPreview.uniqueJobs.length} 条，重复 ${nextPreview.duplicates.length} 条，跳过非目标记录 ${nextPreview.skippedRows} 条。`,
      );
    } catch (error) {
      setPreview(null);
      setMessage(error instanceof Error ? error.message : "文件解析失败，请检查表头和文件格式。");
    } finally {
      setIsParsing(false);
    }
  }

  function confirmImport() {
    if (!preview) return;
    onImport(preview);
    setMessage(`导入完成：新增 ${preview.uniqueJobs.length} 条，跳过重复 ${preview.duplicates.length} 条。`);
    setPreview(null);
  }

  return (
    <section className="job-import-panel">
      <div className="job-import-main">
        <div>
          <span>Import center</span>
          <h3>导入 CSV / Excel 岗位表</h3>
          <p>按 27 届汇总表字段自动识别：公司、企业类型、行业、批次、城市、岗位、时间、投递链接、公告来源等。</p>
        </div>
        <div className="job-import-actions">
          <input
            accept=".csv,.xls,.xlsx"
            aria-label="导入岗位表格"
            hidden
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
          />
          <button className="job-import-primary" onClick={() => inputRef.current?.click()} type="button">
            <Upload aria-hidden="true" />
            {isParsing ? "识别中" : "导入表格"}
          </button>
          <button disabled={currentDuplicateCount === 0} onClick={onDedupeExisting} type="button">
            清理当前重复 {currentDuplicateCount > 0 ? currentDuplicateCount : ""}
          </button>
        </div>
      </div>

      {message && <p className="job-import-message">{message}</p>}

      {preview && (
        <div className="job-import-preview">
          <div className="job-import-stats">
            <span><strong>{preview.rows}</strong>读取行数</span>
            <span><strong>{preview.uniqueJobs.length}</strong>可新增</span>
            <span><strong>{preview.duplicates.length}</strong>重复跳过</span>
            <span><strong>{preview.skippedRows}</strong>非 2027 跳过</span>
          </div>

          <div className="job-field-map">
            {preview.fieldMatches.map((field) => (
              <article className={field.required && !field.matchedHeader ? "is-missing" : ""} key={field.label}>
                <small>{field.required ? "必填字段" : "识别字段"}</small>
                <strong>{field.label}</strong>
                <span>{field.matchedHeader || "未识别"}</span>
                {field.sample && <em>{field.sample}</em>}
              </article>
            ))}
          </div>

          {preview.uniqueJobs.length > 0 && (
            <div className="job-import-sample">
              <strong>新增预览</strong>
              {preview.uniqueJobs.slice(0, 5).map((job) => (
                <span key={job.id}>{job.company} / {job.title} / {job.city || "地点待确认"}</span>
              ))}
            </div>
          )}

          {preview.errors.length > 0 && (
            <div className="job-import-errors">
              <strong>异常行</strong>
              {preview.errors.slice(0, 4).map((error) => <span key={error}>{error}</span>)}
            </div>
          )}

          <div className="job-import-confirm">
            <button onClick={() => setPreview(null)} type="button">取消</button>
            <button disabled={preview.uniqueJobs.length === 0} onClick={confirmImport} type="button">
              确认导入新增岗位
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function JobsTable({
  jobs,
  onEditJob,
  onKeepJobs,
  onMarkJobsUnsuitable,
  onRemoveJobs,
  onStartApplication,
  onStatusChange,
}: {
  jobs: Job[];
  onEditJob: (jobId: string) => void;
  onKeepJobs: (jobIds: string[]) => void;
  onMarkJobsUnsuitable: (jobIds: string[]) => void;
  onRemoveJobs: (jobIds: string[]) => void;
  onStartApplication: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteJobIds, setDeleteJobIds] = useState<string[] | null>(null);
  const visibleJobIds = useMemo(() => new Set(jobs.map((job) => job.id)), [jobs]);
  const visibleSelectedIds = selectedIds.filter((id) => visibleJobIds.has(id));
  const allSelected = jobs.length > 0 && visibleSelectedIds.length === jobs.length;
  const selectedCount = visibleSelectedIds.length;

  function toggleAllJobs(checked: boolean) {
    setSelectedIds(checked ? jobs.map((job) => job.id) : []);
  }

  function toggleJob(jobId: string, checked: boolean) {
    setSelectedIds((current) => (checked ? Array.from(new Set([...current, jobId])) : current.filter((id) => id !== jobId)));
  }

  function keepSelectedJobs() {
    onKeepJobs(visibleSelectedIds);
    setSelectedIds([]);
  }

  function markSelectedUnsuitable() {
    onMarkJobsUnsuitable(visibleSelectedIds);
    setSelectedIds([]);
  }

  function restoreSelectedJobs() {
    visibleSelectedIds.forEach((id) => onStatusChange(id, "待投递"));
    setSelectedIds([]);
  }

  function confirmDeleteJobs() {
    if (!deleteJobIds?.length) return;
    onRemoveJobs(deleteJobIds);
    setSelectedIds((current) => current.filter((id) => !deleteJobIds.includes(id)));
    setDeleteJobIds(null);
  }

  return (
    <section className="table-panel">
      <div className="table-meta">
        <span>共 {jobs.length} 个岗位</span>
        <span>默认按最近更新排序</span>
      </div>
      {selectedCount > 0 && (
        <div className="table-bulk-bar" role="region" aria-label="批量操作">
          <strong>已选择 {selectedCount} 项</strong>
          <div>
            <button onClick={keepSelectedJobs} type="button">保留</button>
            <button onClick={markSelectedUnsuitable} type="button">标为不合适</button>
            <button onClick={restoreSelectedJobs} type="button">恢复到原列表</button>
            <button className="danger-button" onClick={() => setDeleteJobIds(visibleSelectedIds)} type="button">删除</button>
            <button onClick={() => setSelectedIds([])} type="button">取消选择</button>
          </div>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="selection-column">
                <input
                  aria-label="全选岗位"
                  checked={allSelected}
                  onChange={(event) => toggleAllJobs(event.currentTarget.checked)}
                  type="checkbox"
                />
              </th>
              <th>公司与岗位</th>
              <th>状态</th>
              <th>企业类型 / 行业</th>
              <th>官网链接</th>
              <th>投递</th>
              <th>兴趣库</th>
              <th>适配</th>
              <th>编辑</th>
              <th>删除</th>
              <th>招聘截止时间</th>
              <th>更新时间</th>
              <th>工作地点</th>
              <th>职位标签</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="selection-column">
                  <input
                    aria-label={`选择 ${job.company} ${job.title}`}
                    checked={selectedIds.includes(job.id)}
                    onChange={(event) => toggleJob(job.id, event.currentTarget.checked)}
                    type="checkbox"
                  />
                </td>
                <td>
                  <div className="company-cell">
                    <span>{job.company.slice(0, 1)}</span>
                    <div>
                      <strong>{job.company}</strong>
                      <p>{job.title} · {job.industry}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`job-status-pill job-status-pill--${job.status}`}>{job.status}</span>
                </td>
                <td>
                  <div className="job-kind-cell">
                    <strong>{job.companyType || "待确认"}</strong>
                    <span>{job.industry || "行业待确认"}</span>
                  </div>
                </td>
                <td>
                  {job.applyUrl ? (
                    <a className="job-table-action" href={job.applyUrl} rel="noreferrer" target="_blank">打开</a>
                  ) : (
                    <span className="job-table-muted">暂无</span>
                  )}
                </td>
                <td>
                  <button className="job-table-action" onClick={() => onStartApplication(job.id)} type="button">加入流程</button>
                </td>
                <td>
                  <button className="job-table-action" onClick={() => onStatusChange(job.id, "收藏中")} type="button">收藏</button>
                </td>
                <td>
                  {job.status === "不合适" ? (
                    <button className="job-table-action job-table-action--restore" onClick={() => onStatusChange(job.id, "待投递")} type="button">
                      恢复到原列表
                    </button>
                  ) : (
                    <button className="job-table-action job-table-action--quiet" onClick={() => onStatusChange(job.id, "不合适")} type="button">
                      不合适
                    </button>
                  )}
                </td>
                <td>
                  <button className="job-table-action" onClick={() => onEditJob(job.id)} type="button">编辑</button>
                </td>
                <td>
                  <button className="job-table-action job-table-action--danger" onClick={() => setDeleteJobIds([job.id])} type="button">删除</button>
                </td>
                <td className={job.deadline.includes("截止") || job.deadline.includes("招满") ? "deadline table-nowrap" : "table-nowrap"}>
                  {job.deadline}
                </td>
                <td className="table-nowrap">{job.updatedAt}</td>
                <td>
                  <div className="cities">
                    {job.city.split(/[、,，/]/).slice(0, 5).map((item) => <span key={item}>{item}</span>)}
                  </div>
                </td>
                <td>
                  <div className="tags">
                    {job.tags.slice(0, 7).map((item) => <span key={item}>{item}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteJobIds && (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="确认删除"
          danger
          message={`确定删除${deleteJobIds.length > 1 ? `选中的 ${deleteJobIds.length} 条` : "该条"}岗位记录吗？删除后无法恢复。`}
          onCancel={() => setDeleteJobIds(null)}
          onConfirm={confirmDeleteJobs}
          title="删除岗位记录"
        />
      )}
    </section>
  );
}

function OfferTrackingPage({
  filter,
  form,
  formMessage,
  isEditing,
  onChange,
  onClearFilter,
  onEdit,
  onFilterChange,
  onRemove,
  onResetForm,
  onSubmit,
  records,
}: {
  filter: string;
  form: ApplicationRecord;
  formMessage: string;
  isEditing: boolean;
  onChange: <K extends keyof ApplicationRecord>(key: K, value: ApplicationRecord[K]) => void;
  onClearFilter: () => void;
  onEdit: (record: ApplicationRecord) => void;
  onFilterChange: (filter: string) => void;
  onRemove: (id: string) => void;
  onResetForm: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  records: ApplicationRecord[];
}) {
  const weeklyRecords = records.filter((record) => {
    if (!record.applyDate) return false;
    return dateInRange(record.applyDate, new Date("2026-07-21T00:00:00"), new Date(`${dashboardTodayKey}T23:59:59`));
  });
  const staleRecords = records.filter((record) => record.needsFollowUp === "是" && record.status !== "已结束");
  const incompleteRecords = records
    .filter((record) => !record.jd || !record.nextAction || !record.nextDeadline || !record.applyUrl)
    .slice(0, 3);
  const stageItems = [
    { key: "收藏中", label: "已收藏", index: "01", icon: Star },
    { key: "已投递", label: "已投递", index: "02", icon: Send },
    { key: "笔试中", label: "笔试", index: "03", icon: NotebookPen },
    { key: "面试中", label: "面试", index: "04", icon: UsersRound },
    { key: "Offer", label: "Offer", index: "05", icon: Award },
    { key: "已结束", label: "结果", index: "06", icon: Flag },
  ];

  return (
    <section className="tracking-page">
      <div className="tracking-title-row">
        <div className="tracking-title-icon">
          <ShieldCheck aria-hidden="true" />
        </div>
        <div>
          <h2>Offer 跟进</h2>
          <p>记录每一次投递与流程进展，形成完整求职档案</p>
        </div>
      </div>

      <nav className="tracking-stage-card" aria-label="求职流程筛选">
        {stageItems.map((stage) => {
          const Icon = stage.icon;
          const count = records.filter((record) => applicationMatchesFilter(record, stage.key)).length;
          return (
            <button
              className={filter === stage.key ? "tracking-stage tracking-stage--active" : "tracking-stage"}
              key={stage.key}
              onClick={() => onFilterChange(stage.key)}
              type="button"
            >
              <span><Icon aria-hidden="true" /></span>
              <strong>{stage.label}</strong>
              <small>{stage.index}</small>
              <em>{count}</em>
            </button>
          );
        })}
      </nav>

      <div className="tracking-layout">
        <div className="tracking-main-column">
          <ApplicationForm
            form={form}
            formMessage={formMessage}
            isEditing={isEditing}
            onChange={onChange}
            onReset={onResetForm}
            onSubmit={onSubmit}
          />
          <ApplicationRecords
            filter={filter}
            records={records}
            onClearFilter={onClearFilter}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>

        <aside className="tracking-side-column">
          <section className="tracking-side-card tracking-side-card--chart">
            <div>
              <h3>本周新增记录</h3>
              <strong>{weeklyRecords.length}</strong>
              <p>较上周 <span className={weeklyRecords.length > 0 ? "trend-up" : ""}>{weeklyRecords.length > 0 ? `+${weeklyRecords.length}` : "0"} 条</span></p>
            </div>
            <MiniSparkline values={[2, 4, 3, 5, 7, 10, Math.max(weeklyRecords.length, 4)]} />
          </section>

          <section className="tracking-side-card tracking-side-card--hourglass">
            <div>
              <h3>待更新流程</h3>
              <strong>{staleRecords.length}</strong>
              <p>需要补下一步或截止时间</p>
            </div>
            <Hourglass aria-hidden="true" />
          </section>

          <section className="tracking-side-card tracking-incomplete-card">
            <div className="side-card-title">
              <h3>信息待完善（{incompleteRecords.length}）</h3>
              <button onClick={() => onFilterChange("全部")} type="button">查看全部</button>
            </div>
            {incompleteRecords.length === 0 ? (
              <p className="side-empty">当前记录信息完整。</p>
            ) : (
              incompleteRecords.map((record) => (
                <article key={record.id}>
                  <span aria-hidden="true"><FileText /></span>
                  <div>
                    <strong>{record.company} · {record.role}</strong>
                    <small>{!record.jd ? "缺少 JD" : !record.applyUrl ? "缺少网申链接" : "缺少下一步"}</small>
                  </div>
                  <button onClick={() => onEdit(record)} type="button">去完善</button>
                </article>
              ))
            )}
          </section>

          <section className="tracking-illustration-card">
            <div>
              <strong>每一次记录，都是迈向 Offer 的一步！</strong>
              <p>坚持记录，成功更近一步。</p>
            </div>
            <div className="tracking-figure" aria-hidden="true">
              <ClipboardList />
              <span />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function MiniSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = 16 + index * (168 / Math.max(values.length - 1, 1));
      const y = 96 - (value / max) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="mini-sparkline" viewBox="0 0 210 112" role="img" aria-label="本周新增记录趋势">
      <path d={`M16 100 L${points} L194 100 Z`} fill="rgba(82, 99, 245, 0.12)" />
      <polyline points={points} fill="none" stroke="#5263f5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      {values.map((value, index) => {
        const x = 16 + index * (168 / Math.max(values.length - 1, 1));
        const y = 96 - (value / max) * 72;
        return <circle cx={x} cy={y} fill="#ffffff" key={`${value}-${index}`} r="4" stroke="#5263f5" strokeWidth="2" />;
      })}
    </svg>
  );
}

function ApplicationForm({
  form,
  formMessage,
  isEditing,
  onChange,
  onReset,
  onSubmit,
}: {
  form: ApplicationRecord;
  formMessage: string;
  isEditing: boolean;
  onChange: <K extends keyof ApplicationRecord>(key: K, value: ApplicationRecord[K]) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [jdImportText, setJdImportText] = useState("");
  const [jdImportMessage, setJdImportMessage] = useState("粘贴岗位页、招聘公告或 JD，可自动识别基础字段。");

  function applyJdImport() {
    const extracted = extractApplicationFields(jdImportText);
    const entries = Object.entries(extracted) as Array<[keyof ApplicationRecord, string]>;

    if (entries.length === 0) {
      setJdImportMessage("暂时没有识别到可填字段，可以补充公司、岗位、地点、截止时间等信息后再试。");
      return;
    }

    entries.forEach(([key, value]) => {
      if (value.trim()) onChange(key, value.trim());
    });
    setJdImportMessage(`已识别并填充 ${entries.length} 个字段：${entries.map(([key]) => applicationFieldLabels[key]).join("、")}`);
  }

  return (
    <form className="application-form" onSubmit={onSubmit}>
      <div className="form-heading">
        <div>
          <span>新增 / 更新求职记录</span>
          <h3>{isEditing ? "编辑当前求职记录" : "新增一条完整求职记录"}</h3>
        </div>
        {isEditing && <button onClick={onReset} type="button">退出编辑</button>}
      </div>

      <section className="jd-import-panel" aria-label="岗位信息自动识别">
        <div className="jd-import-heading">
          <div>
            <span>岗位信息识别</span>
            <h4>粘贴岗位页面 / JD，先自动填一版</h4>
          </div>
          <button onClick={applyJdImport} type="button">识别并填充</button>
        </div>
        <textarea
          aria-label="岗位页面或 JD 文本"
          placeholder="例如：复制官网岗位详情页、招聘公告或 JD，包含公司、岗位、地点、截止时间、岗位职责等内容。"
          value={jdImportText}
          onChange={(event) => setJdImportText(event.currentTarget.value)}
        />
        <p>{jdImportMessage}</p>
      </section>

      <div className="form-section">
        <h4>基础信息</h4>
        <Field label="序号" readOnly value={form.id || "保存后自动生成"} onChange={() => undefined} />
        <Field label="公司" required value={form.company} onChange={(value) => onChange("company", value)} />
        <Field label="岗位名称" required value={form.role} onChange={(value) => onChange("role", value)} />
        <Field label="岗位方向" value={form.direction} onChange={(value) => onChange("direction", value)} />
        <SelectField label="公司类型" value={form.companyType} options={["互联网", "央国企", "外企", "民营企业", "高校/科研", "其他"]} onChange={(value) => onChange("companyType", value)} />
        <Field label="行业" value={form.industry} onChange={(value) => onChange("industry", value)} />
        <Field label="工作地点" value={form.location} onChange={(value) => onChange("location", value)} />
        <SelectField label="招聘类型" value={form.recruitType} options={["2027届秋招", "实习提前批", "暑期实习", "日常实习", "补录"]} onChange={(value) => onChange("recruitType", value)} />
      </div>

      <div className="form-section">
        <h4>投递信息</h4>
        <SelectField label="投递渠道" value={form.channel} options={["官网", "内推", "公众号", "牛客", "腾讯文档", "其他"]} onChange={(value) => onChange("channel", value)} />
        <Field label="投递日期" type="date" value={form.applyDate} onChange={(value) => onChange("applyDate", value)} />
        <Field label="信息来源" value={form.source} onChange={(value) => onChange("source", value)} />
        <Field label="网申链接" type="url" value={form.applyUrl} onChange={(value) => onChange("applyUrl", value)} />
      </div>

      <div className="form-section">
        <h4>流程跟进</h4>
        <SelectField label="当前状态" value={form.status} options={["准备投递", "已投递", "测评中", "笔试中", "面试中", "Offer", "已结束"]} onChange={(value) => onChange("status", value)} />
        <Field label="最新进展" value={form.progress} onChange={(value) => onChange("progress", value)} />
        <Field label="下一步事项" value={form.nextAction} onChange={(value) => onChange("nextAction", value)} />
        <Field label="下一步截止时间" type="datetime-local" value={form.nextDeadline} onChange={(value) => onChange("nextDeadline", value)} />
        <SelectField label="是否需要跟进" value={form.needsFollowUp} options={["是", "否"]} onChange={(value) => onChange("needsFollowUp", value)} />
        <SelectField label="是否测评" value={form.assessment} options={["未开始", "进行中", "已完成", "无"]} onChange={(value) => onChange("assessment", value)} />
        <SelectField label="是否笔试" value={form.writtenTest} options={["未开始", "进行中", "已完成", "无"]} onChange={(value) => onChange("writtenTest", value)} />
        <SelectField label="是否面试" value={form.interview} options={["未开始", "等待安排", "面试中", "已完成", "无"]} onChange={(value) => onChange("interview", value)} />
        <Field label="面试轮次" value={form.interviewRound} onChange={(value) => onChange("interviewRound", value)} />
        <SelectField label="面试形式" value={form.interviewFormat} options={["待确认", "线上", "线下", "电话", "群面"]} onChange={(value) => onChange("interviewFormat", value)} />
        <SelectField label="面试结果" value={form.interviewResult} options={["待确认", "通过", "未通过", "等待反馈"]} onChange={(value) => onChange("interviewResult", value)} />
      </div>

      <div className="form-section">
        <h4>Offer 信息</h4>
        <SelectField label="Offer情况" value={form.offerStatus} options={["暂无", "已收到", "已拒绝", "已接受", "等待中"]} onChange={(value) => onChange("offerStatus", value)} />
        <Field label="Offer截止日期" type="date" value={form.offerDeadline} onChange={(value) => onChange("offerDeadline", value)} />
        <Field label="薪资（年包）" value={form.salary} onChange={(value) => onChange("salary", value)} />
        <Field label="Base城市" value={form.baseCity} onChange={(value) => onChange("baseCity", value)} />
        <SelectField label="是否接受" value={form.offerStatus === "已接受" ? "已接受" : "未确定"} options={["未确定", "已接受", "已拒绝"]} onChange={(value) => onChange("offerStatus", value === "未确定" ? form.offerStatus : value)} />
        <SelectField label="优先级" value={form.priority} options={["P0", "P1", "P2", "P3"]} onChange={(value) => onChange("priority", value)} />
        <SelectField label="意向程度" value={form.interest} options={["高", "中", "低", "观望"]} onChange={(value) => onChange("interest", value)} />
      </div>

      <div className="form-section form-section--wide">
        <h4>备注</h4>
        <Field label="简历版本" value={form.resumeVersion} onChange={(value) => onChange("resumeVersion", value)} />
        <label className="field field--textarea">
          JD
          <textarea value={form.jd} onChange={(event) => onChange("jd", event.target.value)} placeholder="粘贴岗位描述或关键词" />
        </label>
        <label className="field field--textarea">
          备注
          <textarea value={form.notes} onChange={(event) => onChange("notes", event.target.value)} placeholder="记录联系人、复盘、注意事项" />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit">{isEditing ? "保存修改" : "保存记录"}</button>
        <button onClick={onReset} type="button">清空重填</button>
        {formMessage && <span>{formMessage}</span>}
      </div>
    </form>
  );
}

const applicationFieldLabels: Record<keyof ApplicationRecord, string> = {
  id: "序号",
  company: "公司",
  role: "岗位名称",
  direction: "岗位方向",
  companyType: "公司类型",
  industry: "行业",
  location: "工作地点",
  recruitType: "招聘类型",
  channel: "投递渠道",
  applyDate: "投递日期",
  status: "当前状态",
  progress: "最新进展",
  nextAction: "下一步事项",
  needsFollowUp: "是否需要跟进",
  offerStatus: "Offer 状态",
  offerDeadline: "Offer 截止日期",
  salary: "薪资",
  baseCity: "Base 城市",
  priority: "优先级",
  interest: "意向程度",
  source: "信息来源",
  sourceJobId: "来源岗位",
  applyUrl: "网申链接",
  jd: "JD",
  resumeVersion: "简历版本",
  assessment: "测评状态",
  writtenTest: "笔试状态",
  interview: "面试状态",
  interviewRound: "面试轮次",
  interviewFormat: "面试形式",
  interviewResult: "面试结果",
  notes: "备注",
  nextDeadline: "下一步截止时间",
};

function extractApplicationFields(rawText: string): Partial<ApplicationRecord> {
  const text = rawText.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!text) return {};

  const compactText = text.replace(/\n+/g, " ");
  const extracted: Partial<ApplicationRecord> = { jd: text };
  const url = compactText.match(/https?:\/\/[^\s"'<>，。；、)）]+/i)?.[0];
  const company =
    labeledValue(text, ["公司", "企业", "单位", "招聘单位", "雇主"])
    || compactText.match(/(腾讯|阿里巴巴|阿里|字节跳动|抖音|京东|美团|百度|网易|华为|小米|快手|蚂蚁|拼多多|米哈游|蔚来|理想|小鹏|比亚迪|大疆|联想|携程|哔哩哔哩|B站|商汤|旷视|寒武纪|中兴|海康威视|宁德时代|微软|Apple|Google|Amazon|字节)[\w\u4e00-\u9fa5（）()·-]{0,12}/)?.[0];
  const role =
    labeledValue(text, ["岗位名称", "职位名称", "招聘岗位", "目标岗位", "岗位", "职位"])
    || text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => /(工程师|产品|运营|算法|开发|测试|设计|管培|分析师|研究员|实习生|校招生)/.test(line) && line.length <= 42);
  const location =
    labeledValue(text, ["工作地点", "工作城市", "办公地点", "地点", "Base", "base"])
    || Array.from(new Set(compactText.match(/北京|上海|深圳|广州|杭州|南京|成都|武汉|西安|苏州|长沙|重庆|天津|厦门|合肥|青岛|济南|宁波|珠海|佛山|东莞|无锡|海外/g) || [])).slice(0, 4).join("/");
  const deadline = extractDeadline(compactText);

  if (company) extracted.company = cleanupExtractedValue(company);
  if (role) extracted.role = cleanupExtractedValue(role);
  if (location) {
    extracted.location = cleanupExtractedValue(location);
    extracted.baseCity = cleanupExtractedValue(location).split(/[、,，/]/)[0] || "";
  }
  if (url) {
    extracted.applyUrl = url;
    extracted.channel = /career|campus|jobs|join|recruit|zhaopin|校招|招聘/i.test(url) ? "官网" : "其他";
  }
  if (deadline) {
    extracted.nextDeadline = `${deadline}T23:59`;
    extracted.nextAction = "关注投递截止";
    extracted.needsFollowUp = "是";
  }

  extracted.industry = inferIndustry(compactText);
  extracted.direction = inferDirection(compactText);
  extracted.companyType = inferCompanyType(compactText);
  extracted.recruitType = inferRecruitType(compactText);
  extracted.status = /已投递|投递成功|提交成功/.test(compactText) ? "已投递" : "准备投递";
  extracted.progress = extracted.status === "已投递" ? "已投递" : "待投递";
  extracted.priority = /内推|提前批|截止|急招|核心|重点|高优/.test(compactText) ? "P0" : "P1";
  extracted.interest = /心仪|高意向|重点|核心|匹配|推荐/.test(compactText) ? "高" : "中";
  extracted.source = url ? "官网岗位页" : "JD 粘贴识别";

  return Object.fromEntries(Object.entries(extracted).filter(([, value]) => String(value || "").trim())) as Partial<ApplicationRecord>;
}

function labeledValue(text: string, labels: string[]) {
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${labelPattern})\\s*[:：]\\s*([^\\n；;|｜]{2,80})`, "i"));
  return match?.[1];
}

function cleanupExtractedValue(value: string) {
  return value
    .replace(/^[：:\s]+/, "")
    .replace(/\s*(岗位职责|职位描述|任职要求|工作职责|立即申请|申请链接).*$/i, "")
    .trim();
}

function extractDeadline(text: string) {
  const labeledDeadline = text.match(/(?:截止时间|投递截止|报名截止|申请截止|网申截止|截止日期)\s*[:：]?\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}月\d{1,2}日)/);
  const dateText = labeledDeadline?.[1] || text.match(/20\d{2}[/-]\d{1,2}[/-]\d{1,2}/)?.[0];
  if (!dateText) return "";
  if (dateText.includes("月")) {
    const parts = dateText.match(/(\d{1,2})月(\d{1,2})日/);
    if (!parts) return "";
    return `${dashboardTodayKey.slice(0, 4)}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }
  const parts = dateText.split(/[/-]/);
  return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
}

function inferIndustry(text: string) {
  if (/芯片|半导体|集成电路|IC|EDA/.test(text)) return "半导体/芯片";
  if (/人工智能|大模型|机器学习|算法|数据科学|AI/.test(text)) return "人工智能";
  if (/汽车|新能源|自动驾驶|电池/.test(text)) return "汽车/新能源";
  if (/金融|银行|证券|基金|保险/.test(text)) return "金融科技";
  if (/游戏|内容|直播|视频|社区/.test(text)) return "互联网内容";
  if (/电商|零售|供应链|物流/.test(text)) return "电商/供应链";
  if (/软件|云计算|SaaS|平台|系统/.test(text)) return "计算机软件";
  return "互联网/综合";
}

function inferDirection(text: string) {
  if (/前端|Web|React|Vue/.test(text)) return "前端开发";
  if (/后端|服务端|Java|Go|Python|C\+\+/.test(text)) return "后端开发";
  if (/算法|机器学习|深度学习|推荐|NLP|CV|大模型/.test(text)) return "AI/算法";
  if (/数据分析|数据开发|BI|数仓/.test(text)) return "数据分析";
  if (/产品经理|产品运营/.test(text)) return "产品/项目";
  if (/运营|增长|用户/.test(text)) return "运营";
  if (/测试|质量|QA/.test(text)) return "测试/质量";
  if (/设计|UI|UX|交互/.test(text)) return "设计";
  return "综合方向";
}

function inferCompanyType(text: string) {
  if (/央企|国企|事业单位|研究院|研究所/.test(text)) return "央国企";
  if (/外企|跨国|Microsoft|Google|Amazon|Apple|IBM|Oracle|SAP/.test(text)) return "外企";
  if (/高校|大学|科研/.test(text)) return "高校/科研";
  if (/民营/.test(text)) return "民营企业";
  return "互联网";
}

function inferRecruitType(text: string) {
  if (/日常实习/.test(text)) return "日常实习";
  if (/暑期实习|暑期/.test(text)) return "暑期实习";
  if (/提前批|实习提前批/.test(text)) return "实习提前批";
  if (/补录/.test(text)) return "补录";
  if (/2027|27届|秋招|校园招聘|校招/.test(text)) return "2027届秋招";
  return "2027届秋招";
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <input readOnly={readOnly} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ApplicationRecords({
  filter,
  onClearFilter,
  onEdit,
  records,
  onRemove,
}: {
  filter: string;
  onClearFilter: () => void;
  onEdit: (record: ApplicationRecord) => void;
  records: ApplicationRecord[];
  onRemove: (id: string) => void;
}) {
  const visibleRecords = records.filter((record) => applicationMatchesFilter(record, filter));

  if (records.length === 0) {
    return (
      <section className="record-panel record-panel--empty">
        <h3>还没有投递记录</h3>
        <p>填完左侧问卷后，这里会自动生成你的秋招追踪卡片。</p>
      </section>
    );
  }

  return (
    <section className="record-panel">
      <div className="record-heading">
        <div>
          <span>最近记录</span>
          <h3>{filter === "全部" ? "最近求职记录" : `${filter}记录`}</h3>
        </div>
        <div className="record-heading-actions">
          <button onClick={() => downloadApplicationRecordsExcel(visibleRecords, filter)} type="button">
            <Download aria-hidden="true" />
            导出 Excel
          </button>
          {filter !== "全部" && <button onClick={onClearFilter} type="button">清除筛选</button>}
        </div>
      </div>
      <div className="record-table-shell">
        {visibleRecords.length === 0 ? (
          <div className="dashboard-empty-state">
            <strong>暂无匹配记录</strong>
            <p>当前筛选下没有投递记录，可以清除筛选或新增一条。</p>
          </div>
        ) : (
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">公司</th>
                <th scope="col">岗位</th>
                <th scope="col">行业 / 类别</th>
                <th scope="col">状态</th>
                <th scope="col">备注</th>
                <th scope="col">最新进度日期</th>
                <th scope="col">投递日期</th>
                <th scope="col">base 地</th>
                <th scope="col">优先级</th>
                <th scope="col">投递链接</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="record-company-cell">
                      <span className="record-company-mark" aria-hidden="true">{(record.company || "待").slice(0, 1)}</span>
                      <div>
                        <strong>{record.company || "公司待填写"}</strong>
                        <small>{record.channel || "来源待确认"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="record-role-cell">
                      <strong>{record.role || "岗位待填写"}</strong>
                      <small>{record.direction || "方向待确认"} · {record.recruitType || "批次待确认"}</small>
                    </div>
                  </td>
                  <td>
                    <div className="record-meta-stack">
                      <span>{record.industry || "行业待确认"}</span>
                      <small>{record.companyType || "类型待确认"}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${statusTone(record.status)}`}>{record.status || "待确认"}</span>
                  </td>
                  <td>
                    <p className="record-note-cell">
                      {record.notes || record.progress || record.nextAction || (record.needsFollowUp === "是" ? "需要跟进" : "暂无备注")}
                    </p>
                  </td>
                  <td>{record.nextDeadline || record.offerDeadline || "待确认"}</td>
                  <td>{record.applyDate || "待确认"}</td>
                  <td>{record.baseCity || record.location || "待确认"}</td>
                  <td><span className="priority-chip">{record.priority || "P2"}</span></td>
                  <td>
                    {record.applyUrl ? (
                      <a className="record-link" href={record.applyUrl} rel="noreferrer" target="_blank">
                        打开网申
                      </a>
                    ) : (
                      <span className="record-muted">待补充</span>
                    )}
                  </td>
                  <td>
                    <div className="record-table-actions">
                      <button aria-label={`编辑 ${record.company} 记录`} onClick={() => onEdit(record)} type="button"><Edit3 aria-hidden="true" />编辑</button>
                      <button aria-label={`删除 ${record.company} 记录`} onClick={() => onRemove(record.id)} type="button"><Trash2 aria-hidden="true" />删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

const applicationExportColumns: Array<{ key: keyof ApplicationRecord; label: string }> = [
  { key: "company", label: "公司" },
  { key: "role", label: "岗位" },
  { key: "direction", label: "岗位方向" },
  { key: "companyType", label: "公司类型" },
  { key: "industry", label: "行业" },
  { key: "location", label: "工作地点" },
  { key: "recruitType", label: "招聘类型" },
  { key: "channel", label: "信息来源" },
  { key: "applyDate", label: "投递日期" },
  { key: "status", label: "当前状态" },
  { key: "progress", label: "最新进展" },
  { key: "nextAction", label: "下一步事项" },
  { key: "nextDeadline", label: "下一步截止时间" },
  { key: "needsFollowUp", label: "是否需要跟进" },
  { key: "offerStatus", label: "Offer 状态" },
  { key: "offerDeadline", label: "Offer 截止日期" },
  { key: "salary", label: "薪资" },
  { key: "baseCity", label: "Base 城市" },
  { key: "priority", label: "优先级" },
  { key: "interest", label: "意向程度" },
  { key: "source", label: "来源备注" },
  { key: "applyUrl", label: "网申链接" },
  { key: "jd", label: "JD" },
  { key: "resumeVersion", label: "简历版本" },
  { key: "assessment", label: "是否测评" },
  { key: "writtenTest", label: "笔试状态" },
  { key: "interview", label: "面试状态" },
  { key: "interviewRound", label: "面试轮次" },
  { key: "interviewFormat", label: "面试形式" },
  { key: "interviewResult", label: "面试结果" },
  { key: "notes", label: "备注" },
];

function escapeExcelHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatExcelCell(value: string) {
  const normalized = value.trim();
  const safeValue = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return escapeExcelHtml(safeValue);
}

function downloadApplicationRecordsExcel(records: ApplicationRecord[], filter: string) {
  const rows = records.map((record) =>
    applicationExportColumns
      .map((column) => `<td style="mso-number-format:'\\@';">${formatExcelCell(String(record[column.key] || ""))}</td>`)
      .join(""),
  );
  const emptyRow = `<tr><td colspan="${applicationExportColumns.length}">暂无投递记录</td></tr>`;
  const table = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, "Microsoft YaHei", sans-serif; }
          th, td { border: 1px solid #d9e1f2; padding: 8px 10px; font-size: 12px; white-space: nowrap; }
          th { background: #edf2ff; color: #172036; font-weight: 700; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${applicationExportColumns.map((column) => `<th>${escapeExcelHtml(column.label)}</th>`).join("")}</tr>
          </thead>
          <tbody>${rows.length ? rows.map((row) => `<tr>${row}</tr>`).join("") : emptyRow}</tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob(["\ufeff", table], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const scope = filter === "全部" ? "全部记录" : filter;

  anchor.href = url;
  anchor.download = `offercat-秋招投递记录-${scope}-${dashboardTodayKey}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function applicationMatchesFilter(record: ApplicationRecord, filter: string) {
  if (filter === "全部") return true;
  if (filter === "待跟进") return record.needsFollowUp === "是" && record.status !== "已结束";
  if (filter === "笔试中") return record.status === "笔试中" || isActiveStage(record.writtenTest);
  if (filter === "面试中") return record.status === "面试中" || isActiveStage(record.interview);
  if (filter === "Offer") return record.status === "Offer" || record.offerStatus !== "暂无";
  return record.status === filter;
}

function statusTone(status: string) {
  if (status === "Offer") return "offer";
  if (status === "面试中") return "interview";
  if (status === "笔试中" || status === "测评中") return "written";
  if (status === "已结束") return "ended";
  if (status === "已投递") return "applied";
  return "draft";
}

function calendarEventMatchesFilter(event: CalendarEvent, filter: CalendarFilterValue) {
  if (filter === "all") return true;
  if (filter === "custom") return event.sourceType === "manual";
  if (scheduleCategories.some((category) => category.value === filter)) return event.category === filter;
  if (filter === "deadline") return event.eventType === "deadline" || event.eventType === "offer";
  return event.eventType === filter;
}

function eventTypeIcon(eventType: CalendarEventType) {
  if (eventType === "written") return <NotebookPen aria-hidden="true" />;
  if (eventType === "interview") return <UsersRound aria-hidden="true" />;
  if (eventType === "deadline") return <AlarmClock aria-hidden="true" />;
  if (eventType === "offer") return <Award aria-hidden="true" />;
  if (eventType === "meeting") return <UsersRound aria-hidden="true" />;
  if (eventType === "course") return <BookOpen aria-hidden="true" />;
  if (eventType === "thesis") return <FileText aria-hidden="true" />;
  if (eventType === "follow") return <Flag aria-hidden="true" />;
  return <ClipboardList aria-hidden="true" />;
}
