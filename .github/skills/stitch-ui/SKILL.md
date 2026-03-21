---
name: stitch-ui
description: "Use when: implementing UI from Stitch designs, converting Stitch screens to React code, syncing local code back to Stitch, or any task involving the Stitch MCP design tool. Enforces pixel-faithful design translation with no unauthorized enhancements."
argument-hint: "A Stitch screen to implement, a component to sync back to Stitch, or a question about the Stitch workflow."
---

# Stitch UI — Pixel-Faithful Design-to-Code Workflow

Translate Stitch screen designs into React/TypeScript code with exact visual fidelity, and sync finalized local code back to Stitch.

## Core Rule: Design Fidelity

**The Stitch screen is the single source of truth.** Reproduce its visual design exactly. You are PROHIBITED from:

- Adding hover effects, transitions, or animations not present in the Stitch HTML
- Changing colors, spacing, border-radius, font sizes, or opacity values
- Rearranging layout, element order, or icon placement
- Adding gradients, shadows, or decorative elements not in the design
- Substituting icons or changing icon positions
- "Improving" or "polishing" any visual aspect

If you believe something in the Stitch design could be better, you MUST:
1. Implement it exactly as designed first
2. List your suggested improvements separately as a numbered proposal
3. Wait for explicit user approval before making any enhancement

## Workflow: Stitch Screen → React Code

### Step 1: Fetch the screen
Use `mcp_stitch_get_screen` to retrieve the screen metadata (screenshot URL, HTML download URL, dimensions).

### Step 2: Download and analyze the HTML
Use the `fetch_webpage` tool to download the HTML from the `htmlCode.downloadUrl`. Parse it carefully:
- Extract exact CSS values (colors as hex, spacing in px, border-radius, font-size, font-weight, opacity)
- Note the exact layout structure (flex direction, alignment, gaps)
- Identify all icons and their positions
- Map the color palette to project design tokens where exact matches exist
- Document any value without a project token match — use the literal value

### Step 3: Map to project components
See [component mapping reference](./references/component-mapping.md) for the standard mapping table. Prefer reusing existing ShadCN/Radix components over raw HTML.

### Step 4: Implement with exact styles
Write React components using Tailwind classes that reproduce the Stitch CSS values:
- Match colors: use project tokens if identical, otherwise use arbitrary values `[#hex]`
- Match spacing: convert px to Tailwind scale or use arbitrary values `[12px]`
- Match border-radius: use Tailwind rounded classes or arbitrary values
- Match font properties exactly
- Preserve element order and layout direction from the HTML

### Step 5: Create a fidelity checklist
After implementation, output a checklist comparing each visual element:

```
## Fidelity Checklist
- [ ] Header: background color matches
- [ ] Header: icon size and container match
- [ ] Header: font size and weight match
- [ ] Body: layout direction and gaps match
- [ ] Cards/chips: border, radius, padding match
- [ ] Input: height, padding, border match
- [ ] Button: size, color, radius match
- [ ] Footer: text size, color, alignment match
- [ ] Icons: correct icons, correct positions, correct sizes
```

## Workflow: Local Code → Stitch

When asked to update Stitch with local code changes:

1. Read the current local component code
2. Describe the visual changes in a clear prompt for Stitch
3. Use `mcp_stitch_edit_screens` with a detailed prompt specifying exact visual properties (colors, sizes, positions, spacing)
4. Fetch the updated screen HTML and compare with local code
5. Report any discrepancies between Stitch's interpretation and local code

## Workflow: Generate Variants

When the user wants to explore design alternatives:

1. Use `mcp_stitch_generate_variants` to create options
2. Present each variant with a description of what changed
3. Let the user choose before implementing anything

## Behavior Rules

1. **Never embellish.** If the Stitch design has a plain border, do not add a gradient. If it has no hover state, do not add one.
2. **Ask before enhancing.** If the design looks incomplete or could be improved, propose changes as a separate list — never apply them silently.
3. **Use `manage_todo_list`** for multi-step implementations to track progress.
4. **Preserve existing logic.** When updating an existing component to match a new Stitch design, keep all functional code (event handlers, state, hooks, API calls) intact. Only change the JSX structure and className values.
5. **Report the diff.** After implementation, summarize what changed and call out anything that could not be exactly matched.
