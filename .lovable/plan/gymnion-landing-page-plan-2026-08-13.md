---
title: Gymnion Landing Page Implementation
---

# Gymnion Landing Page Plan

Implement a premium, mobile-first responsive landing page for "Gymnion" based on the provided design images and brand system.

## Design Tokens & Brand System
- **Colors**: Primary Background (#101311), Elevated Surface (#181D19), Accent Lime (#C8FF38), deep charcoal tones.
- **Typography**: Satoshi (Black/Bold for headings, Regular/Medium for body).
- **Radius**: 12–16px for cards, pill-shaped for CTAs.

## Core Components
- **Sticky Navigation**: Transparent to charcoal, centered logo on mobile, split layout on desktop.
- **Hero Section**: Full-viewport, cinematic gym imagery with dark overlay, high-impact typography ("Run the gym your members love").
- **Trust Strip**: Three proof points (Members, Payments, Visibility) on a soft surface.
- **Features Section**: Editorial layout with pinned titles (desktop) and staggered reveal animations.
- **Product Journey**: Horizontal scroll/swipeable sequence of gym lifecycle moments.
- **Pricing**: Monthly/Annual toggle, three tiered plans with "Pro" prominence.
- **About / Values**: Asymmetrical editorial layout with team/founder photography.
- **Testimonial**: High-impact quote carousel with editorial attribution.
- **Contact**: High-contrast form on charcoal with direct contact links.

## Technical Implementation
- **Framework**: TanStack Start v1.
- **Styling**: Tailwind CSS v4.
- **Animations**: Framer Motion for scroll reveals, parallax, and transitions.
- **Mobile First**: Optimized for 390px viewport, responsive to tablet and desktop.
- **SEO**: Semantic HTML, meaningful metadata, absolute image URLs for social previews.
