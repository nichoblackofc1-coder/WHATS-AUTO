import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopLoader } from "@/components/ui/top-loader";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_DESCRIPTION = "Central do WhatsApp com vários dispositivos, respostas automáticas, API e gerenciamento de sessões.";

function getAppUrl(): URL {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://wa-akg.app");
  try {
    const formatted = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;
    return new URL(formatted);
  } catch {
    return new URL("https://wa-akg.app");
  }
}

const appUrlObj = getAppUrl();
const APP_URL = appUrlObj.toString();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const appName = process.env.APP_NAME || "WA-AKG";
  const appDefaultTitle = `${appName} | Central do WhatsApp`;

  return {
    metadataBase: appUrlObj,
    title: {
      default: appDefaultTitle,
      template: `%s | ${appName}`,
    },
    description: APP_DESCRIPTION,
    applicationName: appName,
    generator: "Next.js",
    keywords: [
      "whatsapp gateway", "whatsapp api", "whatsapp bot", "whatsapp management",
      "self-hosted", "wa gateway", "whatsapp multi-device", "auto-reply",
      "whatsapp dashboard", "whatsapp web api"
    ],
    referrer: "origin-when-cross-origin",
    authors: [{ name: appName }],
    creator: appName,
    publisher: appName,
    formatDetection: { telephone: false },
    robots: {
      index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
      follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
      googleBot: {
        index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
        follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: appName,
      title: appDefaultTitle,
      description: APP_DESCRIPTION,
      url: APP_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: appDefaultTitle,
      description: APP_DESCRIPTION,
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": appName,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Conditional robots meta (noindex for staging/dev) */}
        {!allowIndexing && <meta name="robots" content="noindex, nofollow" />}
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href={APP_URL} />
        <link rel="preconnect" href={APP_URL} crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/30 selection:text-primary-foreground min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Global ambient background glow for premium feel */}
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background pointer-events-none" suppressHydrationWarning={true} />
        <Providers>
          <TopLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
