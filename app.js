const STORAGE_KEY = "autumn-tracker-jobs";

const statuses = ["收藏中", "待投递", "已投递", "笔试", "面试中", "Offer", "已拒绝"];

const sourceDocs = [
  {
    name: "27届实习提前批秋招汇总",
    category: "互联网 / 提前批",
    url: "https://docs.qq.com/smartsheet/DRHVEc05MbE5CYUZa",
    method: "已发现 opendoc 数据口；下一步解析智能表格记录。",
  },
  {
    name: "华南央国企校招信息分享表",
    category: "央国企 / 华南",
    url: "https://docs.qq.com/sheet/DRHBtRmpoRk5OSEZy",
    method: "已验证可读取并解压工作簿文本，样例已可导入。",
  },
  {
    name: "江浙沪央国企校招信息分享表",
    category: "央国企 / 江浙沪",
    url: "https://docs.qq.com/sheet/DRGtwaFNWWFJLU2V5",
    method: "同类在线表格，可沿用 opendoc 探针继续解析。",
  },
];

const tencentDocSampleJobs = [
  {
    company: "杰瑞集团",
    title: "2027届校园招聘",
    industry: "能源装备 / 制造",
    city: "北京、成都、天津、烟台、上海、深圳、青岛、海外多地",
    deadline: "招满即止",
    applyUrl: "",
    batch: "校招",
    companyType: "民营企业",
    education: "本科可报、硕士可报、博士可报",
    tags: ["能源装备", "工程技术", "制造业", "校招", "27届可报"],
    description: "来自腾讯文档《华南央国企校招信息分享表》的可读取样例数据。",
  },
  {
    company: "珠海全志科技股份有限公司",
    title: "芯片 / 软件 / 硬件相关岗位",
    industry: "半导体与电子",
    city: "珠海、西安、上海",
    deadline: "",
    applyUrl: "",
    batch: "实习",
    companyType: "民营企业",
    education: "本科可报、硕士可报、博士可报",
    tags: ["半导体与电子", "硬件/芯片", "软件研发", "电子信息与集成电路"],
    description: "从腾讯文档压缩工作簿中抽取到企业、招聘类型、城市等字段。",
  },
  {
    company: "RoboSense",
    title: "智能驾驶 / 感知算法相关岗位",
    industry: "自动驾驶 / AI",
    city: "深圳、上海",
    deadline: "7.15截止",
    applyUrl: "",
    batch: "校招",
    companyType: "民营企业",
    education: "本科可报、硕士可报",
    tags: ["AI/算法", "自动驾驶", "机器学习算法", "软件研发"],
    description: "从腾讯文档压缩工作簿中抽取到企业名称、岗位城市、截止信息。",
  },
  {
    company: "科华数据",
    title: "数据中心 / 电力电子相关岗位",
    industry: "新能源 / 数据中心",
    city: "深圳、厦门、漳州",
    deadline: "",
    applyUrl: "",
    batch: "校招",
    companyType: "央企/国企",
    education: "硕士可报、博士可报",
    tags: ["新能源", "数据中心", "电力电子", "央企/国企"],
    description: "从腾讯文档压缩工作簿中抽取到企业名称、企业类型、城市和学历要求。",
  },
  {
    company: "卓越教育",
    title: "教研 / 运营 / 技术相关岗位",
    industry: "教育科技",
    city: "广州、深圳、佛山、东莞、中山、珠海、江门",
    deadline: "",
    applyUrl: "",
    batch: "校招",
    companyType: "民营企业",
    education: "本科可报、硕士可报",
    tags: ["教育科技", "运营", "产品/项目", "27届可报", "26届可报"],
    description: "从腾讯文档压缩工作簿中抽取到企业名称、招聘对象和城市。",
  },
];

