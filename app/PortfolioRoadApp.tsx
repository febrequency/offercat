"use client";

/* eslint-disable @next/next/no-img-element -- Vinext dev image optimization currently crashes on local assets. */
import { type CSSProperties, type KeyboardEvent, type WheelEvent, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  nav: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  image?: string;
  projectUrl?: string;
  stats: Array<{ value: string; label: string }>;
  notes: string[];
  modules?: Array<{
    title: string;
    subtitle: string;
    body: string;
    image: string;
  }>;
  gallery?: Array<{
    title: string;
    image: string;
  }>;
};

type PortfolioStageStyle = CSSProperties & {
  "--active-page": number;
  "--road-progress": number;
};

type RoadStopStyle = CSSProperties & {
  "--stop-left": string;
  "--sign-bottom"?: string;
};

type PhotoStackStyle = CSSProperties & {
  "--stack-index": number;
};

const projectSlides: Slide[] = [
  {
    id: "lark",
    nav: "Lark pSEO",
    eyebrow: "Content Growth",
    title: "Lark海外内容增长工作流",
    subtitle: "从非品牌词到 Agent 内容链路",
    body: "参与 Lark 海外官网 pSEO 内容增长，围绕 B2B 搜索意图、内容生产、质量评估和线索转化验证增长路径。",
    image: "/assets/portfolio/pseo-workflow.png",
    stats: [
      { value: "50+", label: "官网内容撰写与优化" },
      { value: "33", label: "Google 成功收录文章" },
      { value: "200+", label: "pSEO 页面方案验证" },
    ],
    notes: ["关键词池与搜索意图拆解", "Research / Writer / Review 工作流", "内容质检和品牌表达校准"],
  },
  {
    id: "offercat",
    nav: "Offer Cat",
    eyebrow: "Product Practice",
    title: "个人秋招管理工作台",
    subtitle: "把求职流程从表格碎片变成系统",
    body: "从真实秋招痛点出发，设计并上线个人求职管理工具，整合岗位信息源、投递跟进、日历、待办和笔面试准备。",
    image: "/assets/portfolio/offercat-dashboard.png",
    projectUrl: "https://offercat.ceciliacruon.workers.dev/",
    stats: [
      { value: "5", label: "核心页面上线" },
      { value: "3", label: "自测迭代轮次" },
      { value: "1", label: "完整求职工作流" },
    ],
    notes: ["岗位导入与筛选", "投递状态和日程联动", "Codex 分层 Prompt 协作"],
    modules: [
      {
        title: "求职大盘",
        subtitle: "全局进展总览",
        body: "集中展示投递数量、岗位状态分布和近期待办，快速判断当前进度和当天优先级。",
        image: "/assets/portfolio/offercat-workspace-dashboard.png",
      },
      {
        title: "求职信息源",
        subtitle: "岗位信息集中管理",
        body: "汇总官网、表格和文档岗位，支持 CSV / Excel 导入、字段识别、预览去重和多维筛选。",
        image: "/assets/portfolio/offercat-workspace-source.png",
      },
      {
        title: "Offer 跟进",
        subtitle: "投递状态管理",
        body: "记录岗位从待投递到笔试、面试、结果反馈的完整进度，形成个人求职轻量 CRM。",
        image: "/assets/portfolio/offercat-workspace-tracking.png",
      },
      {
        title: "Offer 日历",
        subtitle: "关键节点提醒",
        body: "管理网申截止、笔试、面试、follow up 和 offer 回复节点，并关联具体岗位。",
        image: "/assets/portfolio/offercat-workspace-calendar.png",
      },
      {
        title: "Offer To Do",
        subtitle: "求职任务拆解",
        body: "把投递、改简历、查公司、准备面试等下一步动作拆成可执行任务。",
        image: "/assets/portfolio/offercat-workspace-todo.png",
      },
      {
        title: "笔面试准备",
        subtitle: "岗位准备工作区",
        body: "为进入笔面试阶段的岗位建立准备空间，沉淀任务、材料、进度和复盘。",
        image: "/assets/portfolio/offercat-workspace-prep.png",
      },
    ],
  },
  {
    id: "research",
    nav: "Evaluation",
    eyebrow: "Evaluation",
    title: "AI 译文质量评估",
    subtitle: "把语言判断转成量化框架",
    body: "对比 ChatGPT、DeepL 与人工译文在学术翻译场景中的质量差异，建立覆盖句法、词汇和可读性的评估框架。",
    stats: [
      { value: "2542", label: "核心期刊摘要语料" },
      { value: "19", label: "量化评估指标" },
      { value: "1", label: "国际会议宣读" },
    ],
    notes: ["术语表达与学术风格分析", "句法复杂度与词汇丰富度指标", "香港理工大学团队认可"],
    gallery: [
      { title: "评估流程", image: "/assets/portfolio/evaluation-workflow.png" },
      { title: "会议宣读现场", image: "/assets/portfolio/evaluation-presentation.jpg" },
      { title: "会议日程收录", image: "/assets/portfolio/evaluation-schedule.jpg" },
    ],
  },
];

