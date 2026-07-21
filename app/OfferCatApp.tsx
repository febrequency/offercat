"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

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
  status: "待投递" | "收藏中" | "已投递" | "面试中";
  tags: string[];
  updatedAt: string;
  description: string;
};

type Source = {
  id: string;
  name: string;
  category: string;
  status: string;
  detail: string;
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
    id: "robo-sense",
    company: "RoboSense",
    title: "智能驾驶 / 感知算法相关岗位",
    industry: "自动驾驶 / AI",
    city: "深圳、上海",
    deadline: "7.15截止",
    applyUrl: "",
    batch: "校招",
    companyType: "民营企业",
    education: "本科可报、硕士可报",
    status: "待投递",
    tags: ["AI/算法", "自动驾驶", "机器学习算法", "软件研发"],
    updatedAt: "2026-07-21",
    description: "来自腾讯文档压缩工作簿探针的结构化样例。",
  },
];

const sources: Source[] = [
  {
    id: "official-careers",
    name: "头部公司官网巡检",
    category: "公司官网",
    status: "已跑通轻量巡检",
    detail: "当前覆盖腾讯、字节、阿里、美团、百度、快手、京东、网易、小米、华为、拼多多等源。",
  },
  {
    id: "tencent-docs",
    name: "腾讯文档校招表",
    category: "在线文档",
    status: "已验证可读取文本",
    detail: "已从 opendoc 数据口解压出企业名称、招聘类型、城市、截止时间等字段。",
  },
  {
    id: "ats-providers",
    name: "Greenhouse / Lever / Ashby",
    category: "ATS 平台",
    status: "适合后续接入",
    detail: "这些平台提供结构化公开接口，适合补充海外 AI 公司、外企和创业公司岗位。",
  },
];

const navItems = ["职位信息", "数据源", "我的秋招", "面试日历"] as const;

