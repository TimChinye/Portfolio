export const USE_MOCK_DATA = false;

export const mockProjects = [
  {
    _id: "09a983c2-b057-4a4a-b96b-7426e3578ff5",
    _createdAt: "2025-11-18T14:55:55Z",
    title: "Nexus Dashboard",
    slug: { current: "nexus-dashboard" },
    thumbnailUrl: "https://picsum.photos/seed/nexus/1600/1200", 
    thumbnail: {
      _type: "image",
      asset: { _ref: "image-mock-ref" },
      hotspot: { x: 0.36, y: 0.5, height: 0.38, width: 0.28 }
    },
    visibility: ["tim", "tiger"],
    shortDescription: "A real-time analytics platform to unify scattered data points into actionable insights.",
    techDescription: "Core Technologies: Next.js, Sanity.io, Vercel\nLibraries: SWR, Framer Motion, Mux",
    featuredDescription: "This project involved creating a single source of truth for a client drowning in data. The result is a highly performant, server-rendered dashboard that provides a clear strategic advantage by turning raw numbers into real-time insights.",
    isHighlighted: true,
    isNew: false,
    dateCompleted: "2024-05-01",
    ctaPrimary: { label: "View Live Demo", url: "#" },
    caseStudyContent: [
      {
        _key: "ef8e51f52072",
        _type: "block",
        children: [
          {
            _key: "9be9efbdb6d5",
            _type: "span",
            marks: [],
            text: "Nexus Dashboard: From Scattered Data to Actionable Insight..."
          }
        ],
        markDefs: [],
        style: "normal"
      }
    ]
  },
  {
    _id: "151fb81b-50b4-4023-ac4e-ed9201541cb9",
    _createdAt: "2025-10-17T01:29:37Z",
    title: "Flux Design System",
    slug: { current: "flux-design-system" },
    thumbnailUrl: "https://picsum.photos/seed/flux/1200/1200",
    thumbnail: {
        _type: "image",
        asset: { _ref: "image-mock-ref" },
        hotspot: { x: 0.5, y: 0.5, height: 1, width: 1 }
    },
    visibility: ["tim", "tiger"],
    shortDescription: "An open-source React component library for building beautiful interfaces, fast.",
    techDescription: "Core Technologies: TypeScript, React\nLibraries: Storybook, Rollup.js, Framer Motion, Radix UI",
    featuredDescription: "Flux is my personal, open-source design system and component library, born from a desire to standardize and accelerate my own projects. It's built with accessibility and developer experience as top priorities, featuring fully typed components, and is published to npm.",
    isHighlighted: true,
    isNew: true,
    dateCompleted: "2024-08-01",
    ctaPrimary: { label: "View Storybook Docs", url: "https://flux-docs.example.com" },
    ctaSecondary: { label: "View on GitHub", url: "https://github.com/example/flux" },
    ctaTextLink: { label: "Install via npm", url: "https://www.npmjs.com/package/flux-example" },
    caseStudyContent: []
  },
  {
    _id: "418cc181-5598-4dee-80c2-72e8d1a3169c",
    _createdAt: "2025-10-17T01:22:17Z",
    title: "StreamKit Overlay Engine",
    slug: { current: "streamkit-overlay-engine" },
    thumbnailUrl: "https://picsum.photos/seed/streamkit/1200/600",
    thumbnail: {
        _type: "image",
        asset: { _ref: "image-mock-ref" },
    },
    visibility: ["tiger"],
    shortDescription: "A free browser-based tool for creating custom stream overlays for Twitch.",
    techDescription: "Core Technologies: Vite, React, TypeScript, WebSocket\nLibraries: Framer Motion, Socket.io, Zustand, Mantine UI",
    featuredDescription: "I built StreamKit because I wanted to give new streamers access to high-quality, animated overlays without needing design software. It's a fully client-side application that connects to Twitch events in real-time.",
    isHighlighted: true,
    isNew: true,
    dateCompleted: "2024-02-01",
    ctaPrimary: { label: "Try It Now", url: "https://streamkit.example.com" },
    ctaSecondary: { label: "View on GitHub", url: "https://github.com/example/streamkit" },
    ctaTextLink: { label: "Read the launch post on Twitter", url: "https://twitter.com/example/status/12345" },
    caseStudyContent: []
  },
  {
    _id: "920bcd0e-a59c-4337-9d4d-4fb6b5076595",
    _createdAt: "2025-10-17T01:32:09Z",
    title: "Apex Analytics Dashboard",
    slug: { current: "apex-analytics-dashboard" },
    thumbnailUrl: "https://picsum.photos/seed/apex/736/552",
    thumbnail: {
        _type: "image",
        asset: { _ref: "image-mock-ref" },
    },
    visibility: ["tim"],
    shortDescription: "A bespoke BI dashboard for a fintech client to track KPIs.",
    techDescription: "Core Technologies: Next.js, TypeScript, Node.js\nLibraries: D3.js, Auth0, Vercel Postgres, Tailwind CSS",
    featuredDescription: "Apex Analytics is a custom-built business intelligence platform that provides real-time insights into market trends and portfolio performance. I led the frontend development, creating a highly interactive and performant interface.",
    isHighlighted: false,
    isNew: false,
    dateCompleted: "2023-11-01",
    ctaPrimary: { label: "View Live Demo", url: "https://apex-demo.example.com" },
    ctaSecondary: { label: "Private GitHub Repo", url: "https://github.com/example/apex-private" },
    caseStudyContent: []
  }
] as const;