const photoCards = [
  {
    id: "portrait",
    index: "01",
    title: "Portrait",
    caption: "Zoe",
    image: "/assets/portfolio/zoe-photo-portrait-web.jpg",
  },
  {
    id: "campus",
    index: "02",
    title: "Campus",
    caption: "Graduation",
    image: "/assets/portfolio/zoe-photo-campus-web.jpg",
  },
  {
    id: "road",
    index: "03",
    title: "Journey",
    caption: "On the road",
    image: "/assets/portfolio/zoe-photo-street-web.jpg",
  },
];

const homeAdvantages = [
  {
    title: "海外增长策略",
    body: "拆解 B2B 搜索意图、非品牌词和多语种内容路径，形成可验证的增长方案。",
  },
  {
    title: "AI 工具提效",
    body: "把 Prompt、Agent 调度和质检流程落成内容生产工作流，提高交付稳定性。",
  },
  {
    title: "项目统筹协同",
    body: "推进内容上线、资源协同和现场交付，在多线任务里保持节奏与秩序。",
  },
];

const educationItems = [
  {
    period: "2024.09-2027.06",
    school: "上海外国语大学",
    degree: "硕士",
    major: "英语语言文学",
  },
  {
    period: "2020.09-2024.06",
    school: "山东大学",
    degree: "本科",
    major: "翻译",
  },
];

