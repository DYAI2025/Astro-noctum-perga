# SEO Audit Report — openclawmd.com

**Date:** 2026-03-03  
**Audited URL:** https://openclawmd.com/  
**Overall Lighthouse SEO Score:** 100 / 100 *(automated — see manual findings below)*  
**Brand / Product:** Animae Agentis  

---

## Executive Summary

The automated Lighthouse SEO score is perfect (100/100), and all technical crawlability signals are green. However, several high-impact SEO gaps exist that automated tools don't catch: missing social graph image, absent structured data, text contrast failures, and a broken H1 string. Addressing the Critical and High items below is recommended before any growth/marketing push.

---

## ✅ Passing Checks

| Check | Status | Value |
|---|---|---|
| HTTP Status Code | ✅ Pass | 200 |
| Canonical URL | ✅ Pass | `https://openclawmd.com/` |
| Meta Description | ✅ Pass | Present |
| robots.txt | ✅ Pass | Valid — all 5 major bots allowed |
| Crawlable Links | ✅ Pass | 6/6 |
| Descriptive Link Text | ✅ Pass | 6/6 |
| `<html lang>` attribute | ✅ Pass | `en` |
| Single H1 | ✅ Pass | Exactly 1 H1 found |
| OG type / url / site_name | ✅ Pass | Present |
| Core Web Vitals | ✅ Pass | FCP 284ms · LCP 352ms · TTFB 19ms |

---

## 🔴 Critical Issues

### 1. No Structured Data (JSON-LD)

Zero `application/ld+json` schema blocks found. Structured data enables rich results (sitelinks, knowledge panel, article cards) in Google SERPs and is especially important for an AI tooling product with a blog.

**Recommended minimum — add to `<head>`:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Animae Agentis",
  "alternateName": "OpenClaw MD",
  "url": "https://openclawmd.com/",
  "description": "Animae Agentis generates the behavioral fabric of autonomous agents — identity, values, boundaries and rhythm — from a single source of truth.",
  "publisher": {
    "@type": "Person",
    "name": "Benjamin Poersch"
  }
}
</script>
```

**Also recommended for the SoftwareApplication:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Animae Agentis",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "url": "https://openclawmd.com/",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

**And for the blog articles (H3 headings detected as article titles):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "What Is an AI Agent? A Complete Beginner's Guide",
  "url": "https://openclawmd.com/...",
  "author": { "@type": "Person", "name": "Benjamin Poersch" }
}
</script>
```

---

### 2. Missing `og:image` — Social Sharing Broken

No `og:image` meta tag exists. Every share on LinkedIn, Facebook, Slack, iMessage, and WhatsApp shows a blank preview card — severely reducing click-through rates from all social channels.

```html
<meta property="og:image" content="https://openclawmd.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Animae Agentis – AI Agent Configuration Framework built on OpenCLAW" />
```

> **Image spec:** 1200×630px PNG/JPEG. Include the logo and product tagline on a brand-colored background.

---

## 🟠 High Impact Issues

### 3. No Twitter / X Card Tags

Twitter/X does **not** fall back to OG tags reliably. The entire X social graph is dark — shares on X show no preview image or description.

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@YourTwitterHandle" />
<meta name="twitter:title" content="Animae Agentis | Agentic Autopoiesis" />
<meta name="twitter:description" content="Generate high-performance, legal-first configurations for autonomous AI agents. Built on OpenCLAW 0.1." />
<meta name="twitter:image" content="https://openclawmd.com/og-image.png" />
```

---

### 4. Ten Text Contrast Failures (1.61:1 — required ≥ 4.5:1)

The salmon/pink `.md` file labels below the hero (SOUL.md, IDENTITY.md, USER.md, HEARTBEAT.md, SHIELD.md, SPIRIT.md, CORTEX.md, MEMORY.md, VERSION.md, OPS.md) all fail WCAG AA contrast. Google uses legibility as a ranking signal.

| Element | Ratio | Required |
|---|---|---|
| SOUL.md … OPS.md (×10) | **1.61:1** | 4.5:1 |

**Fix:** Darken the text color of these labels. Example: change from `#F4A7A7` (approximate current) to `#B34040` against the light background — this achieves ≈ 4.7:1 contrast ratio.

---

### 5. Domain ↔ Brand Name Mismatch

The domain is `openclawmd.com` but the brand name throughout the page is **Animae Agentis**. Search engines struggle to determine the canonical entity name, splitting keyword authority.

| Signal | Value |
|---|---|
| Domain | `openclawmd.com` |
| `<title>` brand | Animae Agentis |
| `og:site_name` | Animae Agentis |
| `og:url` | `https://openclawmd.com/` |