export default function OfferCatApp() {
  const [activeView, setActiveView] = useState<(typeof navItems)[number]>("职位信息");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("全部");
  const [batch, setBatch] = useState("全部");
  const [tag, setTag] = useState("全部");
  const [dogPosition, setDogPosition] = useState({ x: 72, y: 72 });
  const [offerCount, setOfferCount] = useState(0);
  const [isDogHappy, setIsDogHappy] = useState(false);

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

  useEffect(() => {
    const route = [
      { x: 72, y: 72 },
      { x: 18, y: 66 },
      { x: 42, y: 78 },
      { x: 78, y: 58 },
      { x: 10, y: 74 },
    ];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % route.length;
      setDogPosition(route[index]);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  function updateJobStatus(jobId: string, status: Job["status"]) {
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

  function petOfferDog() {
    setOfferCount((current) => current + 1);
    setIsDogHappy(true);
    window.setTimeout(() => setIsDogHappy(false), 850);
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand">
          <img src="/assets/offercat-mark.svg" alt="" />
          <div>
            <strong>OfferCat</strong>
            <span>offer tracker</span>
          </div>
        </div>
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
          <span className="eyebrow">OfferCat Intelligence</span>
          <h1>把秋招情报，整理成会长 offer 的桌面。</h1>
          <p>官网巡检、岗位筛选、投递状态和面试提醒都收进一个柔软的工作台，像贴在桌面上的小窗口一样随手翻。</p>
          <div className="hero-actions">
            <button onClick={() => setActiveView("职位信息")} type="button">
              <span aria-hidden="true">+</span>
              看岗位库
            </button>
            <button onClick={() => setActiveView("我的秋招")} type="button">
              <span aria-hidden="true">✓</span>
              看进度
            </button>
          </div>
        </div>
        <div className="hero-stage" aria-label="OfferCat 主视觉">
          <img className="hero-reference" src="/assets/showcase/mad-reference.png" alt="粉橙色浮层卡片风格参考主视觉" />
          <div className="floating-window floating-window--logo">
            <span>O</span>
            <strong>C</strong>
          </div>
          <div className="floating-window floating-window--pitch">
            <small>OfferCat.app</small>
            <h2>Jobs, notes and deadlines in one soft workspace.</h2>
            <p>校招情报自动归档，投递动作每天轻一点。</p>
            <button aria-label="打开岗位概览" onClick={() => setActiveView("职位信息")} type="button">↗</button>
          </div>
          <div className="floating-window floating-window--reminders">
            <small>Today</small>
            <h3>Commandments <span>{jobs.length}</span></h3>
            {["投递前先确认官网", "收藏高匹配岗位", "记录 deadline", "面试后写复盘"].map((item) => (
              <p key={item}><i aria-hidden="true" />{item}</p>
            ))}
            <button aria-label="新增提醒" type="button">+</button>
          </div>
          <div className="bubble-nav bubble-nav--about">Jobs</div>
          <div className="bubble-nav bubble-nav--team">Sources</div>
          <div className="bubble-nav bubble-nav--work">Pipeline</div>
          <div className="bubble-nav bubble-nav--contact">Calendar</div>
          <div className="social-dock" aria-label="快捷入口">
            <button aria-label="灵感入口" type="button">◎</button>
            <button aria-label="动态入口" type="button">◆</button>
          </div>
        </div>
      </section>

      <section className="metrics" aria-label="岗位概览">
        <Metric label="可投递岗位" value={jobs.length} />
        <Metric label="当前筛选结果" value={filteredJobs.length} />
        <Metric label="已进入流程" value={jobs.filter((job) => job.status === "已投递" || job.status === "面试中").length} />
        <Metric label="摸狗获得 offer" value={offerCount} />
      </section>

      <section className="spotlight-grid" aria-label="今日重点">
        <article className="note-window">
          <span>All about offers</span>
          <h2>今日优先级</h2>
          {[
            ["百度", "确认 2027 届校招入口"],
            ["字节跳动", "补充岗位方向标签"],
            ["RoboSense", "记录 7.15 截止线索"],
          ].map(([company, detail]) => (
            <p key={company}><strong>{company}</strong>{detail}</p>
          ))}
        </article>
        <article className="mini-browser">
          <span>Offer_Note.html</span>
          <h2>投递小抄</h2>
          <p>先看岗位信号，再按城市、方向和截止时间筛一轮，把感兴趣的机会扔进流程。</p>
          <button onClick={() => setActiveView("数据源")} type="button">All Sources</button>
        </article>
        <article className="case-window">
          <span>Interactive case</span>
          <h2>摸摸狗头，offer +1</h2>
          <p>页面里的狗狗会自己巡逻。点它一下，头顶会冒出新的 offer 计数。</p>
        </article>
      </section>

      <section className="workspace-panel">
        <div className="section-bar">
          <div>
            <span>Workspace</span>
            <h2>{activeView}</h2>
          </div>
          <strong>{filteredJobs.length} jobs visible</strong>
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

        {activeView === "数据源" && (
          <section className="source-grid">
            {sources.map((source) => (
              <article className="source-card" key={source.id}>
                <span>{source.category}</span>
                <h2>{source.name}</h2>
                <strong>{source.status}</strong>
                <p>{source.detail}</p>
              </article>
            ))}
            <article className="source-card action-card">
              <span>导入</span>
              <h2>导入官网巡检结果</h2>
              <p>把脚本生成的官网校招信号加入当前职位库，之后可升级成定时自动同步。</p>
              <button onClick={importOfficialSignals} type="button">导入官网巡检结果</button>
            </article>
          </section>
        )}

        {activeView === "我的秋招" && (
          <section className="kanban">
            {["收藏中", "待投递", "已投递", "面试中"].map((status) => (
              <div key={status}>
                <h2>{status}</h2>
                {jobs.filter((job) => job.status === status).map((job) => (
                  <article key={job.id}>
                    <strong>{job.company}</strong>
                    <span>{job.title}</span>
                  </article>
                ))}
              </div>
            ))}
          </section>
        )}

        {activeView === "面试日历" && (
          <section className="empty-panel">
            <h2>面试日历</h2>
            <p>下一步会把投递流程里的笔试、面试、复盘和提醒统一放到这里。</p>
          </section>
        )}
      </section>

      <button
        aria-label="摸摸狗头，增加 offer 计数"
        className={`dog-buddy ${isDogHappy ? "dog-buddy--happy" : ""}`}
        onPointerDown={petOfferDog}
        style={{
          "--dog-x": `${dogPosition.x}vw`,
          "--dog-y": `${dogPosition.y}vh`,
        } as CSSProperties}
        type="button"
      >
        <span className="offer-pop" key={offerCount}>{offerCount > 0 ? `offer +${offerCount}` : "offer +1"}</span>
        <video aria-hidden="true" autoPlay loop muted playsInline src="/assets/showcase/offer-dog.mp4" />
      </button>
    </main>
  );
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
  onStatusChange: (jobId: string, status: Job["status"]) => void;
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
                    {job.city.split(/[、,，/]/).slice(0, 5).map((city) => <span key={city}>{city}</span>)}
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
