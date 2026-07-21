import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "offercat",
  description: "秋招信息与投递进程工作台，帮你把分散的校招数据整理成自己的岗位库。",
  openGraph: {
    title: "offercat",
    description: "把分散的校招信息，变成你的可投递岗位库。",
    type: "website",
  },
  icons: {
    icon: "/assets/offercat-mark.svg",
    shortcut: "/assets/offercat-mark.svg",
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
        {children}
      </body>
    </html>
  );
}
