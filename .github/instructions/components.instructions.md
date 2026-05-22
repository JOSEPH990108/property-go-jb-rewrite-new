---
description: "Use when creating or modifying React components, pages, or layouts. Covers Shadcn/ui, Radix, Tailwind CSS 4, and component organization."
applyTo: ["src/components/**", "src/app/**/page.tsx", "src/app/**/layout.tsx"]
---
# Component Conventions

- Use `cn()` from `@/lib/utils` for combining Tailwind classes (clsx + tailwind-merge)
- Shadcn UI primitives live in `src/components/ui/` — NEVER edit these directly; extend via composition
- Domain components: `src/components/admin/`, `src/components/properties/`, `src/components/auth/`, etc.
- Reusable cross-cutting components: `src/components/shared/`
- Radix UI controlled components: use `undefined` (not empty string) for unselected state
- Animations: use `framer-motion` for transitions and layout animations
- Icons: use `lucide-react` — import individual icons
- Toast notifications: use `sonner` (`toast.success()`, `toast.error()`)
- Forms: use React Hook Form + Zod resolver — schemas live alongside domain logic
- ESLint rule `react-hooks/set-state-in-effect` is active — do NOT sync server props into client state via useEffect; keep server props as source of truth
- Use `"use client"` directive only when component needs browser APIs, hooks, or event handlers