**Short-term fix:** Add `"alternateName": "OpenClaw MD"` in the JSON-LD `WebSite` schema (shown in Issue #1).  
**Long-term fix:** Align domain and brand name, or clearly disambiguate in the `<title>` — e.g. `Animae Agentis by OpenClaw | Agentic Autopoiesis`.

---

## 🟡 Medium Issues

### 6. H1 Contains a Missing Space

**Extracted H1 text:** `"10 Markdown files that definehow your AI agent behaves"`

The words "define" and "how" are concatenated. A visual `<br>` tag is used inside the H1 without a surrounding space character. This is parsed by crawlers and screen readers as a single malformed word `"definehow"`.

**Fix:**
```html
<!-- Before (broken) -->
<h1>10 Markdown files that define<br>how your AI agent behaves</h1>

<!-- After (correct) -->
<h1>10 Markdown files that define how your AI agent behaves</h1>
```
Use CSS `word-break` or a `<span>` with a display-block style for the visual line break instead.

---

### 7. Meta Description ↔ OG Description Inconsistency

The two descriptions communicate different value propositions, which can confuse automated scrapers and brand consistency tools.

| Tag | Content |
|---|---|
| `<meta name="description">` | "…generates the behavioral fabric of autonomous agents — identity, values, boundaries and rhythm — from a single source of truth. Built on OpenCLAW 0.1." |
| `<meta property="og:description">` | "Generate high-performance, legal-first configurations for autonomous AI agents." |

**Recommendation:** Align both to a single best-performing description. The `og:description` is shorter and more action-oriented — consider using it for both, adding the "Built on OpenCLAW 0.1" qualifier.

---

### 8. Images Missing `loading="lazy"`

All 5 images lack the `loading` attribute. The three below-fold feature images should use lazy loading to improve initial page weight and INP.

```html
<!-- Hero logo — keep eager (above fold) -->
<img src="..." alt="Animae Agentis" />

<!-- Feature images — add lazy loading -->
<img src=".../download.png" alt="Download Presets" loading="lazy" />
<img src=".../custom.png"   alt="Customize Your Files" loading="lazy" />
<img src=".../knowledge.png" alt="How It Works" loading="lazy" />
```

---

### 9. Favicon Uses Relative Path & Missing Fallbacks

```html
<!-- Current -->
<link rel="icon" href="./logo.png" />
```

The path is relative (`./`), which can break in nested routes. No `apple-touch-icon`, no `favicon.ico` fallback, no web app manifest.

```html
<!-- Recommended -->
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

---

## 🔵 Low Priority

### 10. Title Typo: "Autopoesis" → "Autopoiesis"

`<title>Animae Agentis | Agentic Autopoesis</title>`

The correct scientific/systems-theory term is **Autopoiesis** (from Greek: αὐτo- + ποίησις). This could cause missed keyword traffic from users searching the concept. If it's intentional branding, document it clearly.

---

### 11. Missing `og:locale`

```html
<meta property="og:locale" content="en_US" />
```

Helps social platforms and scrapers correctly parse the language/region.

---

### 12. No Sitemap Directive in robots.txt

The audit confirms robots.txt is valid but a `Sitemap:` directive was not confirmed. Adding it ensures search engines discover all pages without relying on crawl discovery.

```
# robots.txt addition
Sitemap: https://openclawmd.com/sitemap.xml
```

Also generate and serve `/sitemap.xml` if not already present.

---

### 13. INP at 280ms — Borderline "Needs Improvement"

| Metric | Value | Threshold |
|---|---|---|
| Interaction to Next Paint (INP) | **280ms** | ≤200ms = Good, ≤500ms = Needs Improvement |

The INP is at the upper boundary of the "Needs Improvement" tier. As Google's primary interactivity ranking signal (replacing FID), it is worth profiling. Likely culprits: heavy event handlers on scroll/click, AdSense injection, or undeferred JS.

---

## Priority Fix List

| # | Issue | Severity | Effort | Impact |
|---|---|---|---|---|
| 1 | No structured data / JSON-LD | 🔴 Critical | Medium | Rich results, Knowledge Panel |
| 2 | Missing `og:image` | 🔴 Critical | Low | All social sharing previews |
| 3 | No Twitter/X Card tags | 🟠 High | Low | X/Twitter sharing |
| 4 | 10 text contrast failures | 🟠 High | Low | Legibility ranking signal |
| 5 | Domain ↔ brand mismatch | 🟠 High | High | Entity disambiguation |
| 6 | H1 missing space (define+how) | 🟡 Medium | Low | Keyword parsing |
| 7 | Meta vs OG description mismatch | 🟡 Medium | Low | Brand consistency |
| 8 | Images missing `loading="lazy"` | 🟡 Medium | Low | Core Web Vitals |
| 9 | Favicon relative path + no fallbacks | 🟡 Medium | Low | PWA / mobile |
| 10 | Title typo "Autopoesis" | 🔵 Low | Low | Keyword traffic |
| 11 | No `og:locale` | 🔵 Low | Low | Social graph completeness |
| 12 | No sitemap in robots.txt | 🔵 Low | Low | Crawl discoverability |
| 13 | INP 280ms borderline | 🔵 Low | Medium | Core Web Vitals ranking |

---

*Generated by Kombai SEO Audit on 2026-03-03. Auditor: Lighthouse + manual analysis.*
