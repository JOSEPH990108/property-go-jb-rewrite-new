# UI/UX Reference Index

Place UI/UX reference screenshots and images under these folders:

- `external-website/`
- `admin-portal/`
- `agent-portal/`
- `mobile/`
- `dashboard/`
- `landing-pages/`
- `components/`
- `inspiration/`

Do not place reference images in public frontend folders, and do not use reference images as production assets.

## Reference Entry Template

Use one entry per image:

```md
## <file-name>

- Location: docs/references/ui-ux/<folder>/<file-name>
- Purpose: <what this reference is for>
- Reference these parts: <layout, spacing, component behavior, CTA placement, user flow, etc.>
- Do not copy: <logos, brand names, exact text, protected assets, competitor identity, etc.>
- Reference type: <layout | color | typography | spacing | animation | component style | content structure | CTA placement | user flow>
- User notes: <important context or constraints>
- OCR/text notes: <visible text extracted, uncertain text, garbled text, language notes>
- Scores:
  - Visual quality: <1-10>
  - UX clarity: <1-10>
  - Conversion strength: <1-10>
  - Reusability: <1-10>
  - Suitability for this project: <1-10>
  - Implementation complexity: <1-10; higher means harder>
  - Mobile friendliness: <1-10>
- Final recommendation: <USE_AS_PRIMARY_REFERENCE | USE_AS_SECONDARY_REFERENCE | USE_ONLY_FOR_SMALL_IDEA | DO_NOT_USE>
```

## Analysis Checklist

The UI/UX AI Agent should scan layout hierarchy, section arrangement, header, hero, CTA placement, content sections, footer, sidebar, navigation, cards, grids, spacing rhythm, color palette, typography, font weight, border radius, shadows, background treatment, premium/clean/modern feel, user journey, CTA flow, forms, navigation behavior, conversion path, decision points, buttons, tables, badges, modals, tabs, filters, search, upload components, status indicators, dashboards, and desktop/tablet/mobile assumptions.

## OCR Rules

- Extract visible text where possible.
- Use extracted text only as reference.
- Do not rely on OCR blindly.
- Mark unclear text as uncertain.
- Verify Chinese and English text is not garbled before using it.
- Do not copy competitor text directly unless explicitly requested.

## Reference Design Rules

- Do not blindly copy screenshots.
- Do not copy exact competitor designs.
- Do not copy protected brand assets, logos, or unique identity.
- Extract reusable design patterns only.
- Final design direction must be original and suitable for PropertyGo JB.
- If a reference conflicts with approved design rules, flag the conflict before applying the idea.
