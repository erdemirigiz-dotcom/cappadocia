# Cappadocia Demo — Product Requirements (public showcase)

## Purpose

A finished, single-page demo website for a Cappadocia hospitality business (balloon
tours / boutique stay), built to showcase Iron Vision Tools' small-business web work:
fast, static, no-tracking, mobile-first. It is a portfolio piece, not a live commercial
booking system — the reservation form posts to a real backend for demo purposes, but no
real inventory or payment flow is wired in.

## Target user

- Primary: small/mid tourism businesses in Cappadocia (balloon tour operators, boutique
  hotels, local guides) evaluating whether a fast, modern, multilingual site is worth
  commissioning.
- Secondary: international travelers researching a Cappadocia experience — the demo
  content itself is written from that visitor's point of view.

## Features

- Single-page layout: hero, experience highlights, gallery, pricing/package cards,
  reservation form, contact.
- 11 languages (EN default, DE, ES, FR, IT, RU, JA, ZH, KO, PT-BR, TR), switchable
  client-side without a page reload.
- 4K hero video with a compressed/poster fallback for mobile.
- Reservation form posts JSON to a configurable backend endpoint
  (`window.FORM_ENDPOINT`), with basic honeypot + rate-limit protection server-side.
- Self-hosted fonts (Cormorant Garamond, Manrope) — no third-party font CDN calls.
- No analytics/tracking scripts.
- Optimized asset weight: total page payload reduced from ~10 MB to ~3.5 MB.

## Non-goals

- Not a real booking/payment system (no inventory, no payment gateway).
- Not tied to a specific real business — all business details are fictional/demo.
- No admin panel or CMS — content is static HTML/JS, edited by hand.

## Tech stack

- Plain HTML/CSS/JS, no framework, no build step.
- GSAP + ScrollTrigger (third-party, MIT/Business licensed by GreenSock — see their own
  license terms) for scroll-driven animation.
- Static hosting on Vercel.
- Form backend: a small serverless (Cloudflare Worker-style) relay — swappable via
  `window.FORM_ENDPOINT`.

## Design constraints

- Mobile-first; touch targets sized for one-handed use.
- Fast first paint on slow mobile connections — video/poster fallback, lazy-loaded
  below-the-fold assets.
- Content written to read as a real, working business site rather than a generic
  template gallery.

## Roadmap (indicative, not a commitment)

- Add a second demo vertical (e.g. boutique stay / restaurant) to show the same
  template adapting to a different business type.
- Optional dark-mode variant.
- Swap the demo reservation form for a fully mocked confirmation flow (no live
  backend dependency) so the repo can run entirely standalone.
- Lighthouse/Core Web Vitals badge in the README once a stable public score is
  captured.

No pricing, no real customer data, and no commercial/business-plan details are included
in this document — it describes the demo site only.

---

## Kısa TR özet

Bu, Iron Vision Tools'un küçük işletme web çalışmasını göstermek için hazırlanmış
Kapadokya temalı, tek sayfalık bir vitrin (demo) sitesidir — gerçek bir işletmeye
bağlı değildir, gerçek rezervasyon/ödeme sistemi içermez. 11 dilli, hızlı, izlemesiz
(tracking yok), mobil öncelikli statik bir site; form gerçek bir arka uca gönderim
yapar (demo amaçlı) ama gerçek envanter/ödeme akışı yoktur. Yol haritasında ikinci bir
demo dikey (ör. otel/restoran), karanlık mod ve formun tamamen bağımsız çalışacak
şekilde mockla değiştirilmesi var. Ticari sır, fiyat ya da müşteri bilgisi içermez.
