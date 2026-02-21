# Tim / Tiger - Dual-Identity Portfolio

This repository contains the source code for my personal portfolio, a project designed to showcase advanced frontend development techniques and a robust architectural pattern. The core of this project is a **"Site Variant" architecture**, a technical solution for serving two distinct identities - my real-life self (`Tim Chinye`) and my online alias (`TigerYT`) - from a single Next.js codebase and Sanity.io content source.

**Live Sites:**

-   **IRL Identity (Tim Chinye):** [https://timchinye.com](https://timchinye.com)
-   **Online Alias (TigerYT):** [https://tigerfolio.com](https://tigerfolio.com)

---

## Design-First Methodology

**[View the Figma Design File](https://www.figma.com/design/UT5xTtcZRGTqw9rozzF34V/My-Portfolio?node-id=383-3260&t=BJIhc4VSCRQB6SAX-1)**

This project was architected with a **design-first methodology**. The high-fidelity Figma file served as the definitive source of truth for all visual components, animation specifications, and layout structures.

I wholeheartedly believe that a pre-defined design plan was a key factor in the project's rapid development, enabling the initial MVP go from nothingness to complete design and a fully functional codebase, single-handedly, in just 2 months and 7 days.

## Architectural Highlights & Key Features

This project demonstrates a deep understanding of modern web development principles, with a focus on performance, user experience, and maintainability.

-   **Dual-Identity Architecture:** A single codebase serves two different hostnames, dynamically swapping content, layouts, and assets based on the request's origin. This is managed efficiently via Next.js Middleware (`src/proxy.ts`).
-   **Embedded Sanity Studio:** All content is managed via a fully-typed, embedded Sanity Studio at the `/studio` route, allowing for seamless content updates and live previews using the Presentation Tool.
-   **Advanced Animations & Interactions:**
    -   **Hero Section:** A dynamic canvas of project thumbnails with a parallax effect that responds to mouse movement, complemented by a "liquid glass" bubble cursor using SVG filters. See `src/app/(portfolio)/[variant]/(home)/_components/HeroSection/`.
    -   **"Scrollytelling" Sections:** Implements complex, scroll-driven animations, such as the `FeaturedProjectsSection` where text highlights as you scroll, and the `WorkGraphicSection` with its 3D parallax text effect.
    -   **Polymorphic Section Component:** A powerful, reusable component (`src/components/ui/Section.tsx`) orchestrates `position: sticky` and synchronized scroll-based animations between parent and child elements.
-   **Unique Theme Switcher:** A custom "wipe" animation provides a visually engaging transition between light and dark modes, taking a "screenshot" of the old theme with `html-to-image` and revealing the new one underneath. Logic is in `src/hooks/useThemeWipe.ts`.
-   **Puzzle-Style Contact Form:** An interactive form designed as a "fill-in-the-blanks" puzzle, with a secure server action (`src/app/(portfolio)/[variant]/contact/actions.ts`) to handle submissions and route emails based on the site variant.
-   **Performant Video & Content:** Integrates **Mux** for adaptive video streaming and **MDX** for rich case study content, all managed directly from the Sanity Studio schema (`src/sanity/schemaTypes/objects/blockContent.ts`).

## Tech Stack

-   **Framework:** Next.js 16+ (App Router)
-   **CMS:** Sanity.io (Embedded Studio, Presentation Tool)
-   **UI Library:** React 19.2
-   **Styling:** TailwindCSS 4.1
-   **Animation:** Motion.dev
-   **Video Platform:** Mux
-   **Language:** TypeScript
