"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

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

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  kind: CalendarEventKind;
  source: string;
  location?: string;
  description?: string;
};

type CalendarTodo = {
  id: string;
  title: string;
  due: string;
  kind: CalendarEventKind;
  done: boolean;
  priority: "P0" | "P1" | "P2" | "P3";
  owner: string;
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

const navItems = ["职位信息", "信息源", "我的秋招", "Offer日历", "Offer Todo"] as const;
const applicationStorageKey = "offercat-applications-v1";
const calendarTodoStorageKey = "offercat-calendar-todos-v1";
const calendarEventStorageKey = "offercat-calendar-events-v1";
const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

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
    time: "10:00",
    kind: "follow",
    source: "官网巡检",
  },
  {
    id: "seed-tencent-written",
    title: "腾讯笔试准备",
    date: "2026-07-29",
    time: "19:30",
    kind: "written",
    source: "我的任务",
  },
  {
    id: "seed-bytedance-interview",
    title: "字节一面复盘",
    date: "2026-07-31",
    time: "15:00",
    kind: "interview",
    source: "面试",
  },
  {
    id: "seed-offer-decision",
    title: "offer 决策提醒",
    date: "2026-08-01",
    time: "18:00",
    kind: "offer",
    source: "Offer",
  },
];

const blankCalendarEvent: Omit<CalendarEvent, "id" | "source"> = {
  title: "",
  date: "2026-07-26",
  time: "13:00",
  endTime: "13:30",
  kind: "interview",
  location: "",
  description: "",
};

