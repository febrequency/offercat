"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  Award,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  FileText,
  Globe2,
  Grid2X2,
  Link2,
  Menu,
  NotebookPen,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  Target,
  UsersRound,
  X,
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

type JobStatus = "待投递" | "收藏中" | "已投递" | "面试中";

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
type AppView = "求职大盘" | "求职信息源" | "Offer 跟进" | "Offer 日历" | "Offer To Do";
type TrendRange = "4w" | "8w" | "12w" | "6m" | "year";
type IconComponent = LucideIcon;
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
  kind: CalendarEventKind;
  done: boolean;
  priority: "P0" | "P1" | "P2" | "P3";
  owner: string;
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
];
const applicationStorageKey = "offercat-applications-v1";
const calendarTodoStorageKey = "offercat-calendar-todos-v1";
const calendarEventStorageKey = "offercat-calendar-events-v1";
const dismissedCalendarEventStorageKey = "offercat-dismissed-calendar-event-ids-v1";
const dashboardTodayKey = "2026-07-27";
const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
const trendRanges: Array<{ value: TrendRange; label: string; weeks: number }> = [
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
  const [trendRange, setTrendRange] = useState<TrendRange>("8w");
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [city, setCity] = useState("全部");
  const [batch, setBatch] = useState("全部");
  const [tag, setTag] = useState("全部");
  const [companyKind, setCompanyKind] = useState("全部");
  const [applicationFilter, setApplicationFilter] = useState("全部");
  const [form, setForm] = useState<ApplicationRecord>(blankApplication);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const [calendarTodos, setCalendarTodos] = useState<CalendarTodo[]>(defaultCalendarTodos);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [dismissedCalendarEventIds, setDismissedCalendarEventIds] = useState<string[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) return;

      setApplications(readJsonStorage(applicationStorageKey, []));
      setCalendarTodos(readJsonStorage(calendarTodoStorageKey, defaultCalendarTodos, (items) => items.map(normalizeTodo)));
      setCalendarEvents(readJsonStorage<CalendarEvent[]>(calendarEventStorageKey, [], (items) => items.map(normalizeCalendarEvent)));
      setDismissedCalendarEventIds(readJsonStorage<string[]>(dismissedCalendarEventStorageKey, []));
      setIsStorageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    window.localStorage.setItem(applicationStorageKey, JSON.stringify(applications));
  }, [applications, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    window.localStorage.setItem(calendarTodoStorageKey, JSON.stringify(calendarTodos));
  }, [calendarTodos, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    window.localStorage.setItem(calendarEventStorageKey, JSON.stringify(calendarEvents));
  }, [calendarEvents, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    window.localStorage.setItem(dismissedCalendarEventStorageKey, JSON.stringify(dismissedCalendarEventIds));
  }, [dismissedCalendarEventIds, isStorageReady]);

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

  const filteredJobs = jobs.filter((job) => {
    const haystack = [job.company, job.title, job.industry, job.city, job.description, job.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query.toLowerCase())) &&
      (city === "全部" || job.city.includes(city)) &&
      (batch === "全部" || job.batch === batch) &&
      (tag === "全部" || job.tags.includes(tag)) &&
      (companyKind === "全部" || job.companyType === companyKind)
    );
  });

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
  const visibleCalendarEventCount = visibleCalendarEvents.length;
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

  async function importOfficialSignals() {
    try {
      const response = await fetch("/data/synced-official-jobs.json", { cache: "no-store" });
      const payload = await response.json();
      const importedJobs: Job[] = (payload.jobs || []).map((job: Partial<Job>, index: number) => ({
        id: `official-${job.company}-${index}`,
        company: job.company || "未知公司",
        title: job.title || "官网巡检",
        industry: job.industry || "待分类",
        city: job.city || "待确认",
        deadline: job.deadline || "待确认",
        applyUrl: job.applyUrl || "",
        batch: "校招",
        companyType: job.companyType || "待确认",
        education: job.education || "2027届优先确认",
        status: "待投递",
        tags: job.tags || ["官网巡检", "2027届"],
        updatedAt: (job.updatedAt || new Date().toISOString()).slice(0, 10),
        description: job.description || "来自官网巡检结果。",
      }));

      setJobs((current) => {
        const existingKeys = new Set(current.map((job) => `${job.company}|${job.title}|${job.applyUrl}`));
        return [
          ...importedJobs.filter((job) => !existingKeys.has(`${job.company}|${job.title}|${job.applyUrl}`)),
          ...current,
        ];
      });
    } catch {
      setJobs((current) => current);
    }
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
      id: window.crypto?.randomUUID?.() || `${Date.now()}`,
    };

    setApplications((current) => [nextRecord, ...current]);
    setForm(blankApplication);
    setFormMessage("已加入我的秋招记录。");
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
              <button onClick={clearJobFilters} type="button">
                清空筛选
              </button>
            </section>
            <JobsTable jobs={filteredJobs} onStatusChange={updateJobStatus} />

            <section className="source-area source-area--embedded">
              <div className="source-intro">
                <span>Source center</span>
                <h3>外部信息源先稳定收口。</h3>
                <p>
                  当前保留入口和清洗说明；后续导出规则稳定后，再接成自动同步。
                </p>
                <button onClick={importOfficialSignals} type="button">导入已有官网巡检结果</button>
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
          <section className="application-area">
            <ApplicationForm
              form={form}
              formMessage={formMessage}
              onChange={updateForm}
              onSubmit={submitApplication}
            />
            <ApplicationRecords
              filter={applicationFilter}
              records={applications}
              onClearFilter={() => setApplicationFilter("全部")}
              onRemove={removeApplication}
            />
          </section>
        )}

        {activeView === "Offer 日历" && (
          <>
          <ViewHeading
            count={`${visibleCalendarEventCount} 个日程`}
            subtitle="集中管理投递、笔试、面试、论文和待办同步生成的关键节点。"
            title="Offer 日历"
          />
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
          </>
        )}

        {activeView === "Offer To Do" && (
          <>
          <ViewHeading
            count={`${calendarTodos.filter((todo) => !todo.done).length} 个待办`}
            subtitle="把准备材料、复盘提醒和截止动作拆成可执行事项。"
            title="Offer To Do"
          />
          <OfferTodoPage
            todos={calendarTodos}
            onAddTodo={addCalendarTodo}
            onRemoveTodo={removeCalendarTodo}
            onToggleTodo={toggleCalendarTodo}
            onUpdateTodo={updateCalendarTodo}
          />
          </>
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            <span aria-hidden="true"><Icon /></span>
            <strong>{item.label}</strong>
            <small>{item.hint}</small>
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

      <aside className="dashboard-sidebar" data-collapsed={isCollapsed}>
      <Button className="sidebar-brand" onClick={() => onNavigate("求职大盘")} type="button" variant="ghost">
        <img src="/assets/offercat-mark.svg" alt="" />
        <span>
          <strong>offercat</strong>
          秋招项目管理
        </span>
      </Button>

      {nav}

      <Button
        aria-label={isCollapsed ? "展开导航栏" : "折叠导航栏"}
        className="sidebar-collapse"
        onClick={() => setIsCollapsed((current) => !current)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {isCollapsed ? <Menu /> : <X />}
      </Button>

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

  return (
    <Card className="dashboard-card trend-card">
      <CardHeader className="card-heading">
        <div>
          <CardTitle>近期投递趋势</CardTitle>
          <CardDescription>当前周期 {total} 次投递，平均每周 {average} 次。</CardDescription>
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
  const selectedEvents = sortCalendarEvents(events.filter((event) => event.date === selectedDate));
  const activeEvent = activeEventId ? events.find((event) => event.id === activeEventId) : null;
  const monthLabel = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  const interviewCount = events.filter((event) => event.eventType === "interview").length;
  const deadlineCount = events.filter((event) => event.eventType === "deadline" || event.eventType === "offer").length;
  const categoryStats = scheduleCategories.map((category) => ({
    ...category,
    count: events.filter((event) => event.category === category.value).length,
  }));
  const isEventFormDirty = (panelMode === "createEvent" || panelMode === "editEvent") && !calendarDraftsEqual(eventDraft, eventDraftBase);

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
    <section className="calendar-planner">
      <div className="calendar-sidebar">
        <div className="calendar-mini-card">
          <span>Offer Calendar</span>
          <h3>{monthLabel}</h3>
          <p>把求职、论文、学工、课程和个人节点放进同一张月历，用颜色看清每天的重心。</p>
        </div>
        <div className="calendar-stats">
          <Metric label="日历节点" value={events.length} />
          <Metric label="面试节点" value={interviewCount} />
          <Metric label="关键截止" value={deadlineCount} />
        </div>
        <div className="calendar-legend" aria-label="所属领域颜色说明">
          <strong>所属领域</strong>
          {categoryStats.map((category) => (
            <span className={`legend-dot schedule-category--${category.value}`} key={category.value}>
              {category.label}
              <small>{category.count}</small>
            </span>
          ))}
        </div>
      </div>

      <div className="calendar-main">
        <div className="calendar-toolbar">
          <div>
            <span>Month view</span>
            <h3>{monthLabel}</h3>
          </div>
          <div className="calendar-controls">
            <button onClick={() => openComposer(selectedDate)} type="button">新建日程</button>
            <button onClick={goToday} type="button">今天</button>
            <button aria-label="上个月" onClick={() => shiftMonth(-1)} type="button">‹</button>
            <button aria-label="下个月" onClick={() => shiftMonth(1)} type="button">›</button>
          </div>
        </div>

        <div className="calendar-grid" aria-label="面试日历月视图">
          {weekdayLabels.map((day) => (
            <div className="calendar-weekday" key={day}>周{day}</div>
          ))}
          {calendarDays.map((day) => {
            const dayEvents = sortCalendarEvents(events.filter((event) => event.date === day.key));
            return (
              <button
                className={[
                  "calendar-day",
                  day.isCurrentMonth ? "" : "calendar-day--muted",
                  day.key === selectedDate ? "calendar-day--selected" : "",
                  day.key === toDateKey(today) ? "calendar-day--today" : "",
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
                      {event.startTime && <i>{event.startTime}</i>}
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && <span className="calendar-more">+{dayEvents.length - 3} 项</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="calendar-detail-panel">
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
          <SelectedDayEvents
            events={selectedEvents}
            selectedDate={selectedDate}
            onAdd={() => openComposer(selectedDate)}
            onSelect={showEventDetail}
          />
        )}
      </aside>
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
                    const value = event.currentTarget.value as CalendarEventKind;
                    setTodoDraft((current) => ({ ...current, kind: value }));
                  }}
                >
                  <option value="todo">Todo</option>
                  <option value="deadline">投递截止</option>
                  <option value="interview">面试</option>
                  <option value="written">笔试/测评</option>
                  <option value="follow">跟进</option>
                  <option value="offer">Offer</option>
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
              <button onClick={requestCloseTodoForm} type="button">取消</button>
              <button type="submit">保存</button>
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
  const today = new Date(`${dashboardTodayKey}T00:00:00`);
  const start = new Date(today);
  start.setDate(today.getDate() - range.weeks * 7 + 1);

  return Array.from({ length: Math.min(range.weeks, 12) }, (_, index) => {
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

function colorFromEventType(eventType: CalendarEventType | CalendarEventKind) {
  if (eventType === "deadline") return "red";
  if (eventType === "written") return "indigo";
  if (eventType === "interview") return "purple";
  if (eventType === "offer") return "green";
  if (eventType === "follow") return "cyan";
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
      eventType: normalizeEventType(normalizedTodo.kind),
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

function normalizeCalendarEvent(event: Partial<CalendarEvent> & { kind?: CalendarEventKind; time?: string }): CalendarEvent {
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

function categoryFromLegacyKind(kind: CalendarEventKind): ScheduleCategoryValue {
  if (kind === "todo") return "personal";
  return "job_search";
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

function normalizeTodo(todo: CalendarTodo): CalendarTodo {
  return {
    ...todo,
    kind: todo.kind || "todo",
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

function JobsTable({
  jobs,
  onStatusChange,
}: {
  jobs: Job[];
  onStatusChange: (jobId: string, status: JobStatus) => void;
}) {
  return (
    <section className="table-panel">
      <div className="table-meta">
        <span>共 {jobs.length} 个岗位</span>
        <span>默认按最近更新排序</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>公司与岗位</th>
              <th>操作</th>
              <th>招聘截止时间</th>
              <th>更新时间</th>
              <th>工作地点</th>
              <th>职位标签</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
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
                  <div className="row-actions">
                    {job.applyUrl ? <a href={job.applyUrl} rel="noreferrer" target="_blank">查看官网链接</a> : <span>暂无链接</span>}
                    <button onClick={() => onStatusChange(job.id, "已投递")} type="button">加入投递流程</button>
                    <button onClick={() => onStatusChange(job.id, "收藏中")} type="button">加入兴趣库</button>
                  </div>
                </td>
                <td className={job.deadline.includes("截止") || job.deadline.includes("招满") ? "deadline" : ""}>{job.deadline}</td>
                <td>{job.updatedAt}</td>
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
    </section>
  );
}

function ApplicationForm({
  form,
  formMessage,
  onChange,
  onSubmit,
}: {
  form: ApplicationRecord;
  formMessage: string;
  onChange: <K extends keyof ApplicationRecord>(key: K, value: ApplicationRecord[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="application-form" onSubmit={onSubmit}>
      <div className="form-heading">
        <span>Application questionnaire</span>
        <h3>填写一次，生成一条自己的投递记录。</h3>
        <p>字段参考你的秋招信息追踪表，先覆盖公司、岗位、投递、笔试面试和 offer 关键状态。</p>
      </div>

      <div className="form-section">
        <h4>基础信息</h4>
        <Field label="公司" required value={form.company} onChange={(value) => onChange("company", value)} />
        <Field label="岗位名称" required value={form.role} onChange={(value) => onChange("role", value)} />
        <Field label="岗位方向" value={form.direction} onChange={(value) => onChange("direction", value)} />
        <Field label="行业" value={form.industry} onChange={(value) => onChange("industry", value)} />
        <Field label="工作地点" value={form.location} onChange={(value) => onChange("location", value)} />
        <SelectField label="公司类型" value={form.companyType} options={["互联网", "央国企", "外企", "民营企业", "高校/科研", "其他"]} onChange={(value) => onChange("companyType", value)} />
      </div>

      <div className="form-section">
        <h4>投递状态</h4>
        <SelectField label="招聘类型" value={form.recruitType} options={["2027届秋招", "实习提前批", "暑期实习", "日常实习", "补录"]} onChange={(value) => onChange("recruitType", value)} />
        <SelectField label="投递渠道" value={form.channel} options={["官网", "内推", "公众号", "牛客", "腾讯文档", "其他"]} onChange={(value) => onChange("channel", value)} />
        <Field label="投递日期" type="date" value={form.applyDate} onChange={(value) => onChange("applyDate", value)} />
        <SelectField label="当前状态" value={form.status} options={["准备投递", "已投递", "测评中", "笔试中", "面试中", "Offer", "已结束"]} onChange={(value) => onChange("status", value)} />
        <SelectField label="优先级" value={form.priority} options={["P0", "P1", "P2", "P3"]} onChange={(value) => onChange("priority", value)} />
        <SelectField label="意向程度" value={form.interest} options={["高", "中", "低", "观望"]} onChange={(value) => onChange("interest", value)} />
      </div>

      <div className="form-section">
        <h4>流程跟进</h4>
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

      <div className="form-section form-section--wide">
        <h4>链接与 offer</h4>
        <Field label="信息来源" value={form.source} onChange={(value) => onChange("source", value)} />
        <Field label="网申链接" type="url" value={form.applyUrl} onChange={(value) => onChange("applyUrl", value)} />
        <Field label="简历版本" value={form.resumeVersion} onChange={(value) => onChange("resumeVersion", value)} />
        <SelectField label="Offer情况" value={form.offerStatus} options={["暂无", "已收到", "已拒绝", "已接受", "等待中"]} onChange={(value) => onChange("offerStatus", value)} />
        <Field label="Offer截止日期" type="date" value={form.offerDeadline} onChange={(value) => onChange("offerDeadline", value)} />
        <Field label="薪资（年包）" value={form.salary} onChange={(value) => onChange("salary", value)} />
        <Field label="Base城市" value={form.baseCity} onChange={(value) => onChange("baseCity", value)} />
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
        <button type="submit">保存到我的秋招</button>
        {formMessage && <span>{formMessage}</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
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
  records,
  onRemove,
}: {
  filter: string;
  onClearFilter: () => void;
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
        <span>Application records</span>
        <h3>{filter === "全部" ? "我的投递记录" : `${filter}记录`}</h3>
        {filter !== "全部" && <button onClick={onClearFilter} type="button">清除筛选</button>}
      </div>
      <div className="record-list">
        {visibleRecords.length === 0 ? (
          <div className="dashboard-empty-state">
            <strong>暂无匹配记录</strong>
            <p>当前筛选下没有投递记录，可以清除筛选或新增一条。</p>
          </div>
        ) : visibleRecords.map((record) => (
          <article className="record-card" key={record.id}>
            <div>
              <span>{record.priority} · {record.interest}意向</span>
              <h4>{record.company} · {record.role}</h4>
              <p>{record.location || "地点待确认"} / {record.recruitType} / {record.channel}</p>
            </div>
            <dl>
              <div><dt>当前状态</dt><dd>{record.status}</dd></div>
              <div><dt>下一步</dt><dd>{record.nextAction || "待补充"}</dd></div>
              <div><dt>截止时间</dt><dd>{record.nextDeadline || record.offerDeadline || "待确认"}</dd></div>
            </dl>
            <div className="record-actions">
              {record.applyUrl && <a href={record.applyUrl} rel="noreferrer" target="_blank">打开网申</a>}
              <button onClick={() => onRemove(record.id)} type="button">删除</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function applicationMatchesFilter(record: ApplicationRecord, filter: string) {
  if (filter === "全部") return true;
  if (filter === "待跟进") return record.needsFollowUp === "是" && record.status !== "已结束";
  if (filter === "笔试中") return record.status === "笔试中" || isActiveStage(record.writtenTest);
  if (filter === "面试中") return record.status === "面试中" || isActiveStage(record.interview);
  if (filter === "Offer") return record.status === "Offer" || record.offerStatus !== "暂无";
  return record.status === filter;
}
