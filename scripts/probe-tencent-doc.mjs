import zlib from "node:zlib";

const sources = [
  {
    name: "华南央国企校招信息分享表",
    pageUrl: "https://docs.qq.com/sheet/DRHBtRmpoRk5OSEZy",
    opendocUrl:
      "https://docs.qq.com/dop-api/opendoc?u=&noEscape=1&enableSmartsheetSplit=1&tab=BB08J2&startrow=0&endrow=60&needSheetState=1&sliceStates=1&block_end_col=31&block_end_row=255&block_start_col=0&block_start_row=0&id=DRHBtRmpoRk5OSEZy&normal=1&outformat=1&wb=1&nowb=0&callback=clientVarsCallback&xsrf=",
  },
  {
    name: "27届实习提前批秋招汇总",
    pageUrl: "https://docs.qq.com/smartsheet/DRHVEc05MbE5CYUZa",
    opendocUrl:
      "https://docs.qq.com/dop-api/opendoc?u=&noEscape=1&enableSmartsheetSplit=1&supportOptimizedVer=2&tab=txXSWu&viewId=vKDwbQ&startrow=0&endrow=60&id=DRHVEc05MbE5CYUZa&normal=1&outformat=1&wb=1&nowb=0&callback=clientVarsCallback&xsrf=",
  },
];

const source = sources.find((item) => process.argv.includes(item.name)) ?? sources[0];

const pageResponse = await fetch(source.pageUrl, {
  headers: { "user-agent": "Mozilla/5.0" },
});
const cookie = (pageResponse.headers.get("set-cookie") || "")
  .split(",")
  .map((part) => part.split(";")[0])
  .join("; ");

const opendocResponse = await fetch(`${source.opendocUrl}&t=${crypto.randomUUID()}`, {
  headers: {
    cookie,
    referer: source.pageUrl,
    "user-agent": "Mozilla/5.0",
  },
});

const jsonp = await opendocResponse.text();
const json = JSON.parse(jsonp.replace(/^clientVarsCallback\(/, "").replace(/\)$/, ""));
const textBlock = json.clientVars.collab_client_vars.initialAttributedText.text[0];
const compressedBlocks = [
  textBlock.workbook,
  ...(textBlock.block_datas || []).map((block) => block.related_sheet),
].filter(Boolean);

const readableStrings = compressedBlocks.flatMap((block) => {
  const inflated = zlib.inflateSync(Buffer.from(block, "base64")).toString("utf8");
  return [...inflated.matchAll(/[\u4e00-\u9fa5A-Za-z0-9_（）()【】\-—·,.，。:：/]{2,}/g)]
    .map((match) => match[0])
    .filter((item) => !/^\d+$/.test(item) && item.length <= 80);
});

const uniqueStrings = [...new Set(readableStrings)];
const headerIndex = uniqueStrings.findIndex((item) => item.includes("更新时间"));
const sampleStart = headerIndex >= 0 ? headerIndex : 0;

console.log(
  JSON.stringify(
    {
      source: source.name,
      title: json.clientVars.title,
      maxRow: textBlock.max_row,
      maxCol: textBlock.max_col,
      sample: uniqueStrings.slice(sampleStart, sampleStart + 120),
    },
    null,
    2,
  ),
);