export default function OfferCatApp() {
  const [activeView, setActiveView] = useState<(typeof navItems)[number]>("职位信息");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("全部");
  const [batch, setBatch] = useState("全部");
  const [tag, setTag] = useState("全部");
  const [form, setForm] = useState<ApplicationRecord>(blankApplication);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const [calendarTodos, setCalendarTodos] = useState<CalendarTodo[]>(defaultCalendarTodos);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(applicationStorageKey);
    if (!saved) return;

    try {
      setApplications(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(applicationStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(applicationStorageKey, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    const saved = window.localStorage.getItem(calendarTodoStorageKey);
    if (!saved) return;

    try {
      setCalendarTodos(JSON.parse(saved).map(normalizeTodo));
    } catch {
      window.localStorage.removeItem(calendarTodoStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(calendarTodoStorageKey, JSON.stringify(calendarTodos));
  }, [calendarTodos]);

  useEffect(() => {
    const saved = window.localStorage.getItem(calendarEventStorageKey);
    if (!saved) return;

    try {
      setCalendarEvents(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(calendarEventStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(calendarEventStorageKey, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const cityOptions = useMemo(
    () => ["全部", ...Array.from(new Set(jobs.flatMap((job) => job.city.split(/[、,，/]/)).map((item) => item.trim()).filter(Boolean)))],
    [jobs],
  );

  const tagOptions = useMemo(
    () => ["全部", ...Array.from(new Set(jobs.flatMap((job) => job.tags)))],
    [jobs],
  );

  const filteredJobs = jobs.filter((job) => {
    const haystack = [job.company, job.title, job.industry, job.city, job.description, job.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query.toLowerCase())) &&
      (city === "全部" || job.city.includes(city)) &&
      (batch === "全部" || job.batch === batch) &&
      (tag === "全部" || job.tags.includes(tag))
    );
  });

  const activeRecords = applications.filter((item) => item.status !== "已结束");

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
  }

  function addCalendarEvent(event: Omit<CalendarEvent, "id" | "source">) {
    setCalendarEvents((current) => [
      {
        ...event,
        id: window.crypto?.randomUUID?.() || `${Date.now()}`,
        source: "手动新建",
      },
      ...current,
    ]);
  }

  function removeCalendarEvent(id: string) {
    setCalendarEvents((current) => current.filter((event) => event.id !== id));
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
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setActiveView("职位信息")} type="button">
          <img src="/assets/offercat-mark.svg" alt="" />
          <span>
            <strong>offercat</strong>
            秋招信息工作台
          </span>
        </button>
        <nav aria-label="主导航">
          {navItems.map((item) => (
            <button
              className={activeView === item ? "active" : ""}
              key={item}
              onClick={() => setActiveView(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
        <input
          aria-label="搜索公司或岗位"
          className="header-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索公司或岗位"
          value={query}
        />
      </header>

      <section className="workspace-panel">
        <div className="section-bar">
          <div>
            <span>Workspace</span>
            <h2>{activeView}</h2>
          </div>
          <strong>
            {activeView === "我的秋招"
              ? `${activeRecords.length} 个进行中`
              : activeView === "Offer日历"
                ? `${calendarEvents.length + seedCalendarEvents.length + buildApplicationEvents(applications).length} 个日程`
                : activeView === "Offer Todo"
                ? `${calendarTodos.filter((todo) => !todo.done).length} 个待办`
                : `${filteredJobs.length} 个岗位可见`}
          </strong>
        </div>

        {activeView === "职位信息" && (
          <>
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
              <button onClick={() => { setQuery(""); setCity("全部"); setBatch("全部"); setTag("全部"); }} type="button">
                清空筛选
              </button>
            </section>
            <JobsTable jobs={filteredJobs} onStatusChange={updateJobStatus} />
          </>
        )}

        {activeView === "信息源" && (
          <section className="source-area">
            <div className="source-intro">
              <span>Source center</span>
              <h3>先把三个外部信息源安稳放在这里。</h3>
              <p>
                这一步不强行抓取不稳定数据，先给每个来源留下入口、定位和后续清洗说明。
                后面能导出时，再接成自动同步。
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
        )}

        {activeView === "我的秋招" && (
          <section className="application-area">
            <ApplicationForm
              form={form}
              formMessage={formMessage}
              onChange={updateForm}
              onSubmit={submitApplication}
            />
            <ApplicationRecords records={applications} onRemove={removeApplication} />
          </section>
        )}

        {activeView === "Offer日历" && (
          <CalendarPlanner
            applications={applications}
            customEvents={calendarEvents}
            onAddEvent={addCalendarEvent}
            onRemoveEvent={removeCalendarEvent}
          />
        )}

        {activeView === "Offer Todo" && (
          <OfferTodoPage
            todos={calendarTodos}
            onAddTodo={addCalendarTodo}
            onRemoveTodo={removeCalendarTodo}
            onToggleTodo={toggleCalendarTodo}
          />
        )}
      </section>
    </main>
  );
}

function CalendarPlanner({
  applications,
  customEvents,
  onAddEvent,
  onRemoveEvent,
}: {
  applications: ApplicationRecord[];
  customEvents: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, "id" | "source">) => void;
  onRemoveEvent: (id: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<Omit<CalendarEvent, "id" | "source">>(() => ({
    ...blankCalendarEvent,
    date: toDateKey(today),
  }));

  const applicationEvents = useMemo(() => buildApplicationEvents(applications), [applications]);
  const events = useMemo(() => [...seedCalendarEvents, ...customEvents, ...applicationEvents], [applicationEvents, customEvents]);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
  const monthLabel = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  const interviewCount = events.filter((event) => event.kind === "interview").length;
  const deadlineCount = events.filter((event) => event.kind === "deadline" || event.kind === "offer").length;

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function openComposer(dateKey = selectedDate) {
    setEventDraft((current) => ({
      ...current,
      date: dateKey,
      title: current.title,
    }));
    setSelectedDate(dateKey);
    setIsComposerOpen(true);
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventDraft.title.trim()) return;

    onAddEvent({
      ...eventDraft,
      title: eventDraft.title.trim(),
    });
    setEventDraft({
      ...blankCalendarEvent,
      date: eventDraft.date,
    });
    setIsComposerOpen(false);
  }

  return (
    <section className="calendar-planner">
      <div className="calendar-sidebar">
        <div className="calendar-mini-card">
          <span>Calendar</span>
          <h3>{monthLabel}</h3>
          <p>这里专门管理 offer 相关日程：笔试、面试、复盘、跟进和 offer 决策。</p>
        </div>
        <div className="calendar-stats">
          <Metric label="日历节点" value={events.length} />
          <Metric label="面试节点" value={interviewCount} />
          <Metric label="关键截止" value={deadlineCount} />
        </div>
        <div className="calendar-legend" aria-label="日历颜色说明">
          {[
            ["deadline", "投递截止"],
            ["interview", "面试"],
            ["written", "笔试/测评"],
            ["follow", "跟进"],
            ["offer", "Offer"],
            ["todo", "Todo"],
          ].map(([kind, label]) => (
            <span className={`legend-dot legend-dot--${kind}`} key={kind}>{label}</span>
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
            <button onClick={() => openComposer()} type="button">新建日程</button>
            <button onClick={() => { setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(toDateKey(today)); }} type="button">今天</button>
            <button aria-label="上个月" onClick={() => shiftMonth(-1)} type="button">‹</button>
            <button aria-label="下个月" onClick={() => shiftMonth(1)} type="button">›</button>
          </div>
        </div>

        <div className="calendar-grid" aria-label="面试日历月视图">
          {weekdayLabels.map((day) => (
            <div className="calendar-weekday" key={day}>周{day}</div>
          ))}
          {calendarDays.map((day) => {
            const dayEvents = events.filter((event) => event.date === day.key);
            return (
              <button
                className={[
                  "calendar-day",
                  day.isCurrentMonth ? "" : "calendar-day--muted",
                  day.key === selectedDate ? "calendar-day--selected" : "",
                  day.key === toDateKey(today) ? "calendar-day--today" : "",
                ].filter(Boolean).join(" ")}
                key={day.key}
                onClick={() => setSelectedDate(day.key)}
                onDoubleClick={() => openComposer(day.key)}
                type="button"
              >
                <span className="calendar-day-number">{day.date.getDate()}</span>
                <div className="calendar-events">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span className={`calendar-event calendar-event--${event.kind}`} key={event.id}>
                      {event.time && <i>{event.time}</i>}
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && <span className="calendar-more">+{dayEvents.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="selected-day-panel">
          <div>
            <span>Selected day</span>
            <h3>{formatDateLabel(selectedDate)}</h3>
            <button onClick={() => openComposer(selectedDate)} type="button">添加这天的日程</button>
          </div>
          <div className="selected-event-list">
            {selectedEvents.length === 0 ? (
              <p>这一天暂时没有节点，可以把它留给复盘和补投。</p>
            ) : (
              selectedEvents.map((event) => (
                <article className={`selected-event selected-event--${event.kind}`} key={event.id}>
                  <span>{event.time ? `${event.time}${event.endTime ? `-${event.endTime}` : ""}` : "全天"}</span>
                  <strong>{event.title}</strong>
                  <small>{event.location || event.source}</small>
                  {event.source === "手动新建" && (
                    <button aria-label="删除日程" onClick={() => onRemoveEvent(event.id)} type="button">删除</button>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        {isComposerOpen && (
          <form className="event-composer" onSubmit={submitEvent}>
            <div className="composer-title-row">
              <input
                aria-label="日程主题"
                placeholder="添加主题"
                value={eventDraft.title}
                onChange={(event) => setEventDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <button aria-label="关闭新建日程" onClick={() => setIsComposerOpen(false)} type="button">×</button>
            </div>
            <div className="composer-grid">
              <label>
                日期
                <input
                  type="date"
                  value={eventDraft.date}
                  onChange={(event) => setEventDraft((current) => ({ ...current, date: event.target.value }))}
                />
              </label>
              <label>
                开始时间
                <input
                  type="time"
                  value={eventDraft.time || ""}
                  onChange={(event) => setEventDraft((current) => ({ ...current, time: event.target.value }))}
                />
              </label>
              <label>
                结束时间
                <input
                  type="time"
                  value={eventDraft.endTime || ""}
                  onChange={(event) => setEventDraft((current) => ({ ...current, endTime: event.target.value }))}
                />
              </label>
              <label>
                类型
                <select
                  value={eventDraft.kind}
                  onChange={(event) => setEventDraft((current) => ({ ...current, kind: event.target.value as CalendarEventKind }))}
                >
                  <option value="interview">面试</option>
                  <option value="written">笔试/测评</option>
                  <option value="deadline">投递截止</option>
                  <option value="follow">跟进</option>
                  <option value="offer">Offer</option>
                </select>
              </label>
              <label>
                地点 / 方式
                <input
                  placeholder="线上、线下、会议链接"
                  value={eventDraft.location || ""}
                  onChange={(event) => setEventDraft((current) => ({ ...current, location: event.target.value }))}
                />
              </label>
              <label className="composer-wide">
                描述
                <textarea
                  placeholder="补充联系人、会议链接、准备材料或复盘提醒"
                  value={eventDraft.description || ""}
                  onChange={(event) => setEventDraft((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
            </div>
            <div className="composer-actions">
              <button onClick={() => setIsComposerOpen(false)} type="button">取消</button>
              <button type="submit">保存</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function OfferTodoPage({
  todos,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
}: {
  todos: CalendarTodo[];
  onAddTodo: (todo: Omit<CalendarTodo, "id" | "done">) => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}) {
  const todayKey = toDateKey(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [todoDraft, setTodoDraft] = useState<Omit<CalendarTodo, "id" | "done">>({
    title: "",
    due: todayKey,
    kind: "todo",
    priority: "P1",
    owner: "我",
  });
  const openTodos = todos.filter((todo) => !todo.done);
  const overdueTodos = openTodos.filter((todo) => todo.due < todayKey);
  const p0Todos = openTodos.filter((todo) => todo.priority === "P0");

  function submitTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!todoDraft.title.trim()) return;

    onAddTodo({
      ...todoDraft,
      title: todoDraft.title.trim(),
    });
    setTodoDraft({
      title: "",
      due: todayKey,
      kind: "todo",
      priority: "P1",
      owner: "我",
    });
    setIsAdding(false);
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
            <button onClick={() => setIsAdding((current) => !current)} type="button">+ 添加记录</button>
            <button type="button">筛选</button>
            <button type="button">排序</button>
          </div>
        </div>

        {isAdding && (
          <form className="todo-entry-form" onSubmit={submitTodo}>
            <input
              aria-label="待办事项"
              placeholder="待办事项，例如：准备腾讯一面自我介绍"
              value={todoDraft.title}
              onChange={(event) => setTodoDraft((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              aria-label="Todo 截止日期"
              type="date"
              value={todoDraft.due}
              onChange={(event) => setTodoDraft((current) => ({ ...current, due: event.target.value }))}
            />
            <select
              aria-label="Todo 类型"
              value={todoDraft.kind}
              onChange={(event) => setTodoDraft((current) => ({ ...current, kind: event.target.value as CalendarEventKind }))}
            >
              <option value="todo">Todo</option>
              <option value="deadline">投递截止</option>
              <option value="interview">面试</option>
              <option value="written">笔试/测评</option>
              <option value="follow">跟进</option>
              <option value="offer">Offer</option>
            </select>
            <select
              aria-label="优先级"
              value={todoDraft.priority}
              onChange={(event) => setTodoDraft((current) => ({ ...current, priority: event.target.value as CalendarTodo["priority"] }))}
            >
              <option value="P0">P0-高优</option>
              <option value="P1">P1-重要</option>
              <option value="P2">P2-普通</option>
              <option value="P3">P3-低优</option>
            </select>
            <input
              aria-label="执行人"
              placeholder="执行人"
              value={todoDraft.owner}
              onChange={(event) => setTodoDraft((current) => ({ ...current, owner: event.target.value }))}
            />
            <button type="submit">保存</button>
          </form>
        )}

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
          {todos
            .slice()
            .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.due.localeCompare(b.due))
            .map((todo) => (
              <article className={`todo-data-row todo-data-row--${todo.kind} ${todo.done ? "todo-data-row--done" : ""}`} key={todo.id}>
                <strong>{todo.title}</strong>
                <span>{formatDateLabel(todo.due)}</span>
                <span>{distanceLabel(todo.due, todayKey)}</span>
                <button aria-label={todo.done ? "标记为未完成" : "标记为已完成"} onClick={() => onToggleTodo(todo.id)} type="button">
                  {todo.done ? "已完成" : "未完成"}
                </button>
                <small className={`priority-pill priority-pill--${normalizeTodo(todo).priority.toLowerCase()}`}>{priorityLabel(normalizeTodo(todo).priority)}</small>
                <span>{normalizeTodo(todo).owner}</span>
                <button onClick={() => onRemoveTodo(todo.id)} type="button">删除</button>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}

function buildApplicationEvents(applications: ApplicationRecord[]): CalendarEvent[] {
  return applications.flatMap((record) => {
    const events: CalendarEvent[] = [];
    if (record.nextDeadline) {
      events.push({
        id: `${record.id}-next`,
        title: `${record.company} · ${record.nextAction || record.role}`,
        date: record.nextDeadline.slice(0, 10),
        time: record.nextDeadline.slice(11, 16) || undefined,
        kind: record.interview !== "未开始" ? "interview" : "follow",
        source: "我的秋招",
      });
    }
    if (record.offerDeadline) {
      events.push({
        id: `${record.id}-offer`,
        title: `${record.company} offer 决策`,
        date: record.offerDeadline,
        kind: "offer",
        source: "Offer",
      });
    }
    if (record.applyDate) {
      events.push({
        id: `${record.id}-apply`,
        title: `${record.company} 已投递`,
        date: record.applyDate,
        kind: "todo",
        source: record.channel,
      });
    }
    return events;
  });
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

function kindLabel(kind: CalendarEventKind) {
  return {
    deadline: "投递截止",
    interview: "面试",
    written: "笔试/测评",
    follow: "跟进",
    offer: "Offer",
    todo: "Todo",
  }[kind];
}

function normalizeTodo(todo: CalendarTodo): CalendarTodo {
  return {
    ...todo,
    kind: todo.kind || "todo",
    priority: todo.priority || "P1",
    owner: todo.owner || "我",
  };
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
  records,
  onRemove,
}: {
  records: ApplicationRecord[];
  onRemove: (id: string) => void;
}) {
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
        <h3>我的投递记录</h3>
      </div>
      <div className="record-list">
        {records.map((record) => (
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
