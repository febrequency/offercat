import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "曾依 Zoe Zeng｜增长内容策略与 AI 工作流作品集",
  description: "曾依的个人作品集，展示海外 SEO 内容增长、AI 工作流、Offer Cat 求职管理工作台、AI 译文质量评估与项目运营经历。",
  openGraph: {
    title: "Zoe Zeng Portfolio",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