export default function PortfolioRoadApp() {
  const slides = useMemo(() => ["home", ...projectSlides.map((slide) => slide.id)], []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const lastWheelAt = useRef(0);

  const progress = slides.length <= 1 ? 0 : activeIndex / (slides.length - 1);
  const roadStops = slides.map((slideId, index) => {
    const project = index > 0 ? projectSlides[index - 1] : null;
    return {
      id: slideId,
      index: String(index + 1).padStart(2, "0"),
      time: index === 0 ? "09:50" : `0${index + 9}:15`,
      title: index === 0 ? "森屿起点" : project?.nav ?? "",
      subtitle: index === 0 ? "个人首页" : project?.subtitle ?? "",
      left: `${7 + progressForStop(index, slides.length) * 82}%`,
      position: "up",
    };
  });
  const activeRoadStop = activeIndex > 0 ? roadStops[activeIndex] : null;
  const activeRoadStopStyle = {
    "--stop-left": activeIndex === 1 ? "66%" : activeIndex === 2 ? "82%" : activeIndex === 3 ? "62%" : "30%",
    "--sign-bottom": activeIndex === 1 ? "150px" : activeIndex === 2 || activeIndex === 3 ? "98px" : "188px",
  } as RoadStopStyle;

  const goTo = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, index)));
  };

  const next = () => goTo(activeIndex + 1);
  const previous = () => goTo(activeIndex - 1);
  const nextPhoto = () => setActivePhotoIndex((current) => (current + 1) % photoCards.length);

  const onWheel = (event: WheelEvent<HTMLElement>) => {
    const now = Date.now();
    const intent = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(intent) < 28 || now - lastWheelAt.current < 620) return;
    lastWheelAt.current = now;
    if (intent > 0) next();
    if (intent < 0) previous();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") previous();
  };

  return (
    <main
      className="portfolio-page horizontal-portfolio"
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{ "--active-page": activeIndex, "--road-progress": progress } as PortfolioStageStyle}
    >
      <div className="reference-map-layer" aria-hidden="true">
        <div className="map-title">
          <strong>Zoe on the Road</strong>
        </div>
        <div className="map-sun" />
        <div className="map-cloud cloud-a" />
        <div className="map-cloud cloud-b" />
      </div>
      <nav className="portfolio-nav slide-topbar" aria-label="作品集导航">
        <div className="portfolio-nav-links">
          {slides.map((slideId, index) => (
            <button
              type="button"
              key={slideId}
              className={activeIndex === index ? "active" : ""}
              onClick={() => goTo(index)}
            >
              {index === 0 ? "Home" : projectSlides[index - 1].nav}
            </button>
          ))}
        </div>
      </nav>

      <section className="slide-stage" aria-label="横向翻页作品集">
        <div className="slide-track">
          <article className="slide-page intro-slide" aria-label="个人首页">
            <div className="intro-left">
              <div className="photo-board photo-stack" aria-label="个人照片展示区">
                {photoCards.map((card, index) => {
                  const stackIndex = (index - activePhotoIndex + photoCards.length) % photoCards.length;
                  return (
                    <button
                      className={`photo-card ${stackIndex === 0 ? "active" : ""}`}
                      type="button"
                      key={card.id}
                      onClick={nextPhoto}
                      style={{ "--stack-index": stackIndex } as PhotoStackStyle}
                      aria-label={`切换照片：${card.title}`}
                    >
                      <span>{card.index}</span>
                      {card.image ? <img src={card.image} alt={card.title} /> : <i aria-hidden="true" />}
                      <strong>{card.title}</strong>
                      <em>{card.caption}</em>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="intro-copy">
              <h1>
                <small>Hi, I&apos;m</small>
                <span>曾依 Zoe Zeng</span>
              </h1>
              <p>
                我关注海外增长内容、AI 工作流与产品化落地，擅长把搜索意图、用户路径和协作流程拆成可验证的方案。
              </p>
              <section className="intro-section" aria-label="个人优势">
                <h2>个人优势</h2>
                <div className="advantage-list">
                  {homeAdvantages.map((item) => (
                    <article key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </article>
                  ))}
                </div>
              </section>
              <section className="intro-section" aria-label="教育背景">
                <h2>教育背景</h2>
                <div className="education-list">
                  {educationItems.map((item) => (
                    <article key={`${item.period}-${item.school}`}>
                      <time>{item.period}</time>
                      <strong>{item.school}</strong>
                      <span>{item.degree} / {item.major}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </article>

          {projectSlides.map((slide) => (
            <article className={`slide-page project-slide project-slide-${slide.id}`} key={slide.id} aria-label={slide.title}>
              <div className="project-copy">
                <p className="portfolio-kicker">{slide.eyebrow}</p>
                <h2>{slide.title}</h2>
                <strong>{slide.subtitle}</strong>
                <p>{slide.body}</p>
                {slide.id === "lark" ? (
                  <div className="stats-strip lark-copy-stats">
                    {slide.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {slide.id === "offercat" ? (
                  <div className="stats-strip offercat-copy-stats">
                    {slide.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {slide.id !== "lark" ? (
                  <div className="project-notes">
                    {slide.notes.map((note) => (
                      <span key={note}>{note}</span>
                    ))}
                  </div>
                ) : null}
                {slide.projectUrl ? (
                  <a
                    className="project-live-link"
                    href={slide.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看线上项目
                  </a>
                ) : null}
              </div>

              <div className="project-visual">
                {slide.id === "offercat" && slide.modules ? (
                  <div className="offercat-module-board" aria-label="Offer Cat 六个工作区">
                    {slide.modules.map((module) => (
                      <article className="offercat-module-card" key={module.title}>
                        <img
                          src={module.image}
                          alt={`${module.title} 页面截图`}
                          width={640}
                          height={360}
                          sizes="(max-width: 900px) 100vw, 24vw"
                        />
                        <div>
                          <span>{module.subtitle}</span>
                          <strong>{module.title}</strong>
                          <p>{module.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : slide.id === "research" && slide.gallery ? (
                  <div className="evaluation-gallery" aria-label="AI 译文质量评估项目图片">
                    {slide.gallery.map((item) => (
                      <figure key={item.title}>
                        <img
                          src={item.image}
                          alt={item.title}
                          width={640}
                          height={520}
                          sizes="(max-width: 900px) 100vw, 28vw"
                        />
                        <figcaption>{item.title}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : slide.image ? (
                  <img
                    src={slide.image}
                    alt={`${slide.title} 项目截图`}
                    width={980}
                    height={560}
                    sizes="(max-width: 900px) 100vw, 48vw"
                  />
                ) : null}
                {slide.id !== "lark" && slide.id !== "offercat" ? (
                  <div className="stats-strip">
                    {slide.stats.map((stat) => (
                      <div key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="bottom-road">
        <div className="road-side-signs">
          {activeRoadStop ? (
            <div
              className={`reference-road-sign ${activeRoadStop.position} current`}
              style={activeRoadStopStyle}
              aria-hidden="true"
            >
              <span>{activeRoadStop.index}</span>
              <small>{activeRoadStop.time}</small>
              <strong>{activeRoadStop.title}</strong>
              <em>{activeRoadStop.subtitle}</em>
            </div>
          ) : null}
        </div>
        <div className="road-house" aria-hidden="true">
          <img
            src="/assets/portfolio/wood_house_web.png"
            alt=""
            width={372}
            height={399}
          />
        </div>
        <div className="road-line" aria-hidden="true" />
        <div className="slide-car" aria-hidden="true">
          <div className="vehicle-body">
            <span />
            <span />
            <span />
          </div>
          <div className="vehicle-wheel left">
            <i />
          </div>
          <div className="vehicle-wheel right">
            <i />
          </div>
        </div>
        <div className="road-stops" aria-hidden="true">
          {slides.map((slideId, index) => (
            <i key={slideId} className={activeIndex === index ? "active" : ""} />
          ))}
        </div>
      </div>

      <div className="slide-controls" aria-label="页面切换">
        <button type="button" onClick={previous} disabled={activeIndex === 0}>
          ←
        </button>
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        <button type="button" onClick={next} disabled={activeIndex === slides.length - 1}>
          →
        </button>
      </div>

    </main>
  );
}

function progressForStop(index: number, total: number) {
  return total <= 1 ? 0 : index / (total - 1);
}
