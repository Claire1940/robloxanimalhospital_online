"use client";

import { Suspense, lazy } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Coins,
  Crown,
  ExternalLink,
  Gift,
  HeartPulse,
  MessageCircle,
  ScanSearch,
  Sparkles,
  Syringe,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span.
// linkData only exists when buildModuleLinkMap matched a real article, so this
// never produces a dead internal link — it falls back to plain text otherwise.
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://robloxanimalhospital.online";

  // Tools Grid 卡片 -> 模块 section 锚点（顺序与 en.json tools.cards 一一对应）
  const toolSectionIds = [
    "codes",
    "beginner-guide",
    "anomalies",
    "classes",
    "sanity",
    "items",
    "coins",
    "updates",
  ];

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Roblox Animal Hospital Wiki",
        description:
          "Animal Hospital Wiki with Roblox codes, anomaly guides, class tips, patient tasks, shift survival, enemies, updates, and beginner help for every player.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Animal Hospital - Roblox Survival Horror Hospital",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Roblox Animal Hospital Wiki",
        alternateName: "Roblox Animal Hospital",
        url: siteUrl,
        description:
          "Complete Animal Hospital Wiki resource hub for Roblox codes, anomalies, classes, patients, enemies, shifts, and survival guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Animal Hospital Wiki - Roblox Survival Horror Hospital",
        },
        sameAs: [
          "https://www.roblox.com/games/78515283254292/Animal-Hospital",
          "https://www.roblox.com/communities/344908697/Animal-Anomaly",
          "https://discord.com/invite/robloxanimalhospital",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Animal Hospital (Anomaly)",
        gamePlatform: ["Web Browser", "Roblox"],
        applicationCategory: "Game",
        genre: ["Survival Horror", "Simulation", "Multiplayer"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 30,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: "0",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/78515283254292/Animal-Hospital",
        },
      },
      {
        "@type": "VideoObject",
        name: "I Found EVERY ANOMALY in Animal Hospital (Anomaly)",
        description:
          "Animal Hospital (Anomaly) gameplay video showing how to find and handle every anomaly during the night shift.",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/3awzFWk-Hpk",
        url: "https://www.youtube.com/watch?v=3awzFWk-Hpk",
      },
    ],
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 状态徽章颜色映射（基于 Tailwind 语义状态色，非主题色硬编码）
  const severityStyles: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    high: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    medium: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    low: "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)]",
  };
  const meterStyles: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    high: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    recovery: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    prevention: "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]",
  };
  const tierStyles: Record<string, string> = {
    S: "bg-[hsl(var(--nav-theme)/0.15)] border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))]",
    A: "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]",
    B: "bg-white/5 border-border text-foreground",
    C: "bg-white/5 border-border text-muted-foreground",
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/78515283254292/Animal-Hospital"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 之后，宽度上限 max-w-5xl 避免挤压广告 */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="3awzFWk-Hpk"
              title="I Found EVERY ANOMALY in Animal Hospital (Anomaly)"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards，位于视频区之后、Latest Updates 之前 */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section - 位于 Tools Grid 之后 */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Animal Hospital Codes (code-cards) */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <Gift className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Codes
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalCodes"]}
                locale={locale}
              >
                {t.modules.animalHospitalCodes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalCodes.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {t.modules.animalHospitalCodes.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base md:text-lg">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`animalHospitalCodes::items::${index}`]
                      }
                      locale={locale}
                    >
                      {item.label}
                    </LinkedTitle>
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${severityStyles[item.status === "not-live" ? "medium" : "low"] || severityStyles.low}`}
                  >
                    {item.status === "not-live" ? "Not Live" : "None"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.value}</p>
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">Reward: </span>
                    {item.reward}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Action: </span>
                    {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Animal Hospital Beginner Guide (step-by-step) */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <BookOpen className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Beginner Guide
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalBeginnerGuide"]}
                locale={locale}
              >
                {t.modules.animalHospitalBeginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.animalHospitalBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `animalHospitalBeginnerGuide::steps::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {step.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-2 text-xs md:text-sm text-[hsl(var(--nav-theme-light))]">
                      <Check className="inline w-3.5 h-3.5 mr-1" />
                      {step.tip}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Sparkles className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.animalHospitalBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Animal Hospital Anomalies (checklist) */}
      <section id="anomalies" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <ScanSearch className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Anomalies
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalAnomalies"]}
                locale={locale}
              >
                {t.modules.animalHospitalAnomalies.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalAnomalies.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {t.modules.animalHospitalAnomalies.categories.map(
              (cat: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-bold text-base md:text-lg">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `animalHospitalAnomalies::categories::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {cat.category}
                      </LinkedTitle>
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${severityStyles[cat.severity] || severityStyles.low}`}
                    >
                      {cat.severity}
                    </span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {cat.checks.map((check: string, ci: number) => (
                      <li
                        key={ci}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        {check}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs md:text-sm p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] text-foreground">
                    {cat.action}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 4: Animal Hospital Classes (tier-grid) */}
      <section
        id="classes"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <Users className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Classes
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalClasses"]}
                locale={locale}
              >
                {t.modules.animalHospitalClasses.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalClasses.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-6 md:space-y-8">
            {t.modules.animalHospitalClasses.tiers.map((tier: any, index: number) => (
              <div key={index}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 font-bold text-lg md:text-xl ${tierStyles[tier.tier] || tierStyles.C}`}
                  >
                    {tier.tier === "S" ? <Crown className="w-5 h-5 md:w-6 md:h-6" /> : tier.tier}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `animalHospitalClasses::tiers::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        Tier {tier.tier}
                      </LinkedTitle>
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {tier.summary}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tier.classes.map((c: any, ci: number) => (
                    <div
                      key={ci}
                      className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-base">{c.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                          {c.cost}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[hsl(var(--nav-theme-light))] mb-1.5">
                        {c.role}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">{c.perk}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Best for: </span>
                        {c.bestFor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Animal Hospital Sanity (survival-meter) */}
      <section id="sanity" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <HeartPulse className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Survival System
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalSanity"]}
                locale={locale}
              >
                {t.modules.animalHospitalSanity.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalSanity.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {t.modules.animalHospitalSanity.risks.map((risk: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-bold text-base md:text-lg">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`animalHospitalSanity::risks::${index}`]
                      }
                      locale={locale}
                    >
                      {risk.label}
                    </LinkedTitle>
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${meterStyles[risk.meterLevel] || meterStyles.prevention}`}
                  >
                    {risk.risk}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{risk.whatHappens}</p>
                {risk.commonCauses && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />
                      Common Causes
                    </p>
                    <ul className="space-y-1">
                      {risk.commonCauses.map((cause: string, ci: number) => (
                        <li
                          key={ci}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="text-[hsl(var(--nav-theme-light))] mt-0.5">•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {risk.recommendedClasses && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5">
                      Recommended Classes
                    </p>
                    <div className="space-y-1.5">
                      {risk.recommendedClasses.map((rc: any, rci: number) => (
                        <div
                          key={rci}
                          className="p-2 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)]"
                        >
                          <span className="block text-xs font-semibold text-[hsl(var(--nav-theme-light))]">
                            {rc.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {rc.useCase}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs md:text-sm p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] text-foreground">
                  {risk.bestResponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Animal Hospital Items and Treatments (table) */}
      <section
        id="items"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <Syringe className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Items & Treatment
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalItems"]}
                locale={locale}
              >
                {t.modules.animalHospitalItems.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalItems.intro}
            </p>
          </div>

          {/* 桌面端表格 */}
          <div className="scroll-reveal hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)]">
                <tr className="text-left">
                  <th className="p-4 font-semibold">Item</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Where Used</th>
                  <th className="p-4 font-semibold">What It Does</th>
                  <th className="p-4 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.animalHospitalItems.rows.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className="border-t border-border hover:bg-white/5 transition-colors align-top"
                  >
                    <td className="p-4 font-semibold">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[`animalHospitalItems::rows::${index}`]
                        }
                        locale={locale}
                      >
                        {row.item}
                      </LinkedTitle>
                    </td>
                    <td className="p-4 text-muted-foreground">{row.category}</td>
                    <td className="p-4 text-muted-foreground">{row.whereUsed}</td>
                    <td className="p-4 text-muted-foreground">{row.whatItDoes}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.animalHospitalItems.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`animalHospitalItems::rows::${index}`]
                      }
                      locale={locale}
                    >
                      {row.item}
                    </LinkedTitle>
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {row.priority}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[hsl(var(--nav-theme-light))] mb-1">
                  {row.category} · {row.whereUsed}
                </p>
                <p className="text-sm text-muted-foreground mb-2">{row.whatItDoes}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Avoid: </span>
                  {row.mistakeToAvoid}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Animal Hospital Coins and Upgrades (card-list) */}
      <section id="coins" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <Coins className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Progression
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalCoins"]}
                locale={locale}
              >
                {t.modules.animalHospitalCoins.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalCoins.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {t.modules.animalHospitalCoins.cards.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <h3 className="font-bold text-base md:text-lg mb-2">
                  <LinkedTitle
                    linkData={
                      moduleLinkMap[`animalHospitalCoins::cards::${index}`]
                    }
                    locale={locale}
                  >
                    {card.title}
                  </LinkedTitle>
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {card.cost}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-border text-muted-foreground">
                    {card.bestFor}
                  </span>
                </div>
                {card.classes && card.classes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {card.classes.map((cls: string, csi: number) => (
                      <span
                        key={csi}
                        className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] text-[hsl(var(--nav-theme-light))]"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-3">{card.value}</p>
                <p className="mt-auto text-xs md:text-sm p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] text-foreground">
                  {card.buyAdvice}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Animal Hospital Updates and Events (update-feed) */}
      <section
        id="updates"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-[hsl(var(--nav-theme-light))]">
              <Bell className="w-6 h-6" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                Live Updates
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["animalHospitalUpdates"]}
                locale={locale}
              >
                {t.modules.animalHospitalUpdates.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.animalHospitalUpdates.intro}
            </p>
          </div>

          <div className="scroll-reveal relative pl-6 md:pl-8 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6 md:space-y-8">
            {t.modules.animalHospitalUpdates.entries.map(
              (entry: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.4rem] md:-left-[1.9rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                  <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {entry.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.date}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `animalHospitalUpdates::entries::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {entry.headline}
                      </LinkedTitle>
                    </h3>
                    <ul className="space-y-1 mb-3">
                      {entry.details.map((detail: string, di: number) => (
                        <li
                          key={di}
                          className="flex items-start gap-1.5 text-sm text-muted-foreground"
                        >
                          <span className="text-[hsl(var(--nav-theme-light))] mt-0.5">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs md:text-sm p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] text-foreground">
                      <span className="font-semibold">Player Impact: </span>
                      {entry.playerImpact}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* 官方渠道快速入口 */}
          <div className="scroll-reveal mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://discord.com/invite/robloxanimalhospital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Discord{" "}
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.roblox.com/events/7513785508481335960"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <Clock className="w-4 h-4" /> Roblox Event{" "}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/robloxanimalhospital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=3awzFWk-Hpk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/344908697/Animal-Anomaly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/78515283254292/Animal-Hospital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
