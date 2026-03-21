# Component Mapping: Stitch → Project

Map Stitch HTML elements to existing project components (`src/components/ui/`).

| Stitch Element | Project Component | Import |
|---|---|---|
| Button / CTA | `<Button>` with variant | `@/components/ui/button` |
| Text input | `<Input>` | `@/components/ui/input` |
| Multiline input | `<textarea>` with Tailwind classes | native |
| Card / Panel | `<Card>`, `<CardHeader>`, `<CardContent>` | `@/components/ui/card` |
| Scrollable area | `<ScrollArea>` | `@/components/ui/scroll-area` |
| Side drawer | `<Sheet>`, `<SheetContent>` | `@/components/ui/sheet` |
| Bottom drawer | `<Drawer>` | `@/components/ui/drawer` |
| Dialog / Modal | `<Dialog>` | `@/components/ui/dialog` |
| Tabs | `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` | `@/components/ui/tabs` |
| Dropdown | `<Select>` or `<DropdownMenu>` | `@/components/ui/select` |
| Checkbox | `<Checkbox>` | `@/components/ui/checkbox` |
| Toggle | `<Switch>` | `@/components/ui/switch` |
| Badge / Chip | `<Badge>` | `@/components/ui/badge` |
| Separator | `<Separator>` | `@/components/ui/separator` |
| Avatar | `<Avatar>` | `@/components/ui/avatar` |
| Tooltip | `<Tooltip>` | `@/components/ui/tooltip` |
| Progress bar | `<Progress>` | `@/components/ui/progress` |
| Accordion | `<Accordion>` | `@/components/ui/accordion` |

## Icons

Use `lucide-react` for all icons. Match by visual similarity to the Stitch design.

Common mappings:
- Sparkle / star icon → `Sparkles`
- Person icon → `User`
- Group icon → `Users`
- Arrow up → `TrendingUp`
- Screen / monitor → `Monitor`
- Bar chart → `BarChart3`
- Send / arrow → `Send`
- Trash → `Trash2`
- Close / X → `X`
- Search → `Search`
- Settings / gear → `Settings`

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite |
| Framework | React 18, TypeScript |
| UI Library | ShadCN / Radix UI |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Path alias | `@/` → `src/` |
