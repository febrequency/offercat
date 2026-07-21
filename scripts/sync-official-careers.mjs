import fs from "node:fs/promises";
import path from "node:path";

const ROOT = new URL("..", import.meta.url);
const SOURCES_FILE = new URL("../data/company-sources.json", import.meta.url);
const OUTPUT_FILE = new URL("../data/synced-official-jobs.json", import.meta.url);
const PUBLIC_OUTPUT_FILE = new URL("../public/data/synced-official-jobs.json", import.meta.url);

const SIGNAL_KEYWORDS = [
  "2027",
  "27届",
  "2027届",
  "校招",
  "校园招聘",
  "应届",
  "毕业生",
  "提前批",
  "实习",
  "intern",
  "campus",
  "graduate",
];

const JOB_KEYWORDS = ["岗位", "职位", "招聘", "投递", "网申", "申请", "job", "career", "position"];

const headers = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "user-agent": "Mozilla/5.0 offercat-official-career-sync/0.1",
};

const sources = JSON.parse(await fs.readFile(SOURCES_FILE, "utf8"));
const enabledSources = sources.filter((source) => source.enabled);
const sourceReports = [];
const jobs = [];

for (const source of enabledSources) {
  const report = await inspectOfficialPage(source);
  sourceReports.push(report);

  if (report.status === "ok" && report.signalHits.length) {
    jobs.push(createSignalJob(source, report));
  }

  await wait(600);
}

const output = {
  generatedAt: new Date().toISOString(),
  jobs: mergeJobs(jobs),
  sourceReports,
};

await fs.mkdir(new URL("../data/", import.meta.url), { recursive: true });
await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
await fs.mkdir(new URL("../public/data/", import.meta.url), { recursive: true });
await fs.writeFile(PUBLIC_OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);

console.log(`offercat 官网巡检完成：${output.jobs.length} 条可导入信号，${sourceReports.length} 个数据源。`);
console.log(`输出文件：${path.relative(process.cwd(), new URL(OUTPUT_FILE).pathname)}`);

async function inspectOfficialPage(source) {
  const startedAt = Date.now();

  try {
    const response = await fetchWithTimeout(source.careerUrl, 18000);
    const html = await response.text();
    const title = extractTitle(html);
    const visibleText = toVisibleText(html);
    const signalHits = SIGNAL_KEYWORDS.filter((keyword) =>
      visibleText.toLowerCase().includes(keyword.toLowerCase()),
    );
    const matchedLinks = extractRelevantLinks(html, source.careerUrl).slice(0, 8);

    return {
      sourceId: source.id,
      company: source.company,
      url: source.careerUrl,
      finalUrl: response.url,
      status: response.ok ? "ok" : "http_error",
      httpStatus: response.status,
      title,
      signalHits,
      matchedLinks,
      pageTextSample: visibleText.slice(0, 500),
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      sourceId: source.id,
      company: source.company,
      url: source.careerUrl,
      status: "error",
      error: error.message,
      signalHits: [],
      matchedLinks: [],
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function createSignalJob(source, report) {
  const strongestKeyword = report.signalHits.find((keyword) => /2027|27届/.test(keyword));
  const titlePrefix = strongestKeyword ? "2027届校招官网巡检" : "校招官网巡检";
  const link = report.matchedLinks[0]?.href || report.finalUrl || source.careerUrl;
  const descriptionLines = [
    `${source.company} 官网页面出现这些招聘信号：${report.signalHits.join("、")}`,
    report.matchedLinks.length
      ? `页面内相关链接：${report.matchedLinks.map((item) => `${item.text || "链接"} ${item.href}`).join("；")}`
      : "暂未从首页抽取到具体岗位链接，需要后续写专属 adapter。",
    `页面标题：${report.title || "未识别"}`,
  ];

  return {
    company: source.company,
    title: `${titlePrefix}`,
    industry: source.industry,
    city: "待确认",
    deadline: "待确认",
    applyUrl: link,
    status: "待投递",
    priority: source.priority === 1 ? "高" : "中",
    batch: "校招",
    companyType: inferCompanyType(source.company),
    education: "2027届优先确认",
    tags: buildTags(source, report),
    description: descriptionLines.join("\n"),
    nextAction: "打开官网链接确认具体岗位，并为该公司补充专属 adapter。",
    source: "官网自动巡检",
    sourceProvider: source.provider,
    sourceUrl: source.careerUrl,
    sourceStatus: "new",
    createdAt: report.checkedAt,
    updatedAt: report.checkedAt,
  };
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtml(match?.[1] || "").trim();
}

function toVisibleText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function extractRelevantLinks(html, baseUrl) {
  const links = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorPattern.exec(html))) {
    const href = normalizeUrl(match[1], baseUrl);
    const text = toVisibleText(match[2]).slice(0, 80);
    const haystack = `${href} ${text}`.toLowerCase();
    const isRelevant =
      SIGNAL_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase())) ||
      JOB_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase()));

    if (href && isRelevant) {
      links.push({ text, href });
    }
  }

  return dedupeBy(links, (link) => link.href);
}

function normalizeUrl(value, baseUrl) {
  if (!value || value.startsWith("javascript:") || value.startsWith("#")) return "";
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function buildTags(source, report) {
  return [
    "官网巡检",
    "2027届",
    "校招",
    source.industry,
    ...report.signalHits.filter((keyword) => keyword.length <= 8),
  ].filter(Boolean);
}

function inferCompanyType(company) {
  if (/华为|腾讯|字节|阿里|美团|百度|快手|京东|网易|小米|拼多多/.test(company)) {
    return "民营企业";
  }

  return "待确认";
}

function mergeJobs(items) {
  return dedupeBy(items, (job) =>
    [job.company, job.title, job.city, job.applyUrl].map((part) => String(part ?? "").trim()).join("|"),
  );
}

function dedupeBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
