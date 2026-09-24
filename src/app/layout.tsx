import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Шпион — игра для компании",
  description: "Party-игра «Шпион» для компании с одного телефона. Найди шпиона, пока он не вычислил слово.",
  applicationName: "Шпион",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Шпион",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#060608",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="grain min-h-full">
        <div className="app-frame">{children}</div>
      </body>
    </html>
  );
}
