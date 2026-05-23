---
applyTo: "src/**"
---

# Scrollable Components — Scroll Handling Rules

## The Core Rule

**Never use `ScrollArea` from `@/components/ui/scroll-area` (Radix UI) as a layout scroll container.**

`ScrollArea` is an overlay-scrollbar widget. It only scrolls when its parent gives it a **fixed, bounded height** (e.g. a dropdown list, a sidebar, a code viewer with `h-[400px]`). Inside flexible layouts (flex, grid, min-h-screen containers), it receives no bounded height and silently stops scrolling.

---

## When to Use Each Approach

### ✅ Native page scroll (default — use this for pages and tall forms)

Let the browser scroll. Use `overflow-y-auto` only if you need to constrain a **known-height region**.

```tsx
// Wizard, multi-step form, tall admin page
<div>
  <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090d1a] px-6 py-4">
    {/* sticky header */}
  </div>

  <div className="mx-auto max-w-5xl px-6 py-8">{/* main content — scrolls with the page */}</div>

  <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#090d1a] px-6 py-4">
    {/* sticky footer / nav buttons */}
  </div>
</div>
```

### ✅ Bounded scroll region (use for fixed-height panels)

Use a plain `div` with explicit height + `overflow-y-auto`:

```tsx
<div className="h-[400px] overflow-y-auto">{/* list items, logs, etc. */}</div>
```

### ✅ ScrollArea (Radix) — only for these cases

Use `ScrollArea` only when you need a **custom-styled scrollbar overlay** inside a **parent that already has a fixed height**:

```tsx
// e.g. sidebar nav, command palette list, mini data table
<div className="h-[600px]">
  {" "}
  {/* ← fixed height MUST be on parent */}
  <ScrollArea className="h-full">{items}</ScrollArea>
</div>
```

---

## Admin Panel Layout Constraint

The `AdminShell` main content area is:

```
<main class="flex-1 px-4 pb-8">
  <div class="rounded-[32px] border bg-card/90 p-4">
    {children}           ← YOUR PAGE RENDERS HERE
  </div>
</main>
```

This container has **no fixed height** — it grows with content. Any child that uses `h-screen`, `h-full`, or `ScrollArea` without a sibling-bounded height will appear to have zero scrollable overflow.

**Checklist before adding a scroll container inside AdminShell:**

- [ ] Does the parent have a fixed or bounded height (`h-[Xpx]`, `h-screen` on the root)? → Use `overflow-y-auto` or `ScrollArea`.
- [ ] Is the content a tall form / wizard / long list that should just grow the page? → Use `sticky` for headers/footers, let content flow naturally.
- [ ] Are you wrapping a `flex h-full` element inside AdminShell? → Remove `h-full` / `h-screen`; use `min-h-0` instead if you need flex sizing.

---

## Anti-patterns

```tsx
// ❌ ScrollArea without a bounded-height parent
<ScrollArea className="flex-1">...</ScrollArea>

// ❌ h-screen inside AdminShell (header takes vertical space)
<div className="flex h-screen flex-col overflow-hidden">...</div>

// ❌ h-full on a child when no ancestor has explicit height
<div className="h-full overflow-y-auto">...</div>
```
