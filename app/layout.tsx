import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoe's Portfolio｜曾依 Zoe Zeng",
  description: "曾依的个人作品集，展示海外 SEO 内容增长、AI 工作流、Offer Cat 求职管理工作台、AI 译文质量评估与项目运营经历。",
  openGraph: {
    title: "Zoe's Portfolio",
    description: "Content strategy, AI workflow, product operations, and research-driven project work.",
    type: "website",
  },
  icons: {
    icon: "/assets/brand/offercat-logo.png",
    shortcut: "/assets/brand/offercat-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