const skillKeywords = [
  "Python",
  "Java",
  "Go",
  "C++",
  "SQL",
  "MySQL",
  "Redis",
  "React",
  "Vue",
  "Next.js",
  "Node.js",
  "机器学习",
  "深度学习",
  "大模型",
  "LLM",
  "RAG",
  "数据分析",
  "A/B",
  "产品设计",
  "用户研究",
  "商业分析",
  "项目管理",
];

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `job-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleJobs = [
  {
    id: createId(),
    company: "字节跳动",
    title: "AI 产品经理校招生",
    industry: "互联网 / AI",
    city: "北京",
    deadline: "2026-08-31",
    applyUrl: "https://jobs.bytedance.com/campus",
    status: "待投递",
    priority: "高",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    tags: ["AI/算法", "产品/项目", "数据分析", "互联网"],
    nextAction: "完善 AI 项目经历后投递",
    description:
      "负责 AI 产品需求分析、用户研究、产品设计和项目推进。希望你了解大模型、RAG、数据分析、A/B 实验，有良好的沟通和跨团队协作能力。",
    interviews: [],
    createdAt: "2026-07-20T08:00:00.000Z",
  },
  {
    id: createId(),
    company: "华为",
    title: "软件开发工程师",
    industry: "硬件 / 云计算",
    city: "深圳",
    deadline: "2026-09-15",
    applyUrl: "https://career.huawei.com/reccampportal",
    status: "收藏中",
    priority: "中",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    tags: ["软件研发", "后端与云", "计算机与 AI"],
    nextAction: "确认岗位方向和城市",
    description:
      "参与云服务后台系统开发，要求掌握 Java、Go、SQL、Redis、分布式系统基础，具备良好的工程能力和问题定位能力。",
    interviews: [],
    createdAt: "2026-07-20T08:20:00.000Z",
  },
  {
    id: createId(),
    company: "小米",
    title: "商业分析管培生",
    industry: "智能硬件 / 消费电子",
    city: "北京",
    deadline: "",
    applyUrl: "https://hr.xiaomi.com/campus",
    status: "面试中",
    priority: "高",
    batch: "校招",
    companyType: "民营企业",
    education: "本科及以上",
    tags: ["商业分析", "产品/项目", "数据分析"],
    nextAction: "整理一面复盘，准备业务案例",
    description:
      "围绕业务增长、用户洞察和经营分析开展工作，要求有数据分析、SQL、商业分析、项目管理能力，能独立完成专题分析。",
    interviews: [
      {
        round: "一面",
        scheduledAt: "2026-07-24T10:00",
        questions: "自我介绍；为什么选择小米；讲一个数据分析项目。",
        summary: "需要把项目结论讲得更业务化，补充指标定义。",
        result: "待反馈",
      },
    ],
    createdAt: "2026-07-20T08:40:00.000Z",
  },
];

let jobs = loadJobs();
let selectedJobId = jobs[0]?.id ?? null;

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  views: {
    jobs: document.querySelector("#jobsView"),
    sources: document.querySelector("#sourcesView"),
    board: document.querySelector("#boardView"),
    interviews: document.querySelector("#interviewsView"),
  },
  openJobForm: document.querySelector("#openJobForm"),
  closeJobForm: document.querySelector("#closeJobForm"),
  jobDialog: document.querySelector("#jobDialog"),
  jobForm: document.querySelector("#jobForm"),
  loadSample: document.querySelector("#loadSample"),
  jobList: document.querySelector("#jobList"),
  jobDetail: document.querySelector("#jobDetail"),
  statusBoard: document.querySelector("#statusBoard"),
  interviewList: document.querySelector("#interviewList"),
  sourceList: document.querySelector("#sourceList"),
  csvFileInput: document.querySelector("#csvFileInput"),
  pasteImportText: document.querySelector("#pasteImportText"),
  loadImportSample: document.querySelector("#loadImportSample"),
  loadTencentSample: document.querySelector("#loadTencentSample"),
  loadOfficialSync: document.querySelector("#loadOfficialSync"),
  importJobsButton: document.querySelector("#importJobsButton"),
  importResult: document.querySelector("#importResult"),
  searchInput: document.querySelector("#searchInput"),
  globalSearchInput: document.querySelector("#globalSearchInput"),
  cityFilter: document.querySelector("#cityFilter"),
  batchFilter: document.querySelector("#batchFilter"),
  industryFilter: document.querySelector("#industryFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  clearFilters: document.querySelector("#clearFilters"),
  selectedCount: document.querySelector("#selectedCount"),
  selectAllJobs: document.querySelector("#selectAllJobs"),
  sortSelect: document.querySelector("#sortSelect"),
  metricTotal: document.querySelector("#metricTotal"),
  metricTodo: document.querySelector("#metricTodo"),
  metricInterview: document.querySelector("#metricInterview"),
};

function loadJobs() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleJobs));
    return sampleJobs;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleJobs));
    return sampleJobs;
  }
}

function saveJobs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function getMatchedSkills(description) {
  const text = String(description ?? "").toLowerCase();
  return skillKeywords.filter((keyword) => text.includes(keyword.toLowerCase()));
}

function getFilteredJobs() {
  const keyword = [elements.searchInput.value, elements.globalSearchInput?.value]
    .filter(Boolean)
    .join(" ")
    .trim()
    .toLowerCase();
  const industry = elements.industryFilter.value;
  const tag = elements.statusFilter.value;
  const city = elements.cityFilter.value;
  const batch = elements.batchFilter.value;

  const filteredJobs = jobs.filter((job) => {
    const searchable = [
      job.company,
      job.title,
      job.industry,
      job.city,
      job.description,
      job.batch,
      job.companyType,
      job.education,
      ...(job.tags ?? []),
      getMatchedSkills(job.description).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!keyword || searchable.includes(keyword)) &&
      (industry === "all" || job.industry === industry) &&
      (tag === "all" || (job.tags ?? []).includes(tag)) &&
      (city === "all" || String(job.city ?? "").includes(city)) &&
      (batch === "all" || job.batch === batch)
    );
  });

  if (elements.sortSelect.value === "deadline") {
    return filteredJobs.sort((a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")));
  }

  if (elements.sortSelect.value === "updated") {
    return filteredJobs.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
    );
  }

  return filteredJobs;
}

function renderFilters() {
  const industries = [...new Set(jobs.map((job) => job.industry).filter(Boolean))];
  const cities = [
    ...new Set(
      jobs
        .flatMap((job) => String(job.city ?? "").split(/[、,，/]/))
        .map((city) => city.trim())
        .filter(Boolean),
    ),
  ];
  const tags = [...new Set(jobs.flatMap((job) => job.tags ?? getMatchedSkills(job.description)))];
  const currentCity = elements.cityFilter.value;
  const currentTag = elements.statusFilter.value;

  elements.industryFilter.innerHTML = `<option value="all">不限</option>${industries
    .map((industry) => `<option value="${escapeHtml(industry)}">${escapeHtml(industry)}</option>`)
    .join("")}`;

  elements.cityFilter.innerHTML = `<option value="all">不限</option>${cities
    .map((city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
    .join("")}`;

  elements.statusFilter.innerHTML = `<option value="all">不限</option>${tags
    .map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`)
    .join("")}`;

  elements.cityFilter.value = [...elements.cityFilter.options].some((option) => option.value === currentCity)
    ? currentCity
    : "all";
  elements.statusFilter.value = [...elements.statusFilter.options].some((option) => option.value === currentTag)
    ? currentTag
    : "all";
}

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  elements.metricTotal.textContent = jobs.filter((job) => job.status !== "已拒绝").length;
  elements.metricTodo.textContent = jobs.filter((job) =>
    String(job.createdAt || job.updatedAt || "").startsWith(today),
  ).length;
  elements.metricInterview.textContent = getFilteredJobs().length;
}

function renderJobList() {
  const filteredJobs = getFilteredJobs();

  if (!filteredJobs.length) {
    elements.jobList.innerHTML = `<tr><td colspan="7" class="table-empty">没有匹配岗位，换个关键词或去“信息源”导入数据。</td></tr>`;
    return;
  }

  elements.jobList.innerHTML = filteredJobs
    .map((job) => {
      const tags = [...new Set([...(job.tags ?? []), ...getMatchedSkills(job.description)])].slice(0, 8);
      const extraCount = Math.max(0, [...new Set([...(job.tags ?? []), ...getMatchedSkills(job.description)])].length - tags.length);
      return `
        <tr data-job-id="${job.id}">
          <td><input class="job-checkbox" type="checkbox" data-job-id="${job.id}" /></td>
          <td>
            <div class="company-cell">
              <span class="company-avatar">${escapeHtml(String(job.company || "?").slice(0, 1))}</span>
              <div>
                <strong>${escapeHtml(job.company)}</strong>
                <p>${escapeHtml(job.title)} · ${escapeHtml(job.industry || "未分类")}</p>
              </div>
            </div>
          </td>
          <td>
            <div class="row-actions">
              ${
                job.applyUrl
                  ? `<a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noreferrer">查看官网链接</a>`
                  : `<span class="muted-action">暂无链接</span>`
              }
              <button type="button" data-action="advance-status" data-job-id="${job.id}">加入投递流程</button>
              <button type="button" data-action="favorite" data-job-id="${job.id}">加入兴趣库</button>
            </div>
          </td>
          <td><span class="${job.deadline === "招满即止" ? "deadline-hot" : ""}">${escapeHtml(job.deadline || "待确认")}</span></td>
          <td>${escapeHtml(formatDate(job.updatedAt || job.createdAt))}</td>
          <td><div class="city-tags">${renderCityTags(job.city)}</div></td>
          <td>
            <div class="job-tags">
              ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              ${extraCount ? `<span>+${extraCount}</span>` : ""}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderDetail() {
  if (!elements.jobDetail) return;
  const job = jobs.find((item) => item.id === selectedJobId);

  if (!job) {
    elements.jobDetail.className = "empty-state";
    elements.jobDetail.innerHTML = `<strong>选择一个岗位</strong><p>这里会显示 JD、投递状态、下一步动作和面试记录。</p>`;
    return;
  }

  const skills = getMatchedSkills(job.description);
  const interviewCount = job.interviews?.length ?? 0;

  elements.jobDetail.className = "detail";
  elements.jobDetail.innerHTML = `
    <div class="detail-title">
      <div>
        <span class="eyebrow">${escapeHtml(job.company)}</span>
        <h3>${escapeHtml(job.title)}</h3>
      </div>
      <span class="pill status-${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
    </div>

    <div class="detail-meta">
      <span class="pill">${escapeHtml(job.industry || "未分类")}</span>
      <span class="pill">${escapeHtml(job.city || "城市待定")}</span>
      <span class="pill">截止 ${escapeHtml(job.deadline || "待确认")}</span>
      <span class="pill">${interviewCount} 条面试记录</span>
    </div>

    <div class="detail-section">
      <h4>下一步动作</h4>
      <p>${escapeHtml(job.nextAction || "还没有记录下一步动作。")}</p>
    </div>

    <div class="detail-section">
      <h4>识别到的关键词</h4>
      <div class="tag-row">
        ${
          skills.length
            ? skills.map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`).join("")
            : `<span class="pill">暂无关键词</span>`
        }
      </div>
    </div>

    <div class="detail-section">
      <h4>JD 原文</h4>
      <div class="jd-box">${escapeHtml(job.description || "暂无 JD")}</div>
    </div>

    <div class="detail-actions">
      ${
        job.applyUrl
          ? `<a class="link-button" href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noreferrer">打开投递链接</a>`
          : ""
      }
      <button class="secondary-button" data-action="advance-status">推进状态</button>
      <button class="secondary-button" data-action="add-interview">添加面试记录</button>
      <button class="secondary-button" data-action="delete-job">删除岗位</button>
    </div>
  `;
}

function renderBoard() {
  elements.statusBoard.innerHTML = statuses
    .map((status) => {
      const statusJobs = jobs.filter((job) => job.status === status);
      return `
        <section class="board-column">
          <header>
            <span>${escapeHtml(status)}</span>
            <span class="pill">${statusJobs.length}</span>
          </header>
          <div class="board-items">
            ${
              statusJobs.length
                ? statusJobs
                    .map(
                      (job) => `
                        <article class="mini-card">
                          <strong>${escapeHtml(job.company)}</strong>
                          <span>${escapeHtml(job.title)} · ${escapeHtml(job.city || "城市待定")}</span>
                        </article>
                      `,
                    )
                    .join("")
                : `<article class="mini-card"><span>暂无岗位</span></article>`
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderInterviews() {
  const interviewItems = jobs.flatMap((job) =>
    (job.interviews ?? []).map((interview) => ({ ...interview, job })),
  );

  if (!interviewItems.length) {
    elements.interviewList.innerHTML = `<div class="empty-state"><strong>还没有面试记录</strong><p>在岗位详情里点击“添加面试记录”。</p></div>`;
    return;
  }

  elements.interviewList.innerHTML = interviewItems
    .map(
      (item) => `
        <article class="interview-item">
          <strong>${escapeHtml(item.job.company)} · ${escapeHtml(item.job.title)}</strong>
          <div class="job-meta">
            <span class="pill">${escapeHtml(item.round)}</span>
            <span class="pill">${escapeHtml(formatDateTime(item.scheduledAt))}</span>
            <span class="pill">${escapeHtml(item.result || "待记录")}</span>
          </div>
          <p>${escapeHtml(item.summary || item.questions || "暂无复盘")}</p>
        </article>
      `,
    )
    .join("");
}

function renderSources() {
  elements.sourceList.innerHTML = sourceDocs
    .map(
      (source) => `
        <article class="source-card">
          <div>
            <h4>${escapeHtml(source.name)}</h4>
            <p>${escapeHtml(source.method)}</p>
          </div>
          <div class="job-meta">
            <span class="pill">${escapeHtml(source.category)}</span>
            <span class="pill">腾讯文档</span>
          </div>
          <div class="source-actions">
            <a class="link-button" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">打开文档</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAll({ keepFilters = true } = {}) {
  const currentIndustry = elements.industryFilter.value;
  const currentStatus = elements.statusFilter.value;
  const currentCity = elements.cityFilter.value;
  const currentBatch = elements.batchFilter.value;

  renderFilters();

  if (keepFilters) {
    elements.industryFilter.value = [...elements.industryFilter.options].some(
      (option) => option.value === currentIndustry,
    )
      ? currentIndustry
      : "all";
    elements.statusFilter.value = currentStatus || "all";
    elements.cityFilter.value = [...elements.cityFilter.options].some((option) => option.value === currentCity)
      ? currentCity
      : "all";
    elements.batchFilter.value = currentBatch || "all";
  }

  renderMetrics();
  renderJobList();
  renderDetail();
  renderBoard();
  renderInterviews();
  renderSources();
  updateSelectedCount();
}

function advanceSelectedJobStatus() {
  const job = jobs.find((item) => item.id === selectedJobId);
  if (!job) return;
  const currentIndex = statuses.indexOf(job.status);
  job.status = statuses[Math.min(currentIndex + 1, statuses.length - 1)];
  saveJobs();
  renderAll();
}

function addInterviewToSelectedJob() {
  const job = jobs.find((item) => item.id === selectedJobId);
  if (!job) return;

  const round = prompt("面试轮次", "一面");
  if (!round) return;

  const scheduledAt = prompt("面试时间", "2026-08-01 10:00") ?? "";
  const questions = prompt("面试问题", "") ?? "";
  const summary = prompt("复盘总结", "") ?? "";

  job.interviews = job.interviews ?? [];
  job.interviews.push({
    round,
    scheduledAt,
    questions,
    summary,
    result: "待反馈",
  });
  job.status = "面试中";
  saveJobs();
  renderAll();
}

function deleteSelectedJob() {
  const job = jobs.find((item) => item.id === selectedJobId);
  if (!job) return;
  const confirmed = confirm(`确认删除 ${job.company} · ${job.title} 吗？`);
  if (!confirmed) return;

  jobs = jobs.filter((item) => item.id !== selectedJobId);
  selectedJobId = jobs[0]?.id ?? null;
  saveJobs();
  renderAll();
}

function parseTableText(text) {
  const normalizedText = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalizedText) return [];

  const delimiter = normalizedText.includes("\t") ? "\t" : ",";
  return normalizedText
    .split("\n")
    .map((line) => splitDelimitedLine(line, delimiter).map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function splitDelimitedLine(line, delimiter) {
  if (delimiter === "\t") return line.split("\t");

  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function importRows(rows) {
  if (rows.length < 2) {
    return { added: 0, updated: 0, skipped: 0 };
  }

  const headers = rows[0].map(normalizeHeader);
  const importedJobs = rows
    .slice(1)
    .map((row) => mapRowToJob(headers, row))
    .filter((job) => job.company && job.title);

  let added = 0;
  let updated = 0;
  let skipped = rows.length - 1 - importedJobs.length;

  importedJobs.forEach((job) => {
    const existingIndex = jobs.findIndex((item) => getJobKey(item) === getJobKey(job));
    if (existingIndex >= 0) {
      jobs[existingIndex] = {
        ...jobs[existingIndex],
        ...job,
        id: jobs[existingIndex].id,
        status: jobs[existingIndex].status,
        interviews: jobs[existingIndex].interviews ?? [],
        updatedAt: new Date().toISOString(),
      };
      updated += 1;
    } else {
      jobs.unshift(job);
      added += 1;
    }
  });

  if (added || updated) {
    selectedJobId = jobs[0]?.id ?? selectedJobId;
    saveJobs();
    renderAll({ keepFilters: false });
  }

  return { added, updated, skipped };
}

function mapRowToJob(headers, row) {
  const value = (...keys) => {
    const index = headers.findIndex((header) => keys.includes(header));
    return index >= 0 ? (row[index] ?? "").trim() : "";
  };

  const company = value("company", "公司", "企业", "单位", "招聘单位");
  const title =
    value("title", "岗位", "职位", "岗位名称", "职位名称", "招聘岗位") || "岗位待补充";
  const industry =
    value("industry", "行业", "方向", "类别", "岗位类别", "企业类型") || inferIndustry(company);
  const city = value("city", "城市", "地点", "工作地点", "地区", "工作城市");
  const deadline = normalizeDate(value("deadline", "截止", "截止时间", "网申截止", "投递截止"));
  const applyUrl = value("applyurl", "url", "链接", "投递链接", "网申链接", "投递入口", "原文链接");
  const description = value("description", "jd", "岗位描述", "岗位职责", "要求", "招聘要求", "备注");
  const source = value("source", "来源", "信息源") || "腾讯文档导入";
  const batch = value("batch", "批次", "招聘类型") || inferBatch(row.join(" "));
  const companyType = value("companytype", "企业性质", "企业类型", "单位性质") || inferCompanyType(row.join(" "));
  const education = value("education", "学历", "招聘学历", "学历要求");
  const tags = buildJobTags({ industry, batch, companyType, education, description, title });

  return {
    id: createId(),
    company,
    title,
    industry,
    city,
    deadline,
    applyUrl,
    status: "待投递",
    priority: "中",
    batch,
    companyType,
    education,
    tags,
    description,
    nextAction: "检查岗位详情并决定是否投递",
    source,
    sourceStatus: "new",
    interviews: [],
    createdAt: new Date().toISOString(),
  };
}

function importTencentSampleJobs() {
  const importedJobs = tencentDocSampleJobs.map((job) => ({
    id: createId(),
    status: "待投递",
    priority: "中",
    nextAction: "检查岗位详情并决定是否投递",
    source: "腾讯文档自动抽取样例",
    sourceStatus: "new",
    interviews: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...job,
  }));

  let added = 0;
  let updated = 0;

  importedJobs.forEach((job) => {
    const existingIndex = jobs.findIndex((item) => getJobKey(item) === getJobKey(job));
    if (existingIndex >= 0) {
      jobs[existingIndex] = { ...jobs[existingIndex], ...job, id: jobs[existingIndex].id };
      updated += 1;
    } else {
      jobs.unshift(job);
      added += 1;
    }
  });

  selectedJobId = jobs[0]?.id ?? selectedJobId;
  saveJobs();
  renderAll({ keepFilters: false });
  elements.importResult.textContent = `已导入腾讯文档抓取样例：新增 ${added} 条，更新 ${updated} 条。`;
}

async function importOfficialSyncJobs() {
  try {
    const response = await fetch("./data/synced-official-jobs.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`读取失败：${response.status}`);
    }

    const payload = await response.json();
    const result = importNormalizedJobs(payload.jobs ?? []);
    elements.importResult.textContent = `官网巡检结果已导入：新增 ${result.added} 条，更新 ${result.updated} 条。巡检时间：${
      payload.generatedAt || "未知"
    }`;
  } catch (error) {
    elements.importResult.textContent = `暂时无法导入官网巡检结果：${error.message}。请先运行 node scripts/sync-official-careers.mjs，并通过本地预览服务打开页面。`;
  }
}

function importNormalizedJobs(normalizedJobs) {
  let added = 0;
  let updated = 0;

  normalizedJobs.forEach((job) => {
    if (!job.company || !job.title) return;

    const normalizedJob = {
      id: createId(),
      company: job.company,
      title: job.title,
      industry: job.industry || inferIndustry(job.company),
      city: job.city || "待确认",
      deadline: job.deadline || "待确认",
      applyUrl: job.applyUrl || job.sourceUrl || "",
      status: job.status || "待投递",
      priority: job.priority || "中",
      batch: job.batch || "校招",
      companyType: job.companyType || inferCompanyType(job.company),
      education: job.education || "",
      tags: job.tags?.length ? job.tags : buildJobTags(job),
      description: job.description || "",
      nextAction: job.nextAction || "确认岗位详情并决定是否投递",
      source: job.source || "官网巡检导入",
      sourceProvider: job.sourceProvider || "official-page",
      sourceUrl: job.sourceUrl || job.applyUrl || "",
      sourceStatus: job.sourceStatus || "new",
      interviews: job.interviews || [],
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: job.updatedAt || new Date().toISOString(),
    };

    const existingIndex = jobs.findIndex((item) => getJobKey(item) === getJobKey(normalizedJob));
    if (existingIndex >= 0) {
      jobs[existingIndex] = {
        ...jobs[existingIndex],
        ...normalizedJob,
        id: jobs[existingIndex].id,
        status: jobs[existingIndex].status,
        interviews: jobs[existingIndex].interviews ?? [],
      };
      updated += 1;
    } else {
      jobs.unshift(normalizedJob);
      added += 1;
    }
  });

  selectedJobId = jobs[0]?.id ?? selectedJobId;
  saveJobs();
  renderAll({ keepFilters: false });
  return { added, updated };
}

function normalizeHeader(header) {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[：:]/g, "");
}

function normalizeDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const match = text.match(/(20\d{2})[./年-](\d{1,2})[./月-](\d{1,2})/);
  if (!match) return text;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "待确认";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function renderCityTags(cityText) {
  const cities = String(cityText || "城市待定")
    .split(/[、,，/]/)
    .map((city) => city.trim())
    .filter(Boolean)
    .slice(0, 5);

  return cities.map((city) => `<span>${escapeHtml(city)}</span>`).join("");
}

function inferIndustry(company) {
  const name = String(company ?? "");
  if (/银行|证券|保险|基金|农信|金融/.test(name)) return "金融 / 央国企";
  if (/电网|电力|能源|石油|石化|中核|华电|国电|南网/.test(name)) return "能源 / 央国企";
  if (/大学|学院|研究所|研究院|高校/.test(name)) return "高校 / 科研";
  if (/腾讯|阿里|字节|百度|美团|快手|京东|网易|小米/.test(name)) return "互联网";
  return "待分类";
}

function inferBatch(text) {
  if (/实习|intern/i.test(text)) return "实习";
  return "校招";
}

function inferCompanyType(text) {
  if (/央企|国企/.test(text)) return "央企/国企";
  if (/事业单位|高校|大学|研究院|研究所/.test(text)) return "事业单位";
  if (/外企/.test(text)) return "外企";
  return "民营企业";
}

function buildJobTags(job) {
  const text = [job.industry, job.batch, job.companyType, job.education, job.description, job.title].join(" ");
  const tags = [job.industry, job.batch, job.companyType, job.education]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[、,，/]/))
    .map((tag) => tag.trim())
    .filter(Boolean);

  const ruleTags = [
    [/算法|机器学习|大模型|AI|人工智能/i, "AI/算法"],
    [/软件|开发|后端|前端|Java|Python|Go|C\+\+/i, "软件研发"],
    [/硬件|芯片|半导体|集成电路/i, "硬件/芯片"],
    [/产品|项目|运营/i, "产品/项目"],
    [/数据|SQL|分析/i, "数据分析"],
    [/央企|国企/i, "央企"],
  ]
    .filter(([pattern]) => pattern.test(text))
    .map(([, tag]) => tag);

  return [...new Set([...tags, ...ruleTags])].slice(0, 12);
}

function getJobKey(job) {
  return [job.company, job.title, job.city, job.applyUrl]
    .map((part) =>
      String(part ?? "")
        .trim()
        .toLowerCase(),
    )
    .join("|");
}

function handleImportText(text) {
  const rows = parseTableText(text);
  const result = importRows(rows);
  elements.importResult.textContent = `导入完成：新增 ${result.added} 条，更新 ${result.updated} 条，跳过 ${result.skipped} 条。`;
}

function formatDateTime(value) {
  if (!value) return "时间待定";
  return value.replace("T", " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const viewName = item.dataset.view;
    elements.navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
    Object.entries(elements.views).forEach(([name, view]) => {
      view.classList.toggle("active", name === viewName);
    });
  });
});

elements.openJobForm.addEventListener("click", () => elements.jobDialog.showModal());
elements.closeJobForm.addEventListener("click", () => elements.jobDialog.close());

elements.loadSample.addEventListener("click", () => {
  const form = elements.jobForm;
  form.company.value = "美团";
  form.title.value = "数据产品经理";
  form.industry.value = "本地生活 / 数据";
  form.city.value = "北京";
  form.deadline.value = "2026-09-10";
  form.applyUrl.value = "https://zhaopin.meituan.com";
  form.status.value = "待投递";
  form.priority.value = "高";
  form.description.value =
    "负责数据产品规划、指标体系建设、业务分析和跨团队项目推进。要求熟悉 SQL、数据分析、A/B 实验、用户研究，有良好的产品设计能力。";
  form.nextAction.value = "把数据分析项目改成更贴近业务增长的表达";
});

elements.loadImportSample.addEventListener("click", () => {
  elements.pasteImportText.value =
    "公司\t岗位\t行业\t城市\t投递链接\t截止时间\t岗位描述\n腾讯\t产品经理实习生\t互联网 / 产品\t深圳\thttps://careers.tencent.com/campusrecruit.html\t2026-08-31\t负责产品需求分析、用户研究和数据分析\n南方电网\t数字化管培生\t能源 / 央国企\t广州\thttps://example.com\t2026-09-15\t参与数字化项目管理、业务分析和系统建设";
});

elements.importJobsButton.addEventListener("click", () => {
  handleImportText(elements.pasteImportText.value);
});

elements.loadTencentSample.addEventListener("click", importTencentSampleJobs);
elements.loadOfficialSync.addEventListener("click", importOfficialSyncJobs);

elements.csvFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  elements.pasteImportText.value = text;
  handleImportText(text);
  event.target.value = "";
});

elements.jobForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.jobForm);
  const job = {
    id: createId(),
    company: data.get("company").trim(),
    title: data.get("title").trim(),
    industry: data.get("industry").trim(),
    city: data.get("city").trim(),
    deadline: data.get("deadline"),
    applyUrl: data.get("applyUrl").trim(),
    status: data.get("status"),
    priority: data.get("priority"),
    batch: inferBatch(`${data.get("title")} ${data.get("description")}`),
    companyType: inferCompanyType(`${data.get("company")} ${data.get("industry")}`),
    education: "",
    tags: buildJobTags({
      industry: data.get("industry").trim(),
      batch: inferBatch(`${data.get("title")} ${data.get("description")}`),
      companyType: inferCompanyType(`${data.get("company")} ${data.get("industry")}`),
      education: "",
      description: data.get("description").trim(),
      title: data.get("title").trim(),
    }),
    description: data.get("description").trim(),
    nextAction: data.get("nextAction").trim(),
    interviews: [],
    createdAt: new Date().toISOString(),
  };

  jobs = [job, ...jobs];
  selectedJobId = job.id;
  saveJobs();
  elements.jobForm.reset();
  elements.jobDialog.close();
  renderAll({ keepFilters: false });
});

elements.jobList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    selectedJobId = actionButton.dataset.jobId;
    const job = jobs.find((item) => item.id === selectedJobId);
    if (!job) return;
    if (actionButton.dataset.action === "advance-status") job.status = "已投递";
    if (actionButton.dataset.action === "favorite") job.status = "收藏中";
    saveJobs();
    renderAll();
    return;
  }

  if (event.target.matches(".job-checkbox")) {
    updateSelectedCount();
    return;
  }

  const row = event.target.closest("[data-job-id]");
  if (!row) return;
  selectedJobId = row.dataset.jobId;
  renderAll();
});

elements.jobDetail?.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (action === "advance-status") advanceSelectedJobStatus();
  if (action === "add-interview") addInterviewToSelectedJob();
  if (action === "delete-job") deleteSelectedJob();
});

elements.searchInput.addEventListener("input", () => renderAll());
elements.globalSearchInput.addEventListener("input", () => {
  elements.searchInput.value = elements.globalSearchInput.value;
  renderAll();
});
elements.cityFilter.addEventListener("change", () => renderAll());
elements.batchFilter.addEventListener("change", () => renderAll());
elements.industryFilter.addEventListener("change", () => renderAll());
elements.statusFilter.addEventListener("change", () => renderAll());
elements.sortSelect.addEventListener("change", () => renderAll());
elements.clearFilters.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.globalSearchInput.value = "";
  elements.cityFilter.value = "all";
  elements.batchFilter.value = "all";
  elements.industryFilter.value = "all";
  elements.statusFilter.value = "all";
  renderAll({ keepFilters: false });
});
elements.selectAllJobs.addEventListener("change", () => {
  document.querySelectorAll(".job-checkbox").forEach((checkbox) => {
    checkbox.checked = elements.selectAllJobs.checked;
  });
  updateSelectedCount();
});

function updateSelectedCount() {
  if (!elements.selectedCount) return;
  elements.selectedCount.textContent = document.querySelectorAll(".job-checkbox:checked").length;
}

renderAll({ keepFilters: false });
