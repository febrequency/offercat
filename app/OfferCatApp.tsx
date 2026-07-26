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
  kind: CalendarEventKind;
  source: string;
};

type CalendarTodo = {
  id: string;
  title: string;
  due: string;
  kind: CalendarEventKind;
  done: boolean;
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

const navItems = ["职位信息", "信息源", "我的秋招", "面试日历"] as const;
const applicationStorageKey = "offercat-applications-v1";
const calendarTodoStorageKey = "offercat-calendar-todos-v1";
const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

const defaultCalendarTodos: CalendarTodo[] = [
  {
    id: "todo-resume-baidu",
    title: "更新百度 AI 岗简历版本",
    due: "2026-07-27",
    kind: "todo",
    done: false,
  },
  {
    id: "todo-tencent-source",
    title: "复查腾讯文档新增岗位",
    due: "2026-07-29",
    kind: "follow",
    done: false,
  },
  {
    id: "todo-netease-deadline",
    title: "确认网易校招截止时间",
    due: "2026-08-01",
    kind: "deadline",
    done: false,
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
      setCalendarTodos(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(calendarTodoStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(calendarTodoStorageKey, JSON.stringify(calendarTodos));
  }, [calendarTodos]);

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

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">2027 AUTUMN RECRUITING</span>
          <h1>把分散的秋招信息，变成自己的投递节奏。</h1>
          <p>
            offercat 先帮你收住信息源、岗位库和投递记录。官网数据暂时无法稳定导出时，入口先保留；
            等抓取规则成熟后，再把它们自动整理进你的工作台。
          </p>
          <div className="hero-actions">
            <button onClick={() => setActiveView("信息源")} type="button">查看信息源</button>
            <button onClick={() => setActiveView("我的秋招")} type="button">填写投递问卷</button>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="section-bar">
          <div>
            <span>Workspace</span>
            <h2>{activeView}</h2>
          </div>
          <strong>
            {activeView === "我的秋招"
              ? `${activeRecords.length} 个进行中`
              : activeView === "面试日历"
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

        {activeView === "面试日历" && (
          <CalendarPlanner
            applications={applications}
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
  todos,
  onAddTodo,
  onRemoveTodo,
  onToggleTodo,
}: {
  applications: ApplicationRecord[];
  todos: CalendarTodo[];
  onAddTodo: (todo: Omit<CalendarTodo, "id" | "done">) => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDue, setTodoDue] = useState(() => toDateKey(today));
  const [todoKind, setTodoKind] = useState<CalendarEventKind>("todo");

  const applicationEvents = useMemo(() => buildApplicationEvents(applications), [applications]);
  const todoEvents = useMemo(
    () => todos.map((todo) => ({
      id: `calendar-${todo.id}`,
      title: todo.title,
      date: todo.due,
      kind: todo.kind,
      source: todo.done ? "已完成" : "Todo",
    })),
    [todos],
  );
  const events = useMemo(() => [...seedCalendarEvents, ...applicationEvents, ...todoEvents], [applicationEvents, todoEvents]);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
  const monthLabel = `${visibleMonth.getFullYear()}年${visibleMonth.getMonth() + 1}月`;
  const openTodoCount = todos.filter((todo) => !todo.done).length;
  const urgentTodoCount = todos.filter((todo) => !todo.done && todo.due <= toDateKey(today)).length;

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!todoTitle.trim()) return;

    onAddTodo({
      title: todoTitle.trim(),
      due: todoDue,
      kind: todoKind,
    });
    setTodoTitle("");
  }

  return (
    <section className="calendar-planner">
      <div className="calendar-sidebar">
        <div className="calendar-mini-card">
          <span>Calendar</span>
          <h3>{monthLabel}</h3>
          <p>用彩色节点标记网申、笔试、面试、跟进和 offer 截止。</p>
        </div>
        <div className="calendar-stats">
          <Metric label="日历节点" value={events.length} />
          <Metric label="待办事项" value={openTodoCount} />
          <Metric label="需要马上看" value={urgentTodoCount} />
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
          </div>
          <div className="selected-event-list">
            {selectedEvents.length === 0 ? (
              <p>这一天暂时没有节点，可以把它留给复盘和补投。</p>
            ) : (
              selectedEvents.map((event) => (
                <article className={`selected-event selected-event--${event.kind}`} key={event.id}>
                  <span>{event.time || "全天"}</span>
                  <strong>{event.title}</strong>
                  <small>{event.source}</small>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <section className="todo-strip">
        <div className="todo-strip-heading">
          <div>
            <span>Todo & deadlines</span>
            <h3>记录条</h3>
          </div>
          <form className="todo-add" onSubmit={addTodo}>
            <input aria-label="新增 todo" placeholder="新增 todo，例如：补充美团简历" value={todoTitle} onChange={(event) => setTodoTitle(event.target.value)} />
            <input aria-label="截止日期" type="date" value={todoDue} onChange={(event) => setTodoDue(event.target.value)} />
            <select aria-label="事项类型" value={todoKind} onChange={(event) => setTodoKind(event.target.value as CalendarEventKind)}>
              <option value="todo">Todo</option>
              <option value="deadline">投递截止</option>
              <option value="interview">面试</option>
              <option value="written">笔试/测评</option>
              <option value="follow">跟进</option>
              <option value="offer">Offer</option>
            </select>
            <button type="submit">添加</button>
          </form>
        </div>
        <div className="todo-list">
          {todos
            .slice()
            .sort((a, b) => a.due.localeCompare(b.due))
            .map((todo) => (
              <article className={`todo-item todo-item--${todo.kind} ${todo.done ? "todo-item--done" : ""}`} key={todo.id}>
                <button aria-label={todo.done ? "标记为未完成" : "标记为已完成"} onClick={() => onToggleTodo(todo.id)} type="button" />
                <div>
                  <strong>{todo.title}</strong>
                  <span>{formatDateLabel(todo.due)} 截止</span>
                </div>
                <small>{kindLabel(todo.kind)}</small>
                <button aria-label="删除 todo" onClick={() => onRemoveTodo(todo.id)} type="button">删除</button>
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
