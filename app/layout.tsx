import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "offercat",
  description: "秋招信息与投递进程工作台，帮你把分散的校招数据整理成自己的岗位库。",
  openGraph: {
    title: "offercat",
    description: "把分散的校招信息，变成你的可投递岗位库。",
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
