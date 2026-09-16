# Component Catalog

> Auto-generated component reference for the `base-theme` Angular library.
> All components, directives, pipes, and services are standalone by default.

---

## Styling & Customization Rules

Read these before composing components into pages — they prevent the most common integration mistakes.

### Utility-class conflicts with component base classes

Button directives (`ply-button`, `ply-stroked-button`, `ply-icon-button`, `ply-stroked-icon-button`) and `ply-input` / `ply-textarea` merge extra `class` values with `cn()`. Conflicting Tailwind utilities in `class` win over defaults:

```html
<button ply-icon-button color="white" class="absolute right-3 top-3 rounded-full">…</button>
```

`color="primary"` / `"danger"` read `--ply-primary` and `--ply-destructive` from `ply-ui.css`. Buttons use `FOCUS_RING`. Field chrome uses `FOCUS_RING_WITHIN` on `ply-input-group` so addons stay inside the halo.

The same `cn()` merge applies to any component whose host binding includes `extraClass`. Existing `utility!` overrides still work.

### Icons: line vs. filled

`<ply-icon>` renders symbols from `assets/icons.svg`. Override the sprite once with `provideBaseUI({ iconPath })` — per-instance `[path]` still wins. The outline symbols hard-code `fill="none"`, which always beats an inherited CSS fill — a `fill-*` class can never fill a line icon. For solid glyphs (active wishlist heart, rating stars) use the `filled` input, which switches to `assets/icons-filled.svg` (or `provideBaseUI().filledIconPath`) whose symbols use `fill="currentColor"`, and color them with `text-*` classes:

```html
<ply-icon name="heart" [filled]="wishlisted()" class="text-red-500"></ply-icon>
```

### `ply-drawer` requires an animations provider

The drawer animates with `@angular/animations` triggers. Without a provider, opening it throws `NG05105: Unexpected synthetic property @slideLeft`. Register `provideAnimationsAsync()` in `app.config.ts`.

### Chrome strings (`provideBaseUiI18n`)

Empty states, paginator labels, and `ply-dialog-close` aria-labels default to English. Register overrides in `app.config.ts`:

```ts
import { provideBaseUiI18n } from './components/i18n/i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBaseUiI18n({
      close: 'Fermer',
      noDataAvailable: 'Aucune donnée',
      noResults: 'Aucun résultat',
    }),
  ],
};
```

Install: `npx ply-ui-cli add i18n` (also pulled in by data-table, combobox, dialog, paginator). Per-instance inputs (`emptyMessage`, `emptyText`, `[ariaLabel]` on close) still win. Layout marketing copy is not in this dictionary.

### Icon sprites (`provideBaseUI`)

`<ply-icon>` loads `assets/icons.svg` (outline) and `assets/icons-filled.svg` (solid). Override once in `app.config.ts`:

```ts
import { provideBaseUI } from './components/config/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBaseUI({
      iconPath: 'assets/icons.svg',
      filledIconPath: 'assets/icons-filled.svg',
      defaultSize: 20,
    }),
  ],
};
```

Install: `npx ply-ui-cli add config` (also pulled in by `icon`). Per-instance `[path]`, `[filledPath]`, and `[size]` still win. `w-*` / `h-*` classes keep class-based sizing, so `defaultSize` does not fight those utilities.

### CDK test harnesses

`data-table`, `custom-select`, and `dialog` ship Angular CDK `ComponentHarness` classes in the same folder as the component. They copy in with `npx ply-ui-cli add` — not a separate registry item. There is no `@base-ui/testing` package.

```ts
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DataTableHarness } from './components/data-table/data-table.harness';
import { DialogHarness } from './components/dialog/dialog.harness';

const loader = TestbedHarnessEnvironment.loader(fixture);
const table = await loader.getHarness(DataTableHarness);

const dialogs = TestbedHarnessEnvironment.documentRootLoader(fixture);
const dialog = await dialogs.getHarness(DialogHarness);
```

Dialog overlays are appended to `document.body`, so `loader(fixture)` cannot see them — use `documentRootLoader`. See `/getting-started/#testing`.

### Closing popovers and drawers on navigation

Overlays do not close themselves when the user clicks a link inside them:

- `ply-popover` exposes a public `close()` method — capture the component as a template ref and call it from panel links:

  ```html
  <ply-popover #menu>
    …
    <a routerLink="…" (click)="menu.close()">Link</a>
  </ply-popover>
  ```

- `ply-drawer` is closed by emitting its `closed` output (the trigger directive subscribes to it and detaches the overlay):

  ```html
  <ply-drawer #drawer>
    …
    <a routerLink="…" (click)="drawer.closed.emit()">Link</a>
  </ply-drawer>
  ```

---

## Layout Components

### BaseLayoutHeroFeaturesComponent
**Selector:** `ply-layout-hero-features`
**Standalone:** true

A complete marketing landing page layout: sticky header with anchor navigation and scroll shadow, hero with tilt-on-scroll product mockup, animated stats strip, logo cloud, features grid with scroll reveal, testimonials carousel, pricing with monthly/yearly toggle, install snippet tabs, roadmap timeline, FAQ accordion, CTA band and footer with newsletter signup. Renders a full page out of the box from demo defaults; sections whose array input is empty are omitted. Includes a built-in theme toggle (ThemeService) and a focus-trapped mobile drawer navigation.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| brandName | `string` | 'Acme' | Brand name shown in header, footer and copy. |
| badgeText | `string` | 'New — v2.0 is out' | Announcement badge above the hero title. |
| heroTitle | `string` | 'Build your next product,' | First line of the hero title. |
| heroHighlight | `string` | 'faster than ever' | Colored second line of the hero title. |
| heroSubtitle | `string` | (demo copy) | Hero subtitle paragraph. |
| primaryCtaText | `string` | 'Get Started for Free' | Primary hero CTA label. |
| secondaryCtaText | `string` | 'View Demo' | Secondary hero button label. |
| finePrint | `string` | (demo copy) | Fine print under the hero buttons. |
| showThemeToggle | `boolean` | true | Shows the light/dark toggle in the header. |
| navLinks | `HeroFeaturesNavLink[]` | Features/Testimonials/Pricing/FAQ | Anchor links to section ids. |
| stats | `HeroFeaturesStat[]` | 4 demo stats | Animated counters strip. Empty hides section. |
| logos | `HeroFeaturesLogo[]` | 6 demo brands | "Trusted by" logo cloud. Empty hides section. |
| features | `HeroFeaturesFeature[]` | 6 demo cards | Features grid. Empty hides section. |
| testimonials | `HeroFeaturesTestimonial[]` | 5 demo quotes | Testimonials carousel. Empty hides section. |
| plans | `HeroFeaturesPlan[]` | 3 demo tiers | Pricing tiers. Empty hides section. |
| installTabs | `HeroFeaturesInstallTab[]` | npm/yarn/pnpm | Install command tabs. Empty hides section. |
| usageSnippet | `string` | (demo snippet) | TypeScript usage snippet under the install tabs. Empty string hides it. |
| roadmap | `HeroFeaturesRoadmapItem[]` | 4 demo items | Roadmap timeline. Empty hides section. |
| faqs | `HeroFeaturesFaq[]` | 5 demo entries | FAQ accordion. Empty hides section. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| primaryCtaClick | `void` | Primary CTA clicked (hero, header, drawer or CTA band). |
| secondaryCtaClick | `void` | Secondary hero button clicked (e.g. open a demo dialog). |
| signInClick | `void` | "Sign in" clicked. |
| planSelected | `HeroFeaturesPlan` | A pricing plan CTA clicked. |
| newsletterSubmit | `string` | Newsletter form submitted, payload is the email. |
| navClicked | `string` | Navigation link clicked, payload is the section id. |

**Content projection:**
- `[hero-media]` — replaces the default browser mockup in the hero.
- `[header-actions]` — extra elements in the header action area.

**Exported interfaces:** `HeroFeaturesNavLink`, `HeroFeaturesStat`, `HeroFeaturesFeature`, `HeroFeaturesLogo`, `HeroFeaturesTestimonial`, `HeroFeaturesPlan`, `HeroFeaturesFaq`, `HeroFeaturesInstallTab`, `HeroFeaturesRoadmapItem`.

---

### HeroDemoDialogComponent
**Selector:** `ply-hero-demo-dialog`
**Standalone:** true

Product-demo dialog opened by `BaseLayoutHeroFeaturesComponent`'s "View Demo" secondary CTA (`secondaryCtaClick`). Shows a gradient video-placeholder panel with a play button and a caption, plus a footer with "Close" and "Get Started" buttons that both close the dialog via `ply-dialog-close`. Has no inputs or outputs; all content is static demo copy.

---

### PageMainComponent
**Selector:** `ply-page-main`
**Standalone:** true

The primary layout wrapper for a main page view. Sets up a full-width/height flex column container. Free shell (`npx ply-ui-cli add page-main`).

*No inputs or outputs.* Use with `<ply-page-main-header>`, `<ply-page-main-body>`, `<ply-page-main-footer>`.

---

### PageMainHeaderComponent
**Selector:** `ply-page-main-header`
**Standalone:** true

A header section for `ply-page-main`.

*No inputs or outputs.*

---

### PageMainBodyComponent
**Selector:** `ply-page-main-body`
**Standalone:** true

A body content section for `ply-page-main`.

*No inputs or outputs.*

---

### PageMainFooterComponent
**Selector:** `ply-page-main-footer`
**Standalone:** true

A footer section for `ply-page-main`.

*No inputs or outputs.*

---

### CardComponent
**Selector:** `ply-card`
**Standalone:** true

A flexible card container component used for grouping related content.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| horizontal | `boolean` | false | If true, the card lays out its children horizontally instead of vertically. |

---

### CardHeaderComponent
**Selector:** `ply-card-header`
**Standalone:** true

The header section of a ply-card. Usually contains the title and optional actions.

*No inputs or outputs.*

---

### CardBodyComponent
**Selector:** `ply-card-body`
**Standalone:** true

The main content container of a ply-card. Provides correct padding and spacing.

*No inputs or outputs.*

---

### CardFooterComponent
**Selector:** `ply-card-footer`
**Standalone:** true

The footer section of a ply-card. Usually contains action buttons (Save, Cancel, etc).

*No inputs or outputs.*

---

### TableDirective
**Selector:** `table[ply-table]`
**Standalone:** true

Free HTML table primitive. Directives attach to native `table` / `thead` / `tbody` / `tfoot` / `tr` / `th` / `td` / `caption` so the browser table model stays valid. Extra `class` values merge via `cn()`. For sort, page, select, or resize, use Pro `data-table`. Install: `npx ply-ui-cli add table`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |

Also: `thead[ply-table-header]`, `tbody[ply-table-body]`, `tfoot[ply-table-footer]`, `tr[ply-table-row]`, `th[ply-table-head]`, `td[ply-table-cell]`, `caption[ply-table-caption]` — each takes `class`. Import `TABLE_DIRECTIVES` (or the individual directive classes) from the copied `table/` folder.

---

### AccordionComponent
**Selector:** `ply-accordion`
**Standalone:** true

A container component for accordion items. Allows users to toggle sections of content.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| multi | `boolean` | false | Whether multiple accordion items can be open simultaneously. |

---

### AccordionItemComponent
**Selector:** `ply-accordion-item`
**Standalone:** true

A single item within a ply-accordion containing a header and body.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | false | Whether the accordion item is expanded. |
| disabled | `boolean` | false | Prevents toggling of the item. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| toggled | `boolean` | Emitted when the item is opened or closed. |

---

### AccordionItemHeaderComponent
**Selector:** `ply-accordion-item-header`
**Standalone:** true

The clickable header of an accordion item that toggles the body visibility.

*No inputs or outputs.*

---

### AccordionItemBodyComponent
**Selector:** `ply-accordion-item-body`
**Standalone:** true

The body content of an accordion item.

*No inputs or outputs.*

---

### TabsComponent
**Selector:** `ply-tabs`
**Standalone:** true

A container component for rendering tabbed navigation and content. Manages active states, handles tab switching, and provides scrollable tabs if they overflow horizontally.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| defaultTab | `number` | 0 | The zero-based index of the tab to open by default. |
| type | `'pills' \| 'underline' \| 'default' \| string` | — | The visual style type of the tabs. |
| position | `'top' \| 'left' \| 'right' \| 'bottom' \| string` | — | The positioning of the tab list relative to the content. |
| icon | `string` | — | A global icon to apply if applicable. |
| scrollRestricted | `boolean` | false | If true, restricts automatic scrolling behavior on the tab list. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| tabChanged | `Subject<TabComponent>` | Emitted whenever the active tab changes. |

---

### TabComponent
**Selector:** `ply-tab`
**Standalone:** true

The wrapper element for a single tab in a `ply-tabs` group.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | '' | A simple string label for the tab. If complex HTML is needed, project a `ply-tab-label` inside instead. |
| isActive | `boolean` | false | Tracks whether this tab is currently selected. |
| tabClass | `string` | 'cursor-pointer' | Additional CSS classes to apply to the tab trigger. |

---

### TabLabelComponent
**Selector:** `ply-tab-label`
**Standalone:** true

A custom label for a `ply-tab`. Allows you to add rich content (icons, badges, etc.) as the tab label.

*No inputs or outputs.*

---

### TabBodyComponent
**Selector:** `ply-tab-body`
**Standalone:** true

The actual content wrapper for a `ply-tab`. Content inside this tag is only rendered/visible when the parent tab is active.

*No inputs or outputs.*

---

### DividerComponent
**Selector:** `ply-divider`
**Standalone:** true

A layout component used to separate content visually. Can be rendered horizontally (default) or vertically.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| vertical | `boolean` | false | If true, renders the divider vertically instead of horizontally. |

---

---

### BaseLayoutAdminDataTableComponent
**Selector:** `ply-layout-admin-data-table`
**Standalone:** true

Full-page admin CRUD layout (pro tier) rendering a self-contained "Team Members" management screen backed by 24 seeded demo `UserRecord` rows: a debounce-free search box, status/role select filters, sortable column headers (asc → desc → unsorted cycle), page-size-8 pagination, and multi-row checkbox selection with a bulk-action bar (activate, deactivate, export selected, delete). Rows open a right-side `ply-drawer` with a read-only detail view and a reactive-forms create/edit mode (simulated 500ms save); deletes go through a confirm dialog via injected `DialogService`, mutations surface injected `ToastService` toasts, and Export downloads a CSV of the selected (or all filtered) rows. Shows skeleton rows during a simulated 700ms initial load and a `ply-empty-state` when filters match nothing; sortable headers and rows are keyboard-operable (Enter/Space) with `aria-sort` and per-row `aria-label`s, and an effect clamps the current page when mutations shrink the record set. Has no inputs or outputs — all state is internal signals; also exports the `UserRecord` interface and `RecordStatus`/`RecordRole` union types.

### BaseAdminDataTableConfirmDialogComponent
**Selector:** `ply-admin-data-table-confirm-dialog`
**Standalone:** true

Confirmation dialog used by the admin data table for single and bulk deletes, opened via `DialogService.open` with a `ConfirmDialogData` payload (`title`, `message`, `confirmLabel`, optional `danger` flag that switches the confirm button from `primary` to `danger` color). Receives its data through an injected `DialogContext<ConfirmDialogData, boolean>` and closes with `true` on confirm; Cancel and the close icon dismiss via `ply-dialog-close`. In `ngAfterViewInit` it upgrades the ancestor dialog container's role to `alertdialog` and wires `aria-labelledby`/`aria-describedby` to the rendered title and message. Has no inputs or outputs; the `ConfirmDialogData` interface is exported from this file.

---

### BaseLayoutBentoGridComponent
**Selector:** `ply-layout-bento-grid`
**Standalone:** true

Self-contained full-page marketing/dashboard layout (pro tier) for a fictional "Arc" platform: sticky navbar, hero section, an interactive bento grid, a CTA band, and a footer. The grid's seven cards (performance stats, code-deploy terminal, activity bar chart, integrations, security, changelog, global regions map) are drag-reorderable via CDK DragDrop handles, with a "Reset Layout" button restoring the default order and a comfortable/compact density toggle that switches gap and padding classes. All state is signal-based with OnPush change detection; a skeleton placeholder grid is shown for the first 700ms via a constructor `setTimeout`. Injects `ToastService` to confirm integration connect/disconnect toggles, clipboard copies of the code snippet (`navigator.clipboard`), and layout resets; the changelog card expands/collapses between 3 and all 6 entries, and activity bars show tooltips via `ply-tooltip`. Has no inputs or outputs; host is styled with a static `w-full h-full overflow-y-scroll block` class (no `class` input / `cn()` merge).

---

### BaseLayoutBlogSidebarComponent
**Selector:** `ply-layout-blog-sidebar`
**Standalone:** true

Full-page blog article layout with a sticky navbar, article body, and a sticky right sidebar (table of contents, tags, newsletter signup, related posts) — all content is hardcoded demo data. The host element scrolls (`overflow-y-scroll`) and listens to its own scroll events to drive a reading-progress bar in the navbar and toggle a floating "back to top" button; an IntersectionObserver keeps the active table-of-contents entry highlighted as sections scroll into view, and TOC clicks smooth-scroll to the target section. Below the `xl` breakpoint the sidebar is hidden and a collapsible mobile TOC is shown instead; injects `ToastService` for copy-link and newsletter-subscribe feedback (with basic email validation). Uses OnPush change detection with signal-based state.

---

### BaseLayoutDashboardComponent
**Selector:** `ply-layout-dashboard`
**Standalone:** true

Full-page admin dashboard layout (pro tier) with a responsive dark sidebar (fixed slide-in on mobile, icon-only mini rail on lg, full labels on xl), a sticky header (breadcrumb, order search, theme toggle, notifications popover, profile dropdown menu), and six switchable views driven by internal signals: an Overview view (stat cards, CSS bar chart with monthly/yearly toggle, top-products list, and a recent-orders table that opens a right-side order-details drawer and a per-row actions dropdown), an Analytics view (animated KPI counters plus sortable/pageable data tables in pill tabs), and empty-state placeholders for Projects/Team/Messages/Settings. Includes a Cmd/Ctrl+K command palette (document-level keydown listener) for navigation and actions, and a simulated 900ms loading state rendered with skeletons. All content is hardcoded demo data — the component takes no inputs and emits no outputs; it injects `ThemeService` (dark-mode toggle) and `ToastService` (feedback for demo actions like export, refund, refresh), and uses `OnPush` change detection with a static host class `w-full h-full overflow-y-scroll block`.

---

### BaseLayoutDocsKbComponent
**Selector:** `ply-layout-docs-kb`
**Standalone:** true

Full-page documentation / knowledge-base layout template (pro tier) with a sticky header, a left `ply-tree` navigation sidebar, a center content column of documentation sections with `ply-code` snippets, and a right "On this page" TOC that scrollspies the reader's position via an IntersectionObserver rooted on the scrollable host. Opens a `ply-command-palette` on Cmd+K / Ctrl+K (palette commands scroll to sections, toggle the theme via the injected `ThemeService`, or copy the page URL to the clipboard with a `ToastService` confirmation); a back-to-top button appears after the host scrolls past 400px. On smaller viewports the nav tree and TOC collapse into fixed overlay drawers that use `cdkTrapFocus cdkTrapFocusAutoCapture`, close on Escape or backdrop click, and restore focus to their toggle buttons. Uses OnPush change detection with all mutable state held in signals; has no inputs or outputs — all content and navigation data is defined internally.

---

### BaseLayoutEcommerceGridComponent
**Selector:** `ply-layout-ecommerce-grid`
**Standalone:** true

Full-page e-commerce storefront layout (pro tier) with a sticky navbar (cart/wishlist count badges), breadcrumb + sort/view-mode toolbar, a filter sidebar (categories, price-range checkboxes, color swatches, star ratings — rendered as a desktop column and a mobile slide-in panel), a paginated product grid/list with active-filter chips, a 300ms loading skeleton, an empty state, cart and wishlist `ply-drawer` panels (with a free-shipping progress bar at a $75 threshold), and a footer. Entirely self-contained: it renders a hardcoded demo `Product[]` and manages all filter/sort/cart/wishlist state internally with signals and computed values (OnPush, zoneless-safe) — it has no inputs or outputs. Injects `DialogService` to open `BaseProductQuickViewComponent` for product quick view and `ToastService` for add-to-cart/wishlist notifications; also exports the `Product` and `CartItem` interfaces. Host class: `w-full h-full overflow-y-scroll block`.

### BaseProductQuickViewComponent
**Selector:** `ply-product-quick-view-dialog`
**Standalone:** true

Product quick-view dialog body built from the `ply-dialog` sub-components (header with close icon-button, body, footer). It is opened via `DialogService.open()` and receives its `Product` through the injected `DialogContext` rather than an input; it renders the badge/discount, star rating, price with strikethrough original price, color, and stock status, and closes the dialog with result `'add-to-cart'` or `'wishlist'` (the Add to Cart button is disabled when the product is out of stock). No inputs or outputs.

---

### BaseLayoutInboxMessagingComponent
**Selector:** `ply-layout-inbox-messaging`
**Standalone:** true

A three-pane inbox / support-ticket messaging layout: a searchable, status-filterable conversation list (All / Unread / Open / Closed), a message thread with an @-mention reply composer (auto-growing textarea, Enter sends, Shift+Enter for a newline, Enter is ignored while the mention dropdown is open) plus multi-file attachments, and a collapsible contact/ticket detail panel showing tags, participants, and all thread attachments. Fully self-contained demo component with no inputs or outputs — conversation data is seeded internally in signals, and actions (select, send, mark unread, archive) mutate that local state; on small screens it switches between list/thread/detail as single mobile panes, list rows are keyboard-activatable (Enter/Space), and the thread uses `role="log"` with `aria-live="polite"`. Empty states render via `ply-empty-state` when no conversations match the search or filter or no conversation is selected; exports the `InboxConversation`, `InboxMessage`, `InboxAttachment`, `TicketStatus`, and `InboxConversationFilter` types.

---

### BaseLayoutInboxWorkspaceComponent
**Selector:** `ply-layout-inbox-workspace`
**Standalone:** true

Linear-style workspace inbox (pro application layout), distinct from `layout-inbox-messaging`. Three panes: a searchable issue list with views (All / Unread / Assigned / Mentions / Subscribed / Snoozed) and a status filter; a comment thread with description, activity events, `@`-mention composer (Enter sends, Shift+Enter newline), and file attachments; a properties panel for status, priority, assignee, due date, labels, subscribers, and linked issues. Seeded for the catalog. Optional inputs `threads`, `team`, `projects`, `labels`, and `currentUserId` sync from a parent store; actions emit `threadSelected`, `replySent`, `statusChanged`, `priorityChanged`, `assigneeChanged`, `labelsChanged`, `dueDateChanged`, `readChanged`, `subscribedChanged`, `snoozedChanged`, `threadCreated`, and `threadCanceled` while still updating local state so the demo works unbound. New issue, mark unread, subscribe, snooze presets, copy ID, and cancel are working. Mobile switches list / thread / properties panes. Host: `block h-full w-full overflow-hidden`. Exports workspace inbox types from `layout-inbox-workspace.types.ts`. Install: `npx ply-ui-cli add layout-inbox-workspace`.

---

### BaseLayoutSchedulerComponent
**Selector:** `ply-layout-scheduler`
**Standalone:** true

Full-page scheduler / full-calendar application layout (pro tier): month, week, and day views with seeded demo events, Work/Personal/Team calendar filters, search, a mini `ply-calendar` sidebar, create/edit/delete via `BaseSchedulerEventFormDialogComponent` + `DialogService`, toasts via `ToastService`, and CDK drag-and-drop to reschedule events across days (time preserved). Install: `npx ply-ui-cli add layout-scheduler`.

---

### BaseSchedulerEventFormDialogComponent
**Selector:** `ply-scheduler-event-form-dialog`
**Standalone:** true

Create/edit dialog for scheduler events. Opened via `DialogService.open` with `SchedulerEventFormData`; closes with `SchedulerEventFormResult` (or `delete: true` when editing). Reactive form fields: title, description, start/end (`datetime-local`), calendar, color, all-day.

---

### BaseLayoutFileManagerComponent
**Selector:** `ply-layout-file-manager`
**Standalone:** true

Full-page file manager application layout (pro tier): `ply-tree` folder sidebar, path breadcrumbs, grid/list views, search + starred filter, `ply-file-upload` dropzone, item actions (open/rename/star/download/delete) via dropdown menus, rename via `BaseFileManagerRenameDialogComponent`, and file preview in a right `ply-drawer`. Install: `npx ply-ui-cli add layout-file-manager`.

---

### BaseFileManagerRenameDialogComponent
**Selector:** `ply-file-manager-rename-dialog`
**Standalone:** true

Rename dialog for file manager items. Opened via `DialogService.open` with `FileManagerRenameData` (`name`, `kind`); closes with `FileManagerRenameResult`.

---

### BaseLayoutKanbanBoardComponent
**Selector:** `ply-layout-kanban-board`
**Standalone:** true

Full-page kanban board (pro application layout) — bind `columns` from a store or use the seed. Mutations update local state and emit so a parent can persist them. Set `embedded` to hide the Kanboard chrome (use it inside a product shell) and open cards via `taskOpened` instead of the detail dialog. Cards are draggable within and across columns via `@angular/cdk/drag-drop`. The drag preview restores white (or dark slate) fill, rounded border, padding, and a wide shadow because CDK's `cdk-resets` layer otherwise sets `background: none`. Optional inputs `columns`, `team`, `projectName`, `projectKey`, `embedded`, and `allowAddColumn` sync from a parent store; actions emit `taskMoved`, `taskCreated`, `taskOpened`, `taskDeleted`, and `columnAdded`. Add-column is off when `columns` is bound unless `allowAddColumn` is true. Injects `DialogService` for `BaseTaskDetailDialogComponent` / `BaseTaskFormDialogComponent` and `ToastService` for create/delete toasts. Search matches title or optional `key`; the filter menu toggles per-priority chips. Exports `KanbanTask`, `KanbanColumn`, `KanbanMember`, and the older `Task` / `Column` / `Priority` aliases.

### BaseTaskDetailDialogComponent
**Selector:** `ply-task-detail-dialog`
**Standalone:** true

Read-only task detail dialog for the kanban board, designed to be opened via `DialogService.open()` with a `Task` as dialog data (injects `DialogContext<Task, TaskDetailResult>`) rather than placed in templates — it has no inputs or outputs. Renders the task's tags, priority badge, title, description, and a metadata grid (assignee, due date, comments, attachments) inside `ply-dialog` chrome. The Delete Task button closes the dialog with `{ action: 'delete' }` (`TaskDetailResult`); the header X and Close buttons dismiss via `ply-dialog-close` without a result.

### BaseTaskFormDialogComponent
**Selector:** `ply-task-form-dialog`

**Standalone:** true

New-task creation dialog for the kanban board, opened via `DialogService.open()` with `TaskFormData` (members list with ids, column list, default column id) as dialog data — injects `DialogContext<TaskFormData, TaskFormResult>` and has no inputs or outputs. Hosts a reactive `FormGroup` with fields for title (required), description, column (required, defaults to `defaultColumnId`), priority (required, defaults to `'medium'`), assignee id (required, defaults to the first member), due date, and optional tag label, built from `ply-input-group`/`ply-select` library controls. Submitting an invalid form calls `markAllAsTouched()` and shows the title error; a valid submit closes the dialog with the form value as `TaskFormResult`.

---

### BaseLayoutMagazineGridComponent
**Selector:** `ply-layout-magazine-grid`
**Standalone:** true

Full-page magazine/blog landing layout ("Meridian") with a sticky blurred navbar, mobile slide-in category menu, featured hero article (with expandable "reader mode" excerpt), secondary article stack, numbered Editor's Picks strip, a Latest Stories grid with 2-column/3-column/list view toggle, skeleton loading state (simulated 900ms delay), and "Load more" pagination (4 articles per page). A desktop-only sidebar provides trending-tag filtering, a newsletter signup with regex email validation, and social links; a category nav, tag toggle, and text search combine into filters with a sticky active-filter chip bar and empty states when nothing matches. Injects `ToastService` for feedback on bookmarking (per-article reading list held in an internal `Set` signal), opening articles, and newsletter subscription. All article data is hardcoded demo content and all state is internal signals — the component has no inputs or outputs; the host is styled `w-full h-full overflow-y-scroll block` and uses OnPush change detection.

---

### BaseLayoutOnboardingFlowComponent
**Selector:** `ply-onboarding-flow-layout`
**Standalone:** true

Full-page four-step signup/onboarding layout (Account, Verify, Workspace, Invite) built on `BaseStepper`/`BaseStep` with hidden built-in navigation and its own Back/Next/Submit controls; step progression is gated per step (account created, OTP verified, workspace form valid) and clicking the stepper only allows jumping back to completed steps. Includes a reactive account form with password-match validation, show/hide password toggles and a `ply-password-strength` meter, a 6-digit `ply-otp-input` verification step with a 30-second resend cooldown timer (cleared in `ngOnDestroy`), workspace industry/team-size selects, and chip-based teammate invites (validated, deduplicated, max 5). Injects `ToastService` for feedback; account creation, OTP verification, and finalization are simulated with `setTimeout`, ending in a finalizing spinner and a welcome screen whose button routes to `/layouts/dashboard` via `RouterLink`. All internal state is signal-based (OnPush change detection); the component exposes no inputs or outputs.

---

### BaseLayoutPortfolioGalleryComponent
**Selector:** `ply-layout-portfolio-gallery`
**Standalone:** true

Full-page portfolio/agency layout ("Aria Studio") with sticky navbar, mobile slide-in menu, hero with featured project card, stats strip, services grid, filterable masonry project gallery, testimonials, process steps, gradient CTA, and footer. All content (projects, stats, clients, services, testimonials, process steps) is hard-coded demo data; the gallery supports category filter tabs with counts, an empty state when a filter has no matches, and incremental "load more" pagination (6 projects initially, +3 per click) driven by signals/computed with OnPush change detection. Injects `DialogService` to open `BaseProjectCaseStudyComponent` (per-project case study) and `BaseContactDialogComponent` (contact form, showing a success toast on submit), and `ToastService` for demo "visit live site"/client-click actions; in-page navigation uses smooth `scrollIntoView`. Host is styled `w-full h-full overflow-y-scroll block`. No inputs or outputs.

### BaseProjectCaseStudyComponent
**Selector:** `ply-project-case-study-dialog`
**Standalone:** true

Case-study dialog (width 640) for a single `Project`, opened via `DialogService` — reads the project from an injected `DialogContext<Project>` rather than inputs. Renders a gradient banner with the project icon, category badge and year, plus title, client, description, and tag pills; the footer offers a Close button (`ply-dialog-close`) and a "Visit Live Site" button that shows an info toast via `ToastService` (demo action). No inputs or outputs.

### BaseContactDialogComponent
**Selector:** `ply-portfolio-contact-dialog`
**Standalone:** true

Contact-form dialog (width 480) opened via `DialogService`. Contains a reactive `FormGroup` with name (required), email (required + email), project type select (defaults to 'Branding'), and message (required, min length 10), showing inline validation errors once fields are touched. On valid submit it closes the dialog through the injected `DialogContext`, resolving with a `ContactFormResult`; if invalid it marks all controls touched instead. No inputs or outputs.

---

### BaseLayoutPricingComponent
**Selector:** `ply-layout-pricing-page`
**Standalone:** true

Full-page pricing layout (pro tier): sticky navbar, hero with a monthly/annual billing toggle and a team-size `ply-input-spinner` (1–500 seats), three hardcoded plan cards (Starter/Professional/Enterprise), a trusted-by logo strip, a feature comparison table, an FAQ accordion, a gradient CTA band, and a footer. Prices react to billing cycle and seat count via signals (`billingCycle`, `seatCount`); annual view shows a "Save N%" line and multi-seat totals. Injects `DialogService` and `ToastService`: every plan CTA opens `BasePlanSignupDialogComponent` (mode `'contact'` when the plan's cta is "Contact Sales", otherwise `'trial'`) and shows a success toast when the dialog returns a `PlanSignupResult`. Simulates loading with skeleton cards for 700ms after construction. All plan/comparison/FAQ content is internal — the component has no inputs or outputs; host is a full-size scrollable block.

### BasePlanSignupDialogComponent
**Selector:** `ply-plan-signup-dialog`
**Standalone:** true

Dialog content component intended to be opened through `DialogService.open()` rather than placed in templates — it injects `DialogContext<PlanSignupData, PlanSignupResult>` for its data (`planName` plus mode `'trial' | 'contact'`, which switches the heading, intro copy, and submit label). Renders a reactive form (name required, email required + valid format, company optional) inside a 440px `ply-dialog` with close/cancel buttons; `submit()` marks all fields touched when invalid, otherwise closes the dialog with the form value as `PlanSignupResult` (`name`, `email`, `company`). Has no inputs or outputs.

---

### BaseLayoutSettingsAccountComponent
**Selector:** `ply-layout-settings-account`
**Standalone:** true

Full-page account settings layout with a desktop sidebar (avatar/user header, "Back to Dashboard" routerLink to `/layouts/dashboard`) and a sticky mobile tab bar, switching between five tabs — Profile, Billing, Notifications, and Team delegate to `ply-form-profile-settings`, `ply-form-billing`, `ply-form-notifications`, and `ply-form-team-invite`, while the Security tab is built inline: a change-password reactive form (required current password, min-length-8 new password, cross-field passwords-match validator, per-field show/hide toggles, `ply-password-strength` meter, aria-invalid/aria-describedby error wiring), a two-factor `ply-toggle`, an active-sessions list with per-session and "Sign out all others" actions, and a `ply-form-delete-account` danger zone. Injects `FormBuilder` and `ToastService` (success/info toasts on password save, 2FA toggle, and session sign-out) and uses OnPush change detection with signal-based state. All data is hard-coded demo content (user "Sarah Mitchell", three sessions); on init it renders `ply-skeleton` placeholders for ~700ms before showing content, and the simulated password save resets the form after ~800ms. Has no inputs or outputs.

---

### BaseLayoutSplitScreenComponent
**Selector:** `ply-layout-split-screen`
**Standalone:** true

Full-page SaaS marketing landing layout (fictional "Pulse" product) built from alternating 50/50 split sections: sticky navbar, hero split with a simulated dashboard card (Deployments/Analytics/Logs tabs driven by a signal), "trusted by" logo strip, terminal-simulation feature split with numbered steps, 6-card features grid, testimonial split with a carousel (auto-advances every 5s via `setInterval`, cleared in `ngOnDestroy`; prev/next/dot controls), gradient CTA band, and footer. Shows a skeleton placeholder for ~700ms on init before revealing content, and the host element is a full-size scroll container (`w-full h-full overflow-y-scroll block`). Injects `DialogService` to open the demo and signup dialogs and `ToastService` to show a success toast with the submitted name/email after signup; a "Features" nav button smooth-scrolls to the features section. No inputs or outputs — all content is hardcoded demo data.

### BaseSplitScreenDemoDialogComponent
**Selector:** `ply-split-screen-demo-dialog`

Static 640px-wide dialog opened from the landing page's "Watch Demo" buttons. Renders a gradient video-placeholder panel with a decorative play button and duration label, a short description paragraph, and a footer whose Close and "Get Started Free" buttons both close the dialog via `ply-dialog-close`. No inputs, outputs, or logic.

### BaseSplitScreenSignupDialogComponent
**Selector:** `ply-split-screen-signup-dialog`

420px-wide signup dialog with a reactive form (`name` required, `email` required + email-validated, `company` optional) rendered with `ply-input-group` fields and inline error messages shown once a control is touched. Injects `DialogContext<unknown, SignupResult>`; on submit, an invalid form is marked all-touched, while a valid form closes the dialog with a `SignupResult` (`{ name, email, company }`) that the opener receives. Cancel and the header close button dismiss without a result. No inputs or outputs.

## Data Display

### AvatarComponent
**Selector:** `ply-avatar`
**Standalone:** true

A highly customizable avatar component for displaying user profile images or initials. Includes support for presence indicators (active/inactive) and various shapes/sizes.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| avatarUrl | `string` | '' | The URL of the image to display. Falls back to initials or a placeholder icon. |
| shape | `'circle' \| 'square'` | 'square' | The geometric shape of the avatar. |
| status | `'active' \| 'inactive'` | — | Optional presence status to display an indicator dot (e.g. green for active). |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | 'md' | The size of the avatar. |
| initials | `string` | '' | Text initials to display if no avatarUrl is provided. |

---

### BadgeComponent
**Selector:** `ply-badge`
**Standalone:** true

A configurable badge component to display tiny statuses, counts, or tags.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'primary' \| 'danger' \| 'success' \| 'accent' \| 'warning' \| 'slate-light' \| 'primary-light' \| 'danger-light' \| 'success-light' \| 'accent-light' \| 'warning-light'` | 'primary' | The visual color mapping. |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | 'md' | The size of the badge. |
| shape | `'rectangular' \| 'circle'` | 'circle' | The shape (roundness) of the badge. |

---

### KbdComponent
**Selector:** `ply-kbd`
**Standalone:** true

Inline keyboard glyph for shortcuts in copy, menus, and docs. Renders a native `<kbd>` so assistive tech treats it as a key.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra Tailwind classes merged onto the inner `<kbd>` via `cn()`. |

---

### AspectRatioComponent
**Selector:** `ply-aspect-ratio`
**Standalone:** true

Box that preserves a width-to-height ratio via CSS `aspect-ratio`. Project media or any block inside; the inner slot is stretched to fill the box.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| ratio | `string` | '16/9' | CSS `aspect-ratio` value (`16/9`, `1`, `4/3`, …). |

---

### ScrollAreaComponent
**Selector:** `ply-scroll-area`
**Standalone:** true

Overflow container with a thin, theme-aware scrollbar. Give it an explicit height (for example `class="h-64"`) so the inner content can scroll.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. Include a height so overflow can scroll. |

---

### TreeComponent
**Selector:** `ply-tree`
**Standalone:** true

A hierarchical tree view component for displaying nested data structures. Supports expanding/collapsing folders and node selection. Pro tier.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| nodes | `{ label: string; icon?: string; children?: TreeNode[]; expanded?: boolean; selected?: boolean; data?: Record<string, unknown> }[]` | [] | The hierarchical array of nodes to render. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| nodeClick | `{ label: string; icon?: string; children?: TreeNode[]; expanded?: boolean; selected?: boolean; data?: Record<string, unknown> }` | Emitted when a user clicks on a node's label/body. |
| nodeExpand | `{ label: string; icon?: string; children?: TreeNode[]; expanded?: boolean; selected?: boolean; data?: Record<string, unknown> }` | Emitted when a folder node is expanded. |
| nodeCollapse | `{ label: string; icon?: string; children?: TreeNode[]; expanded?: boolean; selected?: boolean; data?: Record<string, unknown> }` | Emitted when a folder node is collapsed. |

---

### SelectTreeComponent
**Selector:** `ply-select-tree`
**Standalone:** true

Pro single-select dropdown that presents options as an expandable tree (combobox trigger + fixed panel). Supports label search (auto-expands ancestors of matches), leaf-only selection, clearable reset to `null`, disabled nodes, and keyboard navigation. Implements ControlValueAccessor — the form value is the selected node’s `value`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host via `cn()`. |
| nodes | `SelectTreeNode[]` | [] | Hierarchical options (`label`, `value`, optional `children` / `icon` / `expanded` / `disabled` / `data`). |
| placeholder | `string` | 'Select…' | Shown when nothing is selected; also used as the trigger aria-label. |
| onlyLeaf | `boolean` | false | When true, only nodes without children can be selected (folders still expand/collapse). |
| clearable | `boolean` | false | Shows a clear control that writes `null`. |
| disabled | `boolean` | false | (two-way) Disables the control; also set by forms via `setDisabledState`. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| selectionChange | `unknown \| null` | Emitted whenever the selected value changes (including clear). |

---

### CalendarComponent
**Selector:** `ply-calendar`
**Standalone:** true

A date picker calendar component that supports single date and date-range selection. Free tier. (`ply-datepicker` and `ply-date-range-picker` remain Pro.) Month view, day grid, and keyboard focus are signals (`viewDate`, `days`, `focusedDate`) so the grid stays current under OnPush / zoneless. The grid is a keyboard-operable date grid: arrows move by day/week, Home/End jump to month start/end, PageUp/PageDown change month, Enter/Space select.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| mode | `'single' \| 'range'` | 'single' | The selection mode. 'single' allows picking one day, 'range' allows picking start and end dates. |
| selectedDate | `Date \| null` | null | The currently selected date (only used in 'single' mode). |
| rangeStart | `Date \| null` | null | The start date of the selected range (only used in 'range' mode). |
| rangeEnd | `Date \| null` | null | The end date of the selected range (only used in 'range' mode). |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| dateSelected | `Date` | Emits the selected Date when mode is 'single' and a day is clicked. |
| rangeSelected | `{ start: Date \| null; end: Date \| null }` | Emits an object containing start and end Dates when mode is 'range'. |

---

---

### AnimatedCounterComponent
**Selector:** `ply-animated-counter`
**Standalone:** true

Free tier. Animates a number from a start value to the target the first time the host element enters the viewport (IntersectionObserver, threshold 0.2). The count runs on `requestAnimationFrame` outside the Angular zone with a cubic ease-out curve, re-entering the zone to update a `displayed` signal rendered in a `tabular-nums` span; formatting supports fixed decimals, a thousands separator, and prefix/suffix strings. On the server (non-browser platform) it skips animation and renders the final formatted value immediately; on any input change it resets the display to the formatted `from` value. Host classes are merged via `cn()` with a base `inline-block` class.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `inline-block` class via `cn()`. |
| value | `number` | 0 | Target number to count up to. |
| from | `number` | 0 | Starting number the animation begins from. |
| duration | `number` | 1500 | Animation duration in milliseconds. |
| decimals | `number` | 0 | Number of decimal places shown in the formatted output. |
| prefix | `string` | '' | String prepended to the formatted number (e.g. `$`). |
| suffix | `string` | '' | String appended to the formatted number (e.g. `%`). |
| separator | `string` | ',' | Thousands separator; pass an empty string to disable grouping. |

---

### AvatarGroupComponent
**Selector:** `ply-avatar-group`
**Standalone:** true

Displays a stack of overlapping circular avatars with an overflow count badge. Renders at most `max` items; the remainder collapses into a "+N" bubble. Each avatar shows its image when `avatarUrl` is set, otherwise falls back to `initials`, then the uppercased first letter of `name`, then "?". Avatars overlap tightly at rest and spread apart on hover of the group (animated margin transition). Uses OnPush change detection with signal inputs; host classes are merged with the `class` input via `cn()`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's base classes (`flex items-center group`) via `cn()`. |
| items | `AvatarGroupItem[]` | [] | Avatar entries (`avatarUrl`/`initials`/`name`) to render. Empty array renders nothing. |
| max | `number` | 4 | Maximum avatars shown before the rest collapse into a "+N" counter bubble. |
| size | `AvatarSize` | 'md' | Avatar size (`xs`–`xl` or `full`); controls width/height and text size. Unknown values fall back to `md`. |

---

### CountdownComponent
**Selector:** `ply-countdown`
**Standalone:** true

Countdown timer that renders a horizontal row (`flex gap-2` host) of boxed digit tiles — days, hours, minutes, seconds — each with a label underneath. Remaining time is computed once for SSR/prerender HTML; the 1s client ticker starts in `afterNextRender` (gated on a `clientReady` signal) so it survives hydration on static hosts where `ngOnInit` does not re-run. Ticks toward `targetDate` (clamped at zero, values zero-padded, state held in signals for zoneless CD); the timer restarts whenever `targetDate` changes and the interval is cleared on finish and on destroy. Also exports the `CountdownTime` interface (`days`, `hours`, `minutes`, `seconds`, `total` ms).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes, merged with the base `flex gap-2` via `cn()`. |
| targetDate | `Date \| string` | required | Date/time to count down to; changing it restarts the timer. |
| showDays | `boolean` | true | Whether to render the days tile (`booleanAttribute` transform). |
| daysLabel | `string` | 'Days' | Label under the days tile. |
| hoursLabel | `string` | 'Hours' | Label under the hours tile. |
| minutesLabel | `string` | 'Min' | Label under the minutes tile. |
| secondsLabel | `string` | 'Sec' | Label under the seconds tile. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| tick | `CountdownTime` | Emitted every second (and immediately on start) with the remaining time breakdown. |
| finished | `void` | Emitted once when the countdown reaches zero; the interval then stops. |

---

### DataTableComponent
**Selector:** `ply-data-table`
**Standalone:** true

Pro tier. Install: `npx ply-ui-cli add data-table`. For a static HTML table without sort/page/select, use free `table` (`npx ply-ui-cli add table`) instead. Feature-rich table (generic over row type `T extends DataTableRow`) that renders cells as `row[column.key]` by default. Override a column with `<ng-template plyTableCell="key" let-row let-value="value">` (import `TableCellDirective`); project `<ng-template plyTableEmpty>` to replace `emptyMessage`. Client-side sort/page by default; set `serverSide` to skip client sort/slice (parent fetches the current page into `data` and the full count into `totalItems`). Sortable headers (requires both the `sortable` input and `column.sortable`) cycle asc → desc → unsorted, reset to page 1, set `aria-sort`, and support Enter/Space. Pagination is a windowed paginator (max 5 page buttons) when `pageable` is true. `selectable` adds a checkbox column bound to `selected` (identity via `rowKey`, default `'id'`). `resizable` lets users drag header edges (`column.width` start width, `column.minWidth`, per-column `resizable: false` to lock). `virtualize` windows rows in a fixed-height viewport (`viewportHeight`, `rowHeight`) — best with `pageable` off and large `data`. `loading` shows skeleton rows (capped at 5); empty pages show `emptyMessage` unless `plyTableEmpty` is projected. Checkbox clicks do not emit `rowClick`. Interactive cell widgets should `$event.stopPropagation()` so they do not also fire `rowClick`. OnPush; host class `block` merged with `class` via `cn()`. Cookbook: `/cookbooks/invoice-table/`. Unit tests: `DataTableHarness` with `TestbedHarnessEnvironment.loader(fixture)`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `block` class via `cn()`. |
| columns | `TableColumn[]` | [] | Column definitions (`key`, `label`, optional `sortable` / `width` / `minWidth` / `resizable` / `align`). Cells default to `row[key]`; override with `plyTableCell`. |
| data | `T[]` | [] | Row objects. When `serverSide` is set, pass the current page only. |
| sortable | `boolean` | false | Enables header click sorting for columns with `sortable: true`. Accepts attribute shorthand via `booleanAttribute`. |
| pageable | `boolean` | false | Shows the paginator when the row count exceeds `pageSize` (or when `serverSide` + `totalItems` require it). |
| pageSize | `number` | 10 | Rows per page (client slice, or the page size advertised to the server). |
| loading | `boolean` | false | Shows pulsing skeleton rows instead of data. |
| striped | `boolean` | false | Tints odd rows with a subtle background. |
| bordered | `boolean` | false | Adds outer table border and per-row bottom borders. |
| hoverable | `boolean` | true | Applies a hover background to body rows. |
| emptyMessage | `string` | i18n.noDataAvailable | Text shown when `data` is empty and not loading. Defaults to `provideBaseUiI18n().noDataAvailable`. Replaced by `plyTableEmpty` when projected. |
| selectable | `boolean` | false | Adds a checkbox column. Bind `selected` to an array of `rowKey` values. |
| rowKey | `string` | 'id' | Property used as the selection identity. |
| selected | `Array<string \| number>` | [] | Selected row ids (or whatever `rowKey` points at). Two-way (`model`). |
| resizable | `boolean` | false | Drag the header edge to resize columns. Uses `column.width` as the start width. |
| serverSide | `boolean` | false | Skip client sort/slice. Parent fetches; pass the current page in `data` and the full count in `totalItems`. |
| totalItems | `number` | 0 | Total rows across all pages. Required for the paginator when `serverSide` is set. |
| virtualize | `boolean` | false | Window rows in a fixed-height viewport. Best with `pageable` off and large `data`. |
| rowHeight | `number` | 44 | Fixed row height in pixels used for windowing. Must match the rendered row. |
| viewportHeight | `number` | 400 | Viewport height in pixels when `virtualize` is set. |
| currentPage | `number` | 1 | Current page (1-based). Two-way (`model`) for server-driven tables. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| rowClick | `T` | Emitted with the row object when a body row is clicked. Checkbox clicks do not fire this. |
| sortChange | `DataTableSortChange` (`{ key: string; direction: TableSortDirection }`) | Emitted after each sort toggle; `key` is '' and `direction` is '' when sorting is cleared (third click). |
| pageChange | `DataTablePageChange` (`{ page: number; pageSize: number }`) | Emitted when the paginator changes page. Always fired in `serverSide` mode. |
| selectionChange | `T[]` | Emitted with the selected row objects whenever the checkbox column changes. |

**Content:**
| Selector | Description |
|---------|-------------|
| `ng-template plyTableCell="columnKey"` | Cell renderer for that `TableColumn.key`. Context: `$implicit`/`row`, `value`, `column`, `index`. Import `TableCellDirective`. |
| `ng-template plyTableEmpty` | Replaces `emptyMessage` when the table has no rows. Import `TableEmptyDirective`. |

---

### SkeletonComponent
**Selector:** `ply-skeleton`
**Standalone:** true

Loading-placeholder skeleton that renders `count` pulsing gray blocks (`animate-pulse`, light/dark aware) in the chosen variant. `text`, `circular`, and `rectangular` render simple blocks sized via the `width`/`height` inputs (circular defaults to 40px × 40px); `card` renders a composite card layout (avatar circle, title/subtitle bars, three text lines) and `table-row` renders avatar + text + trailing-cell rows, both repeated `count` times. Uses OnPush change detection and signal inputs; the host gets `block` merged with the `class` input via `cn()`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host element's class list via `cn()` (aliased to internal `extraClass`). |
| variant | `SkeletonVariant` | 'text' | Skeleton shape: `'text' \| 'circular' \| 'rectangular' \| 'card' \| 'table-row'`. |
| count | `number` | 1 | Number of skeleton items to repeat. |
| width | `string \| undefined` | — | Inline CSS width applied to simple variants (text/circular/rectangular); ignored by card and table-row layouts. |
| height | `string \| undefined` | — | Inline CSS height applied to simple variants; ignored by card and table-row layouts. |
| animated | `boolean` | true | Toggles the `animate-pulse` shimmer animation (accepts boolean attribute via `booleanAttribute` transform). |

---

### StatCardComponent
**Selector:** `ply-stat-card`
**Standalone:** true

Dashboard metric card with two layouts. **Classic** (default): large value over a label, optional tinted icon bubble on the left, and an optional trend row (green arrow-up or red arrow-down with preformatted trend text) plus a muted caption. **Metric** (`variant="metric"`): Motif Admin–style vertical KPI — uppercase micro-label, delta pill from a ratio (`delta`), large value, inline SVG sparkline from `series` (no Pro `ply-chart` dependency), and footer caption. Host classes merge via `cn()` (`block` for classic; bordered flex column with hover for metric). OnPush with signal inputs. Exports `StatCardVariant` (`'classic' | 'metric'`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host classes via `cn()`. |
| variant | `StatCardVariant` | 'classic' | `classic` = icon-left tile; `metric` = delta pill + sparkline stack. |
| value | `string` | '' | The large metric value (e.g. "$48,295"). |
| label | `string` | '' | Label above the value (classic) or uppercase header (metric). |
| trend | `string \| undefined` | — | Classic: preformatted trend text (e.g. "+12.5%"); omitting it hides the trend row. |
| trendUp | `boolean \| undefined` | — | Classic: true = green up arrow, false = red down arrow. |
| icon | `string \| undefined` | — | Classic: optional icon name in a tinted bubble. |
| color | `StatCardColor` | 'primary' | Classic: tint for the icon bubble and stroke. |
| caption | `string \| undefined` | — | Classic: beside trend when set. Metric: under sparkline when non-empty. |
| delta | `number \| undefined` | — | Metric: period change as a ratio (`0.062` → "+6.2%"); drives the pill and sparkline color. |
| series | `readonly number[]` | `[]` | Metric: sparkline values; empty hides the chart. |

---

### TimelineComponent
**Selector:** `ply-timeline`
**Standalone:** true

Vertical timeline container (`flex flex-col` host) that projects `ply-timeline-item` children via `ng-content`. OnPush change detection.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host classes via `cn()`. |

### TimelineItemComponent
**Selector:** `ply-timeline-item`
**Standalone:** true

A single event within a `ply-timeline`: a colored dot (optionally containing a sprite icon) with a connecting line to the next item, an optional timestamp label, and projected content. OnPush change detection.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host classes via `cn()`. |
| color | `TimelineColor` | 'primary' | Dot color (primary/success/danger/warning/accent/default). |
| icon | `string \| undefined` | — | Optional icon name from the sprite displayed inside the dot. |
| time | `string \| undefined` | — | Optional timestamp label shown above the content. |
| last | `boolean` | false | Set on the final item to hide the connecting line (`booleanAttribute` — bare attribute works). |

## Form Controls

### CustomSelectComponent
**Selector:** `ply-custom-select`
**Standalone:** true

A highly customizable dropdown select component. Allows mapping arrays of objects to display labels and selection values. Override listbox rows with `<ng-template plySelectOption let-option let-label="label">` (import `CustomSelectOptionDirective`). Unit tests: `CustomSelectHarness` with `TestbedHarnessEnvironment.loader(fixture)`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | '' | Optional label text displayed above the select field. |
| placeholder | `string` | 'Select an option' | Text shown when no option is selected. |
| options | `unknown[]` | [] | The array of items to show in the dropdown. |
| displayKey | `string` | 'label' | The object property key to display as the label. |
| valueKey | `string` | 'value' | The object property key to use as the emitted value. |
| disabled | `boolean` | false | Disables the dropdown from opening. |
| multiple | `boolean` | false | (Experimental) Set to true to allow multiple selection. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| selectionChange | `unknown` | Emits the selected value whenever the user clicks an option. |

**Content:**
| Selector | Description |
|---------|-------------|
| `ng-template plySelectOption` | Option renderer. Context: `$implicit`/`option`, `label`, `selected`, `active`, `index`. Import `CustomSelectOptionDirective`. |

---

### ComboboxComponent
**Selector:** `ply-combobox`
**Standalone:** true

Searchable single-select with keyboard navigation, optional create, local or async filtering, and Angular Forms (`string | null`). The results panel is a CDK overlay attached to the viewport (not `position: absolute` inside the field), aligned to the trigger’s start edge, so it is not clipped by a parent `overflow: hidden`. Use `filterMode="none"` with `(queryChange)` for server search. Override listbox rows with `<ng-template plyComboboxOption let-option>` (import `ComboboxOptionDirective`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| label | `string` | '' | Visible label above the field. |
| placeholder | `string` | 'Search…' | Placeholder when nothing is selected. |
| options | `ComboboxOption[]` | [] | Listbox options (`value`, `label`, optional `description` / `disabled`). |
| filterMode | `'local' \| 'none'` | 'local' | `local` filters by label; `none` shows `options` as-is. |
| loading | `boolean` | false | Spinner in the panel (async search). |
| allowCreate | `boolean` | false | Create the current query when it matches no option. |
| emptyText | `string` | i18n.noResults | Empty-state copy. Defaults to `provideBaseUiI18n().noResults`. |
| disabled | `boolean` | false | Disables the field (also set by forms). |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| queryChange | `string` | Typed query on every change. |
| create | `string` | Emitted when the user creates a value not in `options`. |
| selectionChange | `string \| null` | Selected option value. |

**Content:**
| Selector | Description |
|---------|-------------|
| `ng-template plyComboboxOption` | Option renderer. Context: `$implicit`/`option`, `selected`, `active`, `index`. Import `ComboboxOptionDirective`. |

---

### TagsInputComponent
**Selector:** `ply-tags-input`
**Standalone:** true

Tag field bound to `string[]` via Angular Forms. Enter, comma, or Tab adds a tag; Backspace removes the last. Optional suggestions dropdown.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| label | `string` | '' | Visible label above the field. |
| placeholder | `string` | 'Add a tag…' | Placeholder when there are no tags. |
| suggestions | `string[]` | [] | Optional suggestion list. |
| max | `number` | 0 | Maximum tags; `0` is unlimited. |
| allowCreate | `boolean` | true | Allow tags that are not in `suggestions`. |
| disabled | `boolean` | false | Disables the field (also set by forms). |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| tagsChange | `string[]` | Emits whenever the tag list changes. |

---

### TimePickerComponent
**Selector:** `ply-time-picker`
**Standalone:** true

Overlay time picker bound to an `HH:mm` string via Angular Forms. Pair with `ply-datepicker showTime` for a full datetime. The dropdown is a CDK overlay with a transparent backdrop, aligned to the field’s start edge; it opens below the input and flips above when there is not enough space. `[inline]="true"` keeps the panel in-flow (used by the datepicker datetime overlay).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| label | `string` | '' | Visible label above the field. |
| placeholder | `string` | 'Select time' | Placeholder when no time is selected. |
| hourCycle | `'12' \| '24'` | '24' | 12-hour or 24-hour clock. |
| minuteStep | `number` | 5 | Minute increment. |
| inline | `boolean` | false | Inline panel instead of an overlay. |
| disabled | `boolean` | false | Disables the field (also set by forms). |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| timeChange | `string` | Emits `HH:mm` when the time changes. |

---

### ChatComponent
**Selector:** `ply-chat`
**Standalone:** true

AI chat kit: message list, streaming cursor, tool-call rows, and a prompt composer. Bind `[messages]`, handle `(send)`, and set `[streaming]` while a reply is in flight. Related: `ply-chat-message`, `ply-chat-prompt`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| messages | `ChatMessage[]` | [] | Ordered conversation turns. |
| streaming | `boolean` | false | True while an assistant reply is streaming. |
| placeholder | `string` | 'Send a message…' | Composer placeholder. |
| disabled | `boolean` | false | Disables the composer. |
| emptyTitle | `string` | 'How can I help?' | Empty-state title. |
| emptyDescription | `string` | 'Send a message to start the conversation.' | Empty-state description. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| send | `string` | User prompt. |
| stop | `void` | User stopped generation. |

---

### ChatMessageComponent
**Selector:** `ply-chat-message`
**Standalone:** true

A single chat turn — user, assistant, system, or tool call. Used by `ply-chat`; can also be composed on its own.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| message | `ChatMessage` | required | Message to render (`id`, `role`, `content`, optional `name` / `avatarUrl` / `streaming` / `toolName` / `toolStatus`). |

*No outputs.*

---

### ChatPromptComponent
**Selector:** `ply-chat-prompt`
**Standalone:** true

Composer for `ply-chat`: textarea, send, and stop while streaming. Enter sends; Shift+Enter inserts a newline.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| placeholder | `string` | 'Send a message…' | Composer placeholder. |
| streaming | `boolean` | false | When true, Enter emits Stop instead of Send. |
| disabled | `boolean` | false | Disables the composer. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| send | `string` | Trimmed user prompt. |
| stop | `void` | User stopped generation. |

---

### SelectComponent
**Selector:** `ply-select`
**Standalone:** true

A native HTML `<select>` wrapper component. Integrates natively with Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | '' | Placeholder text shown when no valid option is selected. |
| disabled | `boolean` | false | Disables the select input. |
| value | `unknown` | — | The current selected value. |

*No outputs.*

---

### CheckboxComponent
**Selector:** `ply-checkbox`
**Standalone:** true

A custom styled checkbox component that integrates seamlessly with Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'primary' \| 'danger' \| 'success' \| 'accent' \| 'warning'` | 'primary' | The semantic visual color. |
| disabled | `boolean` | false | Disables the checkbox. |
| checked | `boolean` | false | The checked state of the checkbox. Bound via ngModel. |
| indeterminate | `boolean` | false | Parent-driven mixed visual state (e.g. select-all). |

*No outputs.*

---

### TriStateCheckboxComponent
**Selector:** `ply-tri-state-checkbox`
**Standalone:** true

Free three-state checkbox that cycles **unchecked → checked → indeterminate** on each click. Implements ControlValueAccessor; the form value is `TriCheckboxState` (`true | false | 'indeterminate'`). Use `ply-checkbox` with `[indeterminate]` when a parent derives the mixed state instead.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| color | `'primary' \| 'danger' \| 'success' \| 'accent' \| 'warning'` | 'primary' | Semantic visual color. |
| disabled | `boolean` | false | (two-way) Disables the control; also set by forms via `setDisabledState`. |
| state | `TriCheckboxState` | false | (two-way) Current value; prefer `[(ngModel)]` / `formControlName` in forms. |
| ariaLabel | `string` | — | Accessible name when there is no projected label text. |

**Two-way:** `[(state)]` / `[(ngModel)]` — value is `TriCheckboxState`.

---

### ToggleComponent
**Selector:** `ply-toggle`
**Standalone:** true

A highly customizable toggle/switch component. Integrates natively with Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'primary' \| 'danger' \| 'success' \| 'accent' \| 'warning'` | 'primary' | The semantic color variant applied when the toggle is checked. |
| size | `'sm' \| 'md' \| 'lg'` | 'md' | The physical size of the toggle switch. |
| shape | `'rounded' \| 'square' \| 'smooth'` | 'smooth' | The border-radius style of the toggle track and thumb. |
| disabled | `boolean` | false | Disables the toggle, preventing interaction. |
| checked | `boolean` | false | The current checked/unchecked state. |

*No outputs.*

---

### RadioGroupComponent
**Selector:** `ply-radio-group`
**Standalone:** true

A container component for a group of `ply-radio-button` elements. Manages the selected state and integrates with Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `unknown` | — | The currently selected value within the group. |
| disabled | `boolean` | false | Disables all radio buttons within this group when true. |

*No outputs.*

---

### RadioButtonComponent
**Selector:** `ply-radio-button`
**Standalone:** true

An individual radio option inside a `ply-radio-group`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | — | The native `name` attribute for the radio input. |
| value | `unknown` | — | The value represented by this radio button. |
| color | `'primary' \| 'danger' \| 'success' \| 'accent' \| 'warning'` | 'primary' | Semantic color variant. |
| disabled | `boolean` | false | Disables this specific radio button. |

*No outputs.*

---

### DatepickerComponent
**Selector:** `ply-datepicker`
**Standalone:** true

A standard date picker input field that opens an overlay calendar popup. Supports Angular Forms with `Date` objects.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | 'Select date' | The placeholder text shown when no date is selected. |
| label | `string` | '' | An optional label text displayed above the input. |
| disabled | `boolean` | false | Disables the input and prevents the calendar from opening. |

*No outputs.*

---

### DateRangePickerComponent
**Selector:** `ply-date-range-picker`
**Standalone:** true

An input field that opens a calendar popup specifically for picking start and end date ranges.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | 'Select range' | The placeholder text shown when no date range is selected. |
| label | `string` | '' | An optional label text displayed above the input. |
| disabled | `boolean` | false | Disables the input and prevents the calendar from opening. |

*No outputs.*

---

### InputGroupComponent
**Selector:** `ply-input-group`
**Standalone:** true

A structural container wrapping form controls. Extra `class` values merge via `cn()`. Nested `ply-error` shows after the field is touched for both `formControlName` / `ngModel` and Angular 22 `[formField]`. Sets `aria-invalid` and `aria-describedby` on the projected input. Focus ring is on the wrapper (`focus-within`) so start/end addons stay inside the halo.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| invalid | `boolean` | false | Force the error state. Composite CVA hosts such as `ply-password-input` bind this when the form control lives on the wrapper. |

---

### LabelComponent
**Selector:** `ply-label`
**Standalone:** true

A label element for use inside a `ply-input-group`.

*No inputs or outputs.*

---

### LightboxComponent
**Selector:** `ply-lightbox`
**Standalone:** true

Free lightbox gallery. Project one or more `[ply-lightbox-thumb]` images; thumb size and aspect ratio are controlled with Tailwind on each thumb (`class` on `ply-lightbox` lays out the thumbs wrapper — host itself is `contents`). Clicking a thumb opens a focus-trapped full-viewport overlay (`cdkTrapFocus`) with body scroll lock. Toolbar: flip horizontal/vertical, rotate 90°, zoom in/out (also mouse wheel), download, and browser fullscreen (`maximize`/`minimize`). Prev/next and a counter appear when there is more than one thumb. Keyboard: Esc closes, ←/→ navigate, +/− zoom. Transforms reset on index change and close. When a thumb or overlay image fails to load, initials from `alt` are shown (`"Jane Doe"` → `JD`) unless `initialsFallback` is false. Also exports `lightboxInitialsFromAlt()`. SSR-safe (`PLATFORM_ID` / injected `DOCUMENT`). Public methods: `open(index?)`, `close()`, `next()`, `prev()`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Classes for the thumbs layout wrapper (e.g. `grid grid-cols-3 gap-2`). |
| loop | `boolean` | true | Wrap prev/next at the ends (`booleanAttribute`). |
| showToolbar | `boolean` | true | Show the transform / download toolbar (`booleanAttribute`). |
| showCounter | `boolean` | true | Show `n / total` when there is more than one image (`booleanAttribute`). |
| closeOnBackdrop | `boolean` | true | Close when the backdrop is clicked (`booleanAttribute`). |
| dialogLabel | `string` | 'Image lightbox' | Accessible name for the dialog. |
| initialsFallback | `boolean` | true | Show alt-derived initials in the overlay when the image is missing/broken (`booleanAttribute`). |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| opened | `number` | Emitted when the lightbox opens, with the active index. |
| closed | `void` | Emitted when the lightbox closes. |
| indexChange | `number` | Emitted whenever the active index changes while open. |

---

### LightboxThumbDirective
**Selector:** `[ply-lightbox-thumb]`
**Standalone:** true

Marks a projected image (or other host with a resolvable URL) as a lightbox thumbnail. Click or Enter/Space opens the parent `ply-lightbox` at this thumb's index. Size and aspect ratio are entirely Tailwind on the host element. On `<img>`, use native `src` / `alt` so the thumbnail paints — do not bind directive inputs that shadow those attributes. On load error (or empty `src`), replaces the broken thumb with an initials placeholder from `alt` when `initialsFallback` is true.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| fullSrc | `string` | '' | Full-resolution URL for the overlay; falls back to native `src` / `imageSrc`. |
| imageSrc | `string` | '' | URL for non-`<img>` hosts only. |
| imageAlt | `string` | '' | Alt/label override for non-`<img>` hosts; on `<img>` use native `alt`. |
| downloadName | `string` | '' | Suggested filename for the download action. |
| initialsFallback | `boolean` | true | Show alt-derived initials when the thumb image is missing/broken (`booleanAttribute`). |

---

### ErrorComponent
**Selector:** `ply-error`
**Standalone:** true

An error message element for use inside a `ply-input-group`.

*No inputs or outputs.*

---

### InfoTextComponent
**Selector:** `ply-info-text`
**Standalone:** true

A helper/info text element for use inside a `ply-input-group`.

*No inputs or outputs.*

---

### InputAutocompleteComponent
**Selector:** `ply-input-autocomplete`
**Standalone:** true

A wrapper component that combines an input field with a native HTML datalist for autocomplete suggestions.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| suggestions | `string` | '' | A unique ID string to link the input list attribute with the datalist id. |

---

### InputSpinnerComponent
**Selector:** `ply-input-spinner`
**Standalone:** true

A numeric input component with increment and decrement buttons. Integrates directly with Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| disabled | `boolean` | false | Disables the entire input and its buttons. |
| classes | `string` | '' | Additional CSS classes to apply to the input field wrapper. |
| min | `number` | 0 | The minimum allowed value. |
| max | `number` | Infinity | The maximum allowed value. |
| step | `number` | 1 | The numeric step size for incrementing/decrementing. |

*No outputs.*

---

### ButtonGroupComponent
**Selector:** `ply-button-group`
**Standalone:** true

A container for grouping multiple toggle buttons. Integrates with Angular Forms via ControlValueAccessor.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| ngModel | `unknown` | — | Connects to Angular FormsModule for two-way data binding. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| change | `unknown` | Emits the value of the clicked button when the selection changes. |

---

### GroupButtonComponent
**Selector:** `ply-group-button-item`
**Standalone:** true

An individual button item designed to be used inside a `ply-button-group`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| icon | `string` | — | Optional icon name to display inside the button. |
| disabled | `boolean` | false | Disables the button, preventing interaction. |
| active | `boolean` | false | Whether the button is currently in the toggled/active state. |
| value | `unknown` | — | The specific value this button represents. |

*No outputs.*

---

---

### ChipComponent
**Selector:** `ply-chip`
**Standalone:** true

Pill-shaped chip that projects its label via `ng-content`, with an optional leading `ply-icon` and an optional remove button. The inner span gets `role="button"` and `tabindex="0"` (removed when disabled) and activates on click, Enter, or Space; `active` swaps to a solid filled color variant and is reflected via `aria-pressed`, while `disabled` applies opacity/`pointer-events-none` styling and suppresses both outputs. Host element receives `inline-block` merged with the `class` input via `cn()`; uses `OnPush` change detection.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged onto the host element via `cn()`. |
| color | `ChipColor` | '' | Color variant; empty string renders the neutral slate style. Maps to tinted background/border with a solid variant when `active`. |
| size | `ChipSize` | 'md' | Size variant (`sm`/`md`/`lg`) controlling text size, padding, and icon dimensions. |
| removable | `boolean` | false | Shows a close button that emits `removed` on click (accepts boolean attribute). |
| disabled | `boolean` | false | Disables interaction: removes `role`/`tabindex`, dims the chip, blocks pointer events, and suppresses output emissions (accepts boolean attribute). |
| icon | `string \| undefined` | — | Name of a leading `ply-icon` rendered before the projected content. |
| active | `boolean` | false | Renders the solid "selected" color variant and sets `aria-pressed` (accepts boolean attribute). |
| removeLabel | `string` | 'Remove' | `aria-label` for the remove button. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| removed | `void` | Emitted when the remove button is clicked (click propagation is stopped); not emitted while disabled. |
| clicked | `void` | Emitted when the chip is clicked or activated via Enter/Space; not emitted while disabled. |

---

### ColorPickerComponent
**Selector:** `ply-color-picker`
**Standalone:** true

Color picker rendered as a swatch trigger button that opens a `position: fixed` panel containing a native `<input type="color">`, a hex text field (validated against `#RRGGBB` before committing), and a grid of preset swatches. Implements ControlValueAccessor for `ngModel`/reactive forms (internal value defaults to `#3b82f6`); the panel repositions itself on window scroll/resize, flips above the trigger when there is no room below, and closes on outside click or Escape. When `disabled` is set (or via `setDisabledState`), the trigger is dimmed and the panel will not open.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `inline-block` class via `cn()` (input alias for `extraClass`). |
| pickerLabel | `string` | 'Color picker' | Accessible label prefix for the trigger button's `aria-label` (combined with the current value). |
| swatches | `string[]` | 12 preset hex colors | Hex color strings rendered as the preset swatch grid; the active swatch is highlighted and marked `aria-pressed`. |
| disabled | `boolean` | false | (two-way) Disables the trigger and prevents the panel from opening; also driven by the forms API via `setDisabledState`. |

---

### FloatingInputComponent
**Selector:** `ply-floating-input`
**Standalone:** true

Text input with a material-style floating label: the label sits inside the field and shrinks/floats up (via Tailwind `peer` classes) when the input is focused or has a value. Implements `ControlValueAccessor`, so it works with `[(ngModel)]` and reactive forms, including disabled state (`setDisabledState` renders the native input disabled with reduced opacity). Host element gets `block w-full` merged with the `class` input via `cn()`; internal state (`value`, `isDisabled`) is signal-based with OnPush change detection.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `block w-full` classes via `cn()`. |
| label | `string` | 'Label' | Floating label text displayed inside the field. |
| type | `string` | 'text' | Native input `type` attribute (e.g. `text`, `email`, `password`). |

---

### MentionInputComponent
**Selector:** `ply-mention-input`
**Standalone:** true

Pro tier. Wrapper that adds @-mention autocomplete to a projected native `<input>` or `<textarea>` (via `<ng-content>`). Typing `@` followed by word characters opens a fixed-position suggestion panel anchored at the text caret (measured with a hidden mirror element), filtering `users` by `username` or `name`; the panel repositions on scroll/resize, flips above the caret when space below is insufficient, and hides when no users match. Full keyboard support (ArrowUp/ArrowDown, Home, End, Enter to select, Escape to close) plus click-outside dismissal; ARIA combobox/listbox attributes (`role`, `aria-expanded`, `aria-activedescendant`, etc.) are applied to the projected input while open. Selecting a user inserts `@username ` at the caret and dispatches a bubbling `input` event so Angular forms bindings on the projected control stay in sync. Implements ControlValueAccessor — bind `[(ngModel)]` on the wrapper (do not also bind the projected field to the same model). Exports the `MentionUser` interface (`id`, `username`, optional `avatar`/`name`); options render an avatar image or an initial-letter fallback bubble.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| users | `MentionUser[]` | [] | Candidate users for mention suggestions; filtered case-insensitively against the text typed after `@` (matches `username` or `name`). |

---

### MultiSelectComponent
**Selector:** `ply-multi-select`
**Standalone:** true

Searchable multi-select dropdown that renders selected values as removable chips inside a combobox trigger. Opening the trigger reveals a text search box that filters options by label (already-selected options are hidden from the list); the option panel is position-fixed, repositions itself on window scroll/resize, and flips to a drop-up when there is not enough space below. Implements ControlValueAccessor (`NG_VALUE_ACCESSOR`) for Angular Forms integration, supports full keyboard navigation (ArrowUp/ArrowDown, Enter/Space to toggle, Home/End, Escape to close), closes on outside document click, and shows a "No options found" message when the filtered list is empty. Option values are typed via the exported `MultiSelectOption` interface (`{ label, value, disabled? }`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host classes via `cn()` (aliased to internal `extraClass`). |
| options | `MultiSelectOption[]` | [] | Options to display; entries with `disabled: true` cannot be toggled. Empty array yields the "No options found" state when open. |
| placeholder | `string` | 'Select options…' | Placeholder text shown when nothing is selected; also used as the trigger's aria-label and the search input placeholder. |
| max | `number` | 0 | Maximum number of selections; further selections are ignored once reached. 0 means unlimited. |
| disabled | `boolean` | false | (two-way) Disables the control (also set by forms via `setDisabledState`); prevents opening and dims the trigger. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| selectionChange | `unknown[]` | Emitted with the full array of selected values whenever an option is added or a chip is removed. |

---

### PickListComponent
**Selector:** `ply-pick-list`
**Standalone:** true

Pro dual-listbox that moves items between available (source) and selected (target) panes. Click highlights items (⌘/Ctrl-click for multi-select), transfer buttons move highlighted or all items, and double-click moves a single item. Optional per-pane filters. Implements ControlValueAccessor — the form value is `unknown[]` of selected option values. Option model: exported `PickListItem` (`{ label, value, disabled? }`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| options | `PickListItem[]` | [] | Full option catalog; selected values are hidden from the source pane. |
| sourceHeader | `string` | 'Available' | Title above the source list. |
| targetHeader | `string` | 'Selected' | Title above the target list. |
| filter | `boolean` | false | Shows filter inputs above each list. |
| disabled | `boolean` | false | (two-way) Disables the control; also set by forms via `setDisabledState`. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| selectionChange | `unknown[]` | Emitted whenever the selected values array changes. |

---

### KnobComponent
**Selector:** `ply-knob`
**Standalone:** true

Pro rotary dial for selecting a numeric value along a 270° arc. Pointer drag and keyboard (arrows, PageUp/PageDown, Home/End). Implements ControlValueAccessor for Angular Forms. Exported size type: `KnobSize` (`'sm' | 'default' | 'lg'`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| min | `number` | 0 | Minimum value. |
| max | `number` | 100 | Maximum value. |
| step | `number` | 1 | Step increment for drag and keyboard. |
| color | `SliderColor` | 'primary' | Accent color for track and indicator. |
| size | `KnobSize` | 'default' | Dial diameter (`sm` 96px / `default` 128px / `lg` 160px). |
| showValue | `boolean` | false | Shows the current value in the dial center. |
| disabled | `boolean` | false | (two-way) Disables interaction; also set by forms via `setDisabledState`. |
| ariaLabel | `string` | 'Knob' | Accessible name (`role="slider"`). |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| valueChange | `number` | Emitted whenever the value changes. |

---

### OtpInputComponent
**Selector:** `ply-otp-input`
**Standalone:** true

PIN / OTP input rendering `length` individually-focusable single-character boxes. Implements ControlValueAccessor (registers `NG_VALUE_ACCESSOR`) so it works with Angular Forms; typing auto-advances focus, Backspace clears and moves back, ArrowLeft/ArrowRight navigate, and paste distributes characters across boxes. Boxes use `autocomplete="one-time-code"` and switch to `type="password"` when masked; `setDisabledState` writes to the `disabled` model.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `flex gap-2` classes via `cn()`. |
| length | `number` | 6 | Number of digit boxes to render. |
| mask | `boolean` | false | Renders boxes as `type="password"` to hide entered characters (accepts boolean attribute). |
| numbersOnly | `boolean` | true | Strips non-digit characters on input/paste and uses `type="tel"` with numeric inputmode (accepts boolean attribute). |
| disabled | `boolean` | false | (two-way) Disables all boxes; also set by Angular Forms via `setDisabledState`. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| completed | `string` | Emitted with the full code string once every box is filled. |

---

### PasswordStrengthComponent
**Selector:** `ply-password-strength`
**Standalone:** true

Four-segment password strength meter bar with a text label below it. Computes a 0–4 score from the `password` input (one point each for length ≥ 8, mixed upper/lowercase, a digit, and a special character) and colors the active segments red/orange/yellow/green accordingly, with a matching "Weak" / "Fair" / "Good" / "Strong" label. When `password` is empty, all segments render inactive (slate) and the label is hidden. Uses OnPush change detection; purely presentational — no outputs and no form integration.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| password | `string` | '' | The password value to evaluate; the strength score and label are recomputed whenever it changes. |

---

### PasswordInputComponent
**Selector:** `ply-password-input`
**Standalone:** true

Password field with a show/hide toggle. ControlValueAccessor — bind `formControlName`, `ngModel`, or `[formField]` on `ply-password-input` itself. Do not wrap in another `ply-input-group`. Project `ply-error` as content. Optional `[showStrength]` renders `ply-password-strength` below the field. Toggle labels come from `provideBaseUiI18n()` (`showPassword` / `hidePassword`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| label | `string` | '' | Optional label rendered inside the inner input-group. |
| placeholder | `string` | '••••••••' | Native placeholder. |
| autocomplete | `string` | 'current-password' | Native autocomplete. |
| name | `string` | '' | Native name attribute. |
| showStrength | `boolean` | false | Show the password-strength meter (`booleanAttribute`). |
| disabled | `boolean` | false | Disables the field; also set by Angular Forms via `setDisabledState`. |

---

### PhoneInputComponent
**Selector:** `ply-phone-input`
**Standalone:** true

Phone number field with a country dial-code selector. Renders a trigger button (flag emoji + dial code + chevron) beside a `type="tel"` input; clicking the trigger opens a fixed-position dropdown listing 14 hardcoded countries (`COMMON_COUNTRIES: Country[]`, also exported from this file) that flips above the trigger when viewport space below is insufficient, repositions on scroll/resize, and closes on outside click. Implements ControlValueAccessor: keystrokes are sanitized to digits/spaces/hyphens, and the emitted value is the dial code plus the stripped digits (e.g. `+15551234`), or `''` when the local part is empty; `writeValue` parses an incoming value's dial-code prefix (longest match first) to restore the country selection, and `setDisabledState` dims and disables the whole control. Has no inputs or outputs — the country list is not configurable.

---

### CurrencyInputComponent
**Selector:** `ply-currency-input`
**Standalone:** true

Locale-aware currency field. Stores a `number | null` via Angular forms (`ControlValueAccessor`). Shows a formatted value when idle and a raw editable amount while focused. Do not nest inside `ply-input-group` — it is a composite control (the group only projects `[ply-input]`, `[ply-textarea]`, and `ply-mention-input`). Prefixes the ISO currency symbol from `Intl.NumberFormat` `formatToParts`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| currency | `string` | 'USD' | ISO 4217 currency code used for formatting and the prefix symbol. |
| locale | `string` | 'en-US' | BCP 47 locale passed to `Intl.NumberFormat`. |
| placeholder | `string` | '0.00' | Placeholder when the value is empty and the field is not focused. |
| ariaLabel | `string` | 'Amount' | Accessible name for the inner text field. |
| min | `number \| null` | null | Minimum allowed value (applied on blur). |
| max | `number \| null` | null | Maximum allowed value (applied on blur). |
| showSymbol | `boolean` | true | Hide the currency symbol prefix when false (the formatted value still uses the currency). |

---

### RangeSliderComponent
**Selector:** `ply-range-slider`
**Standalone:** true

Single-value range slider built on a native `<input type="range">`, styled with Tailwind accent-color classes per `color`. Implements ControlValueAccessor (registered via NG_VALUE_ACCESSOR), so it works with `ngModel` and reactive forms; non-numeric written values coerce to 0. Optionally renders the min/max bounds beside the track and the current value (shown with one decimal place when non-integer). Sets `aria-label`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` on the input.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| min | `number` | 0 | Minimum value of the slider. |
| max | `number` | 100 | Maximum value of the slider. |
| step | `number` | 1 | Step increment between selectable values. |
| color | `SliderColor` | 'primary' | Accent color of the slider track/thumb (primary/success/danger/warning/accent). |
| disabled | `boolean` | false | (two-way) Disables the slider; also set by forms via `setDisabledState`. |
| showValue | `boolean` | false | Shows the current value label after the track (accepts boolean attribute). |
| showMinMax | `boolean` | false | Shows the min and max labels on either side of the track (accepts boolean attribute). |
| ariaLabel | `string` | 'Slider' | Accessible label applied to the native range input. |

### DualRangeSliderComponent
**Selector:** `ply-dual-range-slider`
**Standalone:** true

Dual-thumb range slider for selecting a numeric span (`{ start, end }`) within `min`–`max`. Thumbs cannot cross. On hover/focus, tip bubbles appear above each thumb (disable with `[showTip]="false"`). Implements ControlValueAccessor for Angular Forms.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| min | `number` | 0 | Track minimum. |
| max | `number` | 100 | Track maximum. |
| step | `number` | 1 | Step increment. |
| color | `SliderColor` | 'primary' | Accent for fill and thumbs. |
| disabled | `boolean` | false | (two-way) Disables both thumbs. |
| showValue | `boolean` | false | Shows `start – end` after the track. |
| showMinMax | `boolean` | false | Shows track min/max labels. |
| showTip | `boolean` | true | Hover/focus tips above each thumb. |
| ariaLabel | `string` | 'Range' | Accessible name for the control group. |
| class | `string` | `''` | Extra host classes. |

**Form value:** `DualRangeValue` = `{ start: number; end: number }`

### SplitterComponent
**Selector:** `ply-splitter`
**Standalone:** true

Two-pane resizable layout. Project panes with attributes `ply-splitter-start` and `ply-splitter-end`. Drag the gutter, use arrow keys (Home/End for min/max), or double-click to reset to 50%. Supports nesting. Pro tier. Install: `npx ply-ui-cli add splitter`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | `number` (model) | 50 | Primary (start) pane size as a percentage. |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Side-by-side or stacked panes. |
| min | `number` | 10 | Minimum primary size (%). |
| max | `number` | 90 | Maximum primary size (%). |
| step | `number` | 2 | Keyboard arrow step (%). |
| disabled | `boolean` | false | Locks resizing. |
| ariaLabel | `string` | `'Resize panels'` | Accessible name for the separator. |
| class | `string` | `''` | Extra host classes (set height for vertical). |

**Projection:** `[ply-splitter-start]`, `[ply-splitter-end]`

## Overlay

### DialogComponent
**Selector:** `ply-dialog`
**Standalone:** true

The main wrapper component for dialog/modal content. Should be used inside a component that is passed to `DialogService.open()`. Pair with loading/disabled footer actions (`ply-progress-button`) when a submit cannot be retried.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | — | Explicit width in pixels. |
| height | `number` | — | Explicit height in pixels. |

---

### DialogContainerComponent
**Selector:** `ply-dialog-container`
**Standalone:** true

Internal container component that renders the dialog overlay and handles click-outside behavior. Created dynamically by `DialogService`. Traps keyboard focus with Angular CDK `FocusTrapFactory` while open. Unlabelled dialogs get `aria-label` from `provideBaseUiI18n().dialog`.

*No inputs or outputs.*

---

### DialogHeaderComponent
**Selector:** `ply-dialog-header`
**Standalone:** true

A header section for a dialog, rendered as part of `ply-dialog`.

*No inputs or outputs.*

---

### DialogBodyComponent
**Selector:** `ply-dialog-body`
**Standalone:** true

A body section for a dialog, rendered as part of `ply-dialog`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| height | `number` | — | Explicit height in pixels. Usually set automatically by parent `ply-dialog`. |

---

### DialogFooterComponent
**Selector:** `ply-dialog-footer`
**Standalone:** true

A footer section for a dialog, rendered as part of `ply-dialog`.

*No inputs or outputs.*

---

### DrawerComponent
**Selector:** `ply-drawer`
**Standalone:** true

A side-drawer/offcanvas component that slides in from the edge of the screen.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg' \| 'xl' \| string` | 'md' | The size of the drawer. |
| position | `'left' \| 'right' \| 'top' \| 'bottom'` | 'right' | The edge of the screen to slide in from. |
| close | `boolean` | false | Triggers the closing animation when set to true. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| closed | `void` | Event emitted when the drawer has fully closed. |

---

### DropdownMenuComponent
**Selector:** `ply-dropdown-menu`
**Standalone:** true

The container component for a dropdown menu. Designed to be passed into a `[ply-dropdown-menu-trigger]` directive.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | `string` | — | Optional custom width size for the dropdown container. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| closed | `void` | Event emitted when the menu has fully closed. |

---

### ScrollTopComponent
**Selector:** `ply-scroll-top`
**Standalone:** true

Floating scroll-to-top button. Shows after `scrollTop` exceeds `threshold`. Targets `window`, `nearest` scrollable ancestor, or a CSS selector. Install: `npx ply-ui-cli add scroll-buttons`.

**Inputs:** `target`, `threshold`, `color`, `size`, `position`, `fixed`, `behavior`, `ariaLabel`, `class`

---

### ScrollBottomComponent
**Selector:** `ply-scroll-bottom`
**Standalone:** true

Floating scroll-to-bottom button. Shows when more than `threshold` pixels remain below the viewport. Same targeting API as `ply-scroll-top`. Install: `npx ply-ui-cli add scroll-buttons`.

**Inputs:** `target`, `threshold`, `color`, `size`, `position`, `fixed`, `behavior`, `ariaLabel`, `class`

---

### SpeedDialComponent
**Selector:** `ply-speed-dial`
**Standalone:** true

Free floating action button that expands a stack of secondary actions. Supports `up` / `down` / `left` / `right` expansion, corner `position`, fixed or absolute placement, optional labels, and closes on outside click, Escape, or action press (configurable).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| actions | `SpeedDialAction[]` | [] | Secondary actions (`icon`, optional `label` / `color` / `disabled` / `id` / `ariaLabel`). |
| direction | `'up' \| 'down' \| 'left' \| 'right'` | 'up' | Expansion direction from the trigger. |
| position | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | 'bottom-right' | Corner placement. |
| fixed | `boolean` | true | `true` = viewport fixed; `false` = absolute inside a relative parent. |
| color | `IconButtonColor \| string` | 'primary' | Trigger button color. |
| size | `IconButtonSize` | 'lg' | Trigger and action button size. |
| openIcon | `string` | 'plus' | Trigger icon when closed. |
| closeIcon | `string` | 'x' | Trigger icon when open. |
| showLabels | `boolean` | false | Shows each action’s `label` beside the button. |
| closeOnAction | `boolean` | true | Closes the dial after an action click. |
| ariaLabel | `string` | 'Speed dial' | Accessible name for the group / trigger. |
| class | `string` | '' | Extra host classes merged via `cn()`. |
| open | `boolean` | false | (two-way) Open state. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| actionClick | `SpeedDialAction` | Emitted when an enabled action is clicked. |

---

### ContextMenuComponent
**Selector:** `ply-context-menu`
**Standalone:** true

Right-click context menu panel. Pass into `[ply-context-menu-trigger]`. Opens at the pointer (or host center for Shift+F10 / ContextMenu key). Install: `npx ply-ui-cli add context-menu`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | `string` | — | Optional custom width for the menu panel. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| closed | `void` | Emitted when the menu should close. |

---

### ContextMenuDirective
**Selector:** `[ply-context-menu-trigger]`
**Standalone:** true

Opens a `ply-context-menu` on `contextmenu`, Shift+F10, or the ContextMenu key. Positions via CDK Overlay at the pointer.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| ply-context-menu-trigger | `ContextMenuPanel` | — | Menu panel reference. |
| disabled | `boolean` | `false` | Disables the custom menu. |

---

### BaseContextMenuItemDirective
**Selector:** `[ply-context-menu-item]`
**Standalone:** true

Styles a button or link as a context menu item (`role="menuitem"`).

---

### DropdownMenuItemComponent
**Selector:** `ply-dropdown-menu-item`
**Standalone:** true

An individual item within a `ply-dropdown-menu`. Clicking a normal item closes the menu. Bind `checked` (or set `stayOpen`) for selectable items that toggle without dismissing the dropdown.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | `''` | Extra host classes merged via `cn()`. |
| stayOpen | `boolean` | `false` | Keep the dropdown open after this item is clicked. Implied when `checked` is bound. |
| checked | `boolean \| undefined` | `undefined` | When set, renders as `menuitemcheckbox` and two-way toggles without closing the menu. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| checkedChange | `boolean \| undefined` | Emitted when a checkbox item is toggled. |

---

### AlertComponent
**Selector:** `ply-alert`
**Standalone:** true

A highly configurable alert component for displaying important messages. Includes support for auto-dismissal, manual closing, and multiple visual variants.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'' \| 'primary' \| 'success' \| 'danger' \| 'accent' \| 'warning'` | '' | The semantic color variant. |
| variant | `'soft' \| 'solid' \| 'outline'` | 'soft' | The stylistic appearance (soft, solid, outline). |
| icon | `string` | — | An optional icon name to display at the start of the alert. |
| close | `boolean` | false | Whether the alert should display a close button. |
| duration | `number` | 0 | Auto-dismiss duration in milliseconds. 0 disables auto-dismiss. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| closed | `void` | Emitted when the alert is closed (either manually or via timeout). |

---

### AlertActionsComponent
**Selector:** `ply-alert-actions`
**Standalone:** true

Container for action buttons within an alert component.

*No inputs or outputs.*

---

### TooltipDirective
**Selector:** `[ply-tooltip]`
**Standalone:** true

An attribute directive that attaches a floating tooltip to any element. Hover or focus shows the tooltip; mouse leave, blur, Escape, or **scroll** (window or nested overflow containers) hides it.

**Important:** use `tooltipPlacement` for position — never bare `placement`. Dropdown, popover, and drawer also bind `placement` on the same host; a value like `end` breaks tooltip positioning.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| tooltipTitle (via `[ply-tooltip]`) | `string` | '' | The text content to display inside the tooltip. |
| tooltipPlacement | `TooltipPlacement \| string` (`'top' \| 'bottom' \| 'left' \| 'right'`) | 'top' | Tooltip position relative to the host. Namespaced so it does not collide with dropdown/popover/drawer `placement`. |
| tooltipClass | `string` | '' | Additional custom CSS classes to apply to the tooltip element. |
| delay | `string` | '0' | Milliseconds to delay before showing the tooltip. |
| type | `'dark' \| 'light' \| string` | 'dark' | The visual theme variant. |
| canShow | `boolean` | true | Whether the tooltip is permitted to show at all. |

**Example:**
```html
<button
  ply-tooltip="Account"
  tooltipPlacement="bottom"
  [ply-dropdown-menu-trigger]="menu"
  placement="end"
>
  …
</button>
```

---

### RippleDirective
**Selector:** `[ply-ripple]`
**Standalone:** true

Material-style ink ripple on pointer press (primary button) or Enter/Space. Ensures the host is positioned and clips overflow so the ink stays inside rounded corners. Skips when `disabled` / `aria-disabled`, `rippleDisabled`, SSR, or `prefers-reduced-motion`. Free tier. CLI: `npx ply-ui-cli add ripple`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| rippleColor | `string` | `'rgba(255, 255, 255, 0.55)'` | Ink color (use a dark rgba on light surfaces). |
| rippleCentered | `boolean` | false | Always expand from the host center. |
| rippleDisabled | `boolean` | false | Disables ripple creation while the directive stays attached. |
| rippleDuration | `number` | 550 | Animation duration in milliseconds. |

---

---

### BottomSheetComponent
**Selector:** `ply-bottom-sheet`
**Standalone:** true

Mobile-style modal panel that slides up from the bottom of the screen with a fading, blurred backdrop. Supports swipe-down-to-dismiss via a drag handle (closes after 120px of drag or a fast flick), Escape-key and backdrop-click dismissal (all gated by `dismissible`), an optional close button, and focus trapping via `cdkTrapFocus cdkTrapFocusAutoCapture` with `role="dialog"`/`aria-modal`. Locks body scroll while open and restores it on destroy. Host class is `contents` and can be extended via the `class` input.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host class via `cn()` (alias for `extraClass`). |
| open | `boolean` | false | (two-way) Open state of the sheet; bind with `[(open)]`. |
| height | `BottomSheetHeight` | 'auto' | Sheet height: 'auto' (max 85vh), 'half' (50vh), 'full' (94vh), or any custom CSS height string applied as an inline style. |
| showHandle | `boolean` | true | Shows the drag handle bar at the top (the swipe-down-to-dismiss target). Accepts boolean attribute. |
| showClose | `boolean` | false | Shows a close (X) icon button in the top-right corner. Accepts boolean attribute. |
| sheetLabel | `string` | 'Bottom sheet' | Accessible name applied as `aria-label` on the dialog. |
| dismissible | `boolean` | true | Whether backdrop click, swipe-down gesture, or Escape key can dismiss the sheet. Accepts boolean attribute. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| closed | `void` | Emitted when the sheet closes, regardless of how the close was triggered. |

---

### CommandPaletteComponent
**Selector:** `ply-command-palette`
**Standalone:** true

Cmd+K style command palette: when `open` is true it renders a full-screen backdrop plus a centered dialog panel with a search input, grouped command list, and keyboard-hints footer. Filters items by substring match against label, description, and group; supports two-way binding via `[(open)]` (input + `openChange` output pair), traps focus with `cdkTrapFocus`, and restores focus to the previously focused element on close. Keyboard support via a `document:keydown` listener: ArrowUp/ArrowDown/Home/End move the active option, Enter selects it (emits `selected` then closes), Escape closes; when no items match the query a "No results" status message is shown. The `CommandItem` interface (`id`, `label`, optional `group`/`icon`/`shortcut`/`description`) is exported from the same file.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | false | Whether the palette overlay is shown; uses `booleanAttribute` transform. Pair with `openChange` for `[(open)]` two-way binding. |
| items | `CommandItem[]` | [] | Commands to list, optionally grouped via each item's `group` field. Empty array renders the "No results" message. |
| placeholder | `string` | 'Type a command or search…' | Placeholder text for the search input. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| openChange | `boolean` | Emits `false` when the palette closes (Escape, backdrop click, item selection, or component destroy). |
| selected | `CommandItem` | Emitted when a command is chosen via click or Enter; the palette closes afterwards. |

---

### PopoverComponent
**Selector:** `ply-popover`
**Standalone:** true

Self-contained popover with a trigger slot and a panel slot: project the trigger element into `[popover-trigger]` and the panel content as default children. The panel is a CDK overlay on the viewport (not `position: fixed` inside the host), so it stays next to the trigger even inside `overflow: hidden` cards. Placement (`bottom-start` default) flips when there is not enough room. Opens/closes on trigger click, Enter, or Space; closes on backdrop click and Escape; on open it moves focus to the first focusable element inside the panel and restores focus on close. The trigger wrapper carries `role="button"` and `aria-haspopup`/`aria-expanded`/`aria-controls`; the panel has `role="dialog"`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra Tailwind classes merged into the host element via `cn()`. |
| minWidth | `string` | '200px' | CSS min-width applied to the panel. |
| placement | `PopoverPlacement` | 'bottom-start' | Preferred panel position relative to the trigger; may be overridden at runtime by an external trigger directive. |

### PopoverTriggerDirective
**Selector:** `[ply-popover-trigger]`
**Standalone:** true

Alternative external trigger for `ply-popover`, for when the trigger button must live outside the `<ply-popover>` element. On host click it calls `toggleWithPlacement()` on the referenced `PopoverComponent`, passing its own `placement` as an override. Closes the referenced popover when the directive is destroyed.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| ply-popover-trigger | `PopoverComponent` | required | Reference to the popover instance to toggle (bind a template reference variable). |
| placement | `PopoverPlacement` | 'bottom-start' | Placement override applied to the popover when opened via this trigger. |

---

### HoverCardComponent
**Selector:** `ply-hover-card`
**Standalone:** true

Rich preview panel that opens when the pointer (or keyboard focus) rests on the trigger. Unlike `ply-popover`, there is no backdrop — the pointer can move into the panel. Closes after `closeDelay` on leave, on outside pointer down, and on Escape. Project the trigger into `[hover-card-trigger]` and panel content as default children. The panel is a CDK overlay on the viewport so it is not clipped by `overflow: hidden` parents.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra Tailwind classes merged into the host element via `cn()`. |
| minWidth | `string` | '240px' | CSS min-width applied to the panel. |
| placement | `PopoverPlacement` | 'bottom-start' | Preferred panel position relative to the trigger; flips when there is not enough room. |
| openDelay | `number` | 200 | Milliseconds to wait after pointer enter / focus before opening. |
| closeDelay | `number` | 150 | Milliseconds to wait after pointer leave before closing. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| openChange | `boolean` | Emits whenever the panel opens or closes. |

---

### LoadingOverlayComponent
**Selector:** `ply-loading-overlay`
**Standalone:** true

Blocks a region (or the viewport) with `ply-spinner` while work is in progress. Sets `aria-busy` on the host and a polite live region on the overlay. Prefer this over `ply-spinner-wrapper` when you need a message, scroll locking, or fullscreen. Contained mode wraps projected content in a `relative` host; `fullscreen` covers the viewport with `position: fixed`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. Include a min-height for contained overlays. |
| visible | `boolean` | false | Shows the blocking overlay (boolean attribute). |
| fullscreen | `boolean` | false | Cover the viewport instead of wrapping projected content. |
| lockScroll | `boolean` | false | Set `overflow: hidden` on `document.body` while visible. Also applied when `fullscreen` is true. |
| message | `string` | '' | Optional status text announced via the live region. |
| size | `SpinnerSize` | 'lg' | Spinner diameter. |
| color | `SpinnerColor` | 'primary' | Spinner color. Use `inverted` on a dark backdrop. |

---

### CookieBannerComponent
**Selector:** `ply-cookie-banner`
**Standalone:** true

Consent banner. Fixed to the viewport by default; pass `inline` to render in document flow (docs/demo surfaces). Hidden until the client confirms `localStorage` has no stored choice (`afterNextRender`, SSR-safe). Accept / Reject persist `'accepted'` or `'rejected'` under `storageKey` and emit. Call `reset()` to clear storage and show the banner again.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| storageKey | `string` | 'ply-cookie-consent' | `localStorage` key used to remember the choice. |
| title | `string` | 'We use cookies' | Heading shown beside the cookie icon. |
| message | `string` | (default copy) | Supporting copy under the title. |
| acceptLabel | `string` | 'Accept' | Label for the accept button. |
| rejectLabel | `string` | 'Reject' | Label for the reject button. |
| policyHref | `string` | '' | Optional privacy policy URL. Hidden when empty. |
| policyLabel | `string` | 'Privacy policy' | Label for the privacy policy link. |
| inline | `boolean` | false | Render in document flow instead of pinning to the viewport. |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| accepted | `void` | Emitted after the user accepts (and the choice is stored). |
| rejected | `void` | Emitted after the user rejects (and the choice is stored). |
| consentChange | `CookieConsent` | Emitted with `'accepted'` or `'rejected'` after accept, reject, or a successful choice. |

---

### ToastComponent
**Selector:** `ply-toast-container`
**Standalone:** true

Toast renderer used programmatically by `ToastService` — you normally never place this selector yourself. The service creates one container attached to `document.body` (with `aria-live="polite"`), and the component groups active toasts by position (`top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`). Newest toasts sit in front; older ones peek behind (up to three visible). Hover or keyboard focus expands the stack; swipe toward the nearest edge dismisses; hovering pauses auto-dismiss. `prefers-reduced-motion` renders a static list with no scale or swipe tween. State is held in a `toasts` signal with `addToast`/`dismissById`/`dismissAll` methods called by the service. No inputs or outputs. Walkthrough with a 15-second capture: https://ply-ui.com/learn/stacked-toasts-angular/.

Use via `ToastService` (documented under Services): `show(message, { color, duration, icon, position, action })` plus `success`/`error`/`warning`/`info` shorthands, `promise(promiseOrFn, { loading, success, error })`, `dismiss(id)`, and `clearAll()`. Duration defaults to 4000ms; `duration: 0` keeps a toast until dismissed. `action` is `{ label, onClick, dismiss? }` and renders an inline button (Undo-style).

## Navigation

### ResponsiveNavComponent
**Selector:** `ply-responsive-nav`
**Standalone:** true

Progressive (priority+) horizontal navigation. Project `ply-responsive-nav-item` children; as many as fit stay visible and the rest spill into a "More" dropdown from the right. Leftmost items have the highest priority.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| linkClass | `string` | (styled default) | Tailwind classes applied to each item link. |
| moreLabel | `string` | `'More navigation links'` | Accessible label for the overflow trigger. |
| class | `string` | `''` | Extra host classes merged via `cn()`. |

**Example:**
```html
<ply-responsive-nav>
  <ply-responsive-nav-item routerLink="/docs">
    <ply-icon name="book" class="h-4 w-4 stroke-slate-500"></ply-icon>
    Docs
  </ply-responsive-nav-item>
  <ply-responsive-nav-item routerLink="/blog">Blog</ply-responsive-nav-item>
  <ply-responsive-nav-item href="https://github.com" target="_blank">GitHub</ply-responsive-nav-item>
</ply-responsive-nav>
```

---

### ResponsiveNavItemComponent
**Selector:** `ply-responsive-nav-item`
**Standalone:** true

Projected nav link for `ply-responsive-nav`. Put the label and optional icon in the content.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| routerLink | `string \| any[]` | — | In-app route (`RouterLink`). Wins over `href`. |
| href | `string` | — | External or hash URL when not using `routerLink`. |
| target | `string` | — | Optional `target` for `href` (e.g. `_blank`). |
| menuLabel | `string` | — | Overflow menu text; defaults to projected text. |
| class | `string` | `''` | Extra classes merged onto the inner link. |

---

### MenubarComponent
**Selector:** `ply-menubar`
**Standalone:** true

Horizontal application menubar. Project `ply-menubar-menu` children; each menu opens a `ply-dropdown-menu` of actions. Click a top-level trigger to open the first menu; after that, hover switches menus and opens nested submenus. Click a leaf / link or outside to close. Bind `checked` (or `stayOpen`) on items that should toggle without dismissing the menu. Arrow Left/Right move between menus (and switch the open menu); Arrow Down / Enter / Space open; Escape closes.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |

---

### MenubarMenuComponent
**Selector:** `ply-menubar-menu`
**Standalone:** true

One top-level menu inside `ply-menubar`. Project `ply-dropdown-menu-item` children, plus nested `ply-dropdown-menu` panels on items that use `[ply-dropdown-menu-trigger]` with `placement="right"` (or `left`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | '' | Visible label on the menubar trigger. |
| class | `string` | '' | Extra host classes merged via `cn()`. |
| disabled | `boolean` | false | Disables the trigger so the menu cannot open. |

---

### BreadcrumbComponent
**Selector:** `ply-breadcrumb`
**Standalone:** true

A container component for breadcrumb navigation. Usually contains multiple `ply-breadcrumb-item` components.

*No inputs or outputs.*

---

### BreadcrumbItemComponent
**Selector:** `ply-breadcrumb-item`
**Standalone:** true

An individual breadcrumb link within a `ply-breadcrumb`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| icon | `string` | — | Optional icon name to display before the label. |
| link | `string` | — | Optional URL link for this breadcrumb segment. |
| label | `string` | '' | The text label of the breadcrumb segment. |
| separator | `string` | — | Optional custom separator string. |

---

### NavListComponent
**Selector:** `ply-nav-list`
**Standalone:** true

A navigation list container. Usually used inside sidebars or drawer menus. Expects `ply-list-item` or similar navigation links as children.

*No inputs or outputs.*

---

### ScrollNavComponent
**Selector:** `ply-scroll-nav`
**Standalone:** true

A highly interactive layout component that synchronizes a sidebar navigation list with scrollable content. As the user scrolls the content area, the active navigation link updates automatically. Free shell (`npx ply-ui-cli add scroll-nav`).

*No inputs or outputs.*

---

### ScrollNavSidebarComponent
**Selector:** `ply-scroll-nav-sidebar`
**Standalone:** true

A sidebar navigation panel for `ply-scroll-nav`.

*No inputs or outputs.*

---

### ScrollNavContentComponent
**Selector:** `ply-scroll-nav-content`
**Standalone:** true

The scrollable content area for `ply-scroll-nav`.

*No inputs or outputs.*

---

### ShellComponent
**Selector:** `ply-shell`
**Standalone:** true

Unified Pro application shell. `mode="page"` is a marketing/content frame (hamburger push drawer under 991px, optional footer). `mode="dashboard"` is an admin rail (expanded / mini / mobile at 1080px / 1360px). Project `ply-shell-sidebar`, `ply-shell-header`, `ply-shell-content`, and optional `ply-shell-footer`. Install: `npx ply-ui-cli add shell`. Free-tier alternatives: `sidenav`, `scroll-nav`, `page-main`.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `mode` | `'page' \| 'dashboard'` | `'page'` | Product mode. |
| `layout` | `'auto' \| 'mobile' \| 'desktop'` | `'auto'` | Force chrome for demos, or follow breakpoints. |
| `width` | `number` | `280` | Dashboard expanded rail width (px). |
| `miniWidth` | `number` | `76` | Dashboard mini rail width (px). |
| `collapsed` | `boolean` | `false` | Dashboard icons-only rail (two-way bindable). |

| Output | Type | Description |
|---|---|---|
| `collapsedChange` | `boolean` | Emits when dashboard collapsed state changes. |

---

### ShellSidebarComponent
**Selector:** `ply-shell-sidebar`
**Standalone:** true

Sidebar for `ply-shell`. Page mode: off-canvas push panel (`side` left/right). Dashboard mode: expanded / mini / mobile rail.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `side` | `'left' \| 'right'` | `'left'` | Edge for page-mode panels. |
| `width` | `number` | `280` | Panel / expanded rail width (px). |

---

### ShellHeaderComponent
**Selector:** `ply-shell-header`
**Standalone:** true

Top bar for `ply-shell`. Built-in hamburger (page under 991px / dashboard mobile) and optional dashboard collapse toggle.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `showMenuToggle` | `boolean` | `true` | Show built-in hamburger. |
| `showCollapseToggle` | `boolean` | `true` | Show dashboard mini↔expanded control. |

---

### ShellContentComponent
**Selector:** `ply-shell-content`
**Standalone:** true

Main content slot for `ply-shell`. Place `<router-outlet>` here. Page mode scrolls with the parent column; dashboard mode scrolls this host.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |

---

### ShellFooterComponent
**Selector:** `ply-shell-footer`
**Standalone:** true

Optional footer slot for `ply-shell` (typically page mode).

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |

---

### ShellToggleComponent
**Selector:** `ply-shell-toggle`
**Standalone:** true

Optional panel toggle for page-mode sidebars (e.g. a right panel). Transparent hamburger (`menu` / `close`) matching the header control. Prefer the built-in header hamburger for the primary left nav — do not add a second left toggle.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `side` | `'left' \| 'right'` | `'left'` | Which panel to toggle. |

---

### ShellNavComponent
**Selector:** `ply-shell-nav`
**Standalone:** true

Navigation list container for shell sidebar items.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |

---

### ShellNavItemComponent
**Selector:** `a[ply-shell-nav-item], button[ply-shell-nav-item], ply-shell-nav-item`
**Standalone:** true

Nav item with icon + label. In dashboard mini mode the label hides. Clicking closes mobile / page drawers. Pair with `routerLink` / `routerLinkActive`.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `icon` | `string` | `''` | Icon sprite name. |

---

### ShellNavSectionComponent
**Selector:** `ply-shell-nav-section`
**Standalone:** true

Labeled group inside `ply-shell-nav`. The heading fades out with the dashboard mini-rail width; a small gap still separates groups. Project `ply-shell-nav-item` children.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra host classes merged via `cn()`. |
| label | `string` | '' | Visible section heading. Hidden when the dashboard rail is collapsed. |

---

### SidenavComponent
**Selector:** `ply-sidenav`
**Standalone:** true

Responsive section shell with a left nav rail and scrollable body. Pair with `ply-sidenav-nav` and `ply-sidenav-body`. Free shell (`npx ply-ui-cli add sidenav`).

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |
| `color` | `string` | `undefined` | Color for the mobile nav toggle button. |
| `layout` | `'auto' \| 'mobile' \| 'desktop'` | `'auto'` | Force mobile/desktop chrome, or follow the viewport `lg` breakpoint. |

---

### SidenavNavComponent
**Selector:** `ply-sidenav-nav`
**Standalone:** true

Left navigation slot for `ply-sidenav`.

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |

---

### SidenavBodyComponent
**Selector:** `ply-sidenav-body`
**Standalone:** true

Main content slot for `ply-sidenav` (typically hosts a router outlet).

| Input | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra host classes merged via `cn()`. |

---

### ScrollNavItemComponent
**Selector:** `ply-scroll-nav-item`
**Standalone:** true

A section within a scroll-nav component that is linked to a sidebar item.

*No inputs or outputs.*

---

### PaginatorComponent
**Selector:** `ply-paginator`
**Standalone:** true

A pagination control component. Allows users to navigate between pages of data and change the page size. Previous/next labels come from `provideBaseUiI18n()`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| plyPaginator | `boolean` | false | If true, applies a distinct "base" visual variant. |
| arrows | `boolean` | false | If true, shows explicit previous/next arrow buttons instead of standard pagination. |
| itemsPerPage | `string \| number \| null` | null | The currently selected number of items per page. |
| pageSizeOptions | `number[]` | [10, 25, 50, 100] | The available options for "items per page" dropdown. |

---

### PPageComponent
**Selector:** `ply-p-page`
**Standalone:** true

Represents an individual page number button inside a `ply-paginator`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| active | `boolean` | false | Indicates if this page is currently the active/selected page. |

---

### StepperComponent
**Selector:** `ply-stepper`
**Standalone:** true

A multi-step workflow container component. Automatically handles step transitions, active state, and visual progress lines.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| activeStepIndex | `number` | 0 | The zero-based index of the currently active step. |
| linear | `boolean` | false | If true, the user is restricted from jumping ahead to uncompleted steps. |
| successTitle | `string` | 'All done!' | The title displayed on the success screen after submission. |
| successMessage | `string` | 'Your request has been successfully submitted.' | The message displayed on the success screen after submission. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| stepChange | `number` | Emitted whenever the active step index changes. |
| stepperSubmit | `void` | Emitted when the stepper is submitted on the final step. |

---

### StepComponent
**Selector:** `ply-step`
**Standalone:** true

An individual step within a `ply-stepper`. Contains the label, icon, and template content to render when active.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | '' | The primary title text for this step. |
| icon | `string` | '' | Optional SVG icon name to display instead of a number. |
| description | `string` | '' | Optional secondary subtitle text for this step. |

---

---

### MegaMenuComponent
**Selector:** `ply-mega-menu`
**Standalone:** true

Full-width mega menu with a trigger slot and a dropdown panel. Content projected into `[mega-menu-trigger]` becomes the clickable trigger (wrapped with `role="button"`, toggled by click, Enter, or Space, with `aria-haspopup`/`aria-expanded`/`aria-controls`); default projected content becomes the panel body. The panel renders `position: fixed` at a fixed 1200px width, horizontally centered in the viewport (minimum 16px from the left edge) and 8px below the trigger, with `z-index` 9900, a slide-down enter/leave animation, and `max-h-[85vh]` scrolling. While open it repositions on window scroll/resize, closes on Escape or on clicks outside the trigger/panel, moves focus to the panel's first focusable element on open, and restores focus to the previously focused element (or the trigger) on close; the open listener teardown also runs in `ngOnDestroy`. The panel has `role="navigation"` labelled by `menuLabel`. Uses `OnPush` change detection with signal-based open state, and merges host classes (`inline-block relative`) with the `class` input via `cn()`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged into the host's `inline-block relative` classes via `cn()` (signal input, aliased from `extraClass`). |
| menuLabel | `string` | 'Mega menu' | Accessible name applied to the panel's `role="navigation"` region via `aria-label`. |

## Media

### IconComponent
**Selector:** `ply-icon`
**Standalone:** true

A highly optimized SVG icon component. By default it pulls SVG definitions from `assets/icons.svg` using the provided `name`. Override sprite paths with `provideBaseUI({ iconPath })`. Inherits the current text color if not explicitly provided.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | '' | The SVG id/name of the icon to render (e.g. 'chevron-right'). |
| path | `string` | provideBaseUI().iconPath | Outline sprite. Empty uses `provideBaseUI().iconPath` (default `assets/icons.svg`). |
| filledPath | `string` | provideBaseUI().filledIconPath | Solid sprite when `filled` is true. Empty uses `provideBaseUI().filledIconPath`. |
| color | `string` | '' | Optional explicit CSS color. |
| size | `string \| number` | '' | Explicit size. Empty uses `provideBaseUI().defaultSize` unless the host has `w-*` / `h-*` classes. |

---

### StarRatingComponent
**Selector:** `ply-star-rating`
**Standalone:** true

A flexbox container wrapper for `ply-star` components. Aligns stars horizontally with appropriate gap spacing.

*No inputs or outputs.*

---

### StarComponent
**Selector:** `ply-star`
**Standalone:** true

A single star in the `StarRatingComponent`. Handles the SVG rendering for each star segment.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| rating | `number` | 0 | The rating value. |
| editable | `boolean` | false | Whether the star rating is editable. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| ratingChanged | `number` | Emitted when the rating changes (if editable). |

---

### GallerySliderComponent
**Selector:** `ply-gallery-slider, ply-carousel`
**Standalone:** true

A highly configurable image/content carousel component. Supports auto-play, touch swiping, and slide/crossfade transitions.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| activeIndex | `number` | 0 | The zero-based index of the currently active slide. |
| animate | `boolean` | true | Whether transitions are animated. |
| dark | `boolean` | false | Applies a dark-themed visual overlay/buttons. |
| direction | `'next' \| 'prev'` | 'next' | Defines the transition direction explicitly. |
| interval | `number` | 5000 | Milliseconds before auto-advancing to the next slide. 0 to disable. |
| pause | `'hover' \| false` | 'hover' | Whether to pause autoplay on hover. |
| touch | `boolean` | true | Whether touch swipe navigation is enabled. |
| transition | `'slide' \| 'crossfade'` | 'slide' | The animation transition style. |
| wrap | `boolean` | true | Whether the carousel loops back to the start at the end. |
| slides | `string[]` | [] | Optional array of image source URLs for a quick image-only slider. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| itemChange | `number` | Emitted whenever the active slide index changes. |

---

### CarouselItemComponent
**Selector:** `ply-carousel-item`
**Standalone:** true

An individual slide item within a gallery slider. Can contain arbitrary content, typically an image and an optional `ply-carousel-caption`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| interval | `number` | -1 | Optional override for the auto-play interval when this specific slide is active. |

---

### CarouselCaptionComponent
**Selector:** `ply-carousel-caption`
**Standalone:** true

A caption overlay for a gallery slider or carousel item, typically positioned over the image.

*No inputs or outputs.*

---

### HorizontalCarouselComponent
**Selector:** `ply-horizontal-carousel`
**Standalone:** true

A horizontally scrollable container component for presenting multiple items in a row. Includes built-in smooth scrolling, mouse drag-to-scroll, and touch swipe support.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | '' | Optional title to display above the carousel controls. |

*No outputs.*

---

### FileUploadComponent
**Selector:** `ply-file-upload`
**Standalone:** true

A highly versatile file upload component supporting buttons, standard inputs, and drag-and-drop zones. Implements ControlValueAccessor — the form value is `File[]`. `disabled` (input or `setDisabledState`) blocks the native picker and dropzone. Do not nest inside `ply-input-group`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| accept | `string` | '*/*' | The accepted file types. |
| multiple | `boolean` | false | Whether multiple files can be selected at once. |
| disabled | `boolean` | false | Disables the file input and drag-and-drop zones. |
| variant | `'input' \| 'button' \| 'dropzone'` | 'input' | The visual presentation style of the uploader. |
| buttonColor | `'primary' \| 'danger' \| 'success' \| 'warning' \| 'accent' \| ''` | 'primary' | Semantic color variant (only applies when variant is 'button'). |
| buttonVariant | `'solid' \| 'stroked'` | 'stroked' | Solid or stroked styling (only applies when variant is 'button'). |
| label | `string` | 'Choose file' | Text label displayed on the button or input field. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| fileSelected | `File[]` | Emitted when files are selected via dialog or drag-and-drop. |

---

### CropImageComponent
**Selector:** `ply-crop-image`
**Standalone:** true

Pro tier. A component for cropping images, typically used for avatars or profile pictures.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| imageFile | `File \| undefined` | — | File object from ply-file-upload or programmatic use. |
| imageChangedEvent | `Event \| null` | null | Native file input change event (alternative to imageFile). |
| maintainAspectRatio | `boolean` | true | Whether to maintain aspect ratio during cropping. |
| aspectRatio | `number` | 1 | The aspect ratio (width/height) for the crop box. |
| hideIfEmpty | `boolean` | true | Whether to hide the component when no image is loaded. |
| cropperHeight | `string` | '400px' | Height of the crop viewport (CSS value). |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| cropped | `Blob \| null` | Emitted with the cropped image as a Blob when confirmed. |
| canceled | `void` | Emitted when the crop is canceled. |

---

### ProductGalleryComponent
**Selector:** `ply-product-gallery`
**Standalone:** true

Pro tier. A highly interactive product gallery component supporting images, videos, thumbnails, and zooming.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| items | `{ id?: string \| number; src: string; thumbSrc?: string; alt?: string; type?: 'image' \| 'video' }[]` | [] | The array of media items to display in the gallery. |
| thumbnailsPosition | `'left' \| 'right' \| 'top' \| 'bottom'` | 'left' | Position of the thumbnails strip relative to the main viewer. |
| showArrows | `boolean` | true | Whether to show previous/next navigation arrows on the main viewer. |
| objectFit | `'cover' \| 'contain'` | 'cover' | CSS object-fit rule for the main image. |
| zoomOnClick | `boolean` | true | Enables an interactive magnifying zoom effect when clicking the main image. |
| aspectRatio | `string` | '16/9' | Aspect ratio constraint for the main viewer. |
| mainViewWidth | `string` | '100%' | Width of the main view container. |
| mainViewHeight | `string` | 'auto' | Height of the main view container. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| indexChange | `number` | Emitted whenever the active selected item changes. |

---

## Form Blocks

> Pre-built, self-contained form flows (login, signup, checkout, billing, wizard, …). **Free tier.**

### FormBillingComponent
**Selector:** `ply-form-billing`
**Standalone:** true

Pre-built billing/plan form block rendered inside a `ply-card`: three selectable plan cards (Starter $9, Pro $29, Enterprise $99) with a "Popular" badge on Pro, a seat stepper, a promo-code input with Apply button, and a full-width "Upgrade Plan" button. Plan selection and seat count are internal signals (`selectedPlan` defaults to `'pro'`, `seats` defaults to 5, clamped 1–100 with the stepper buttons disabled at the bounds); the displayed monthly total is computed as seats × $29. Uses OnPush change detection and has no inputs or outputs — it is a static showcase composition of `CardComponent`, `InputGroupComponent`, `LabelComponent`, `BaseInputDirective`, `BaseButtonDirective`, `BadgeComponent`, and `IconComponent`.

---

### FormCartComponent
**Selector:** `ply-form-cart`
**Standalone:** true

Prebuilt static shopping-cart card block composed of `ply-card`/`ply-card-body` with a "Cart" header showing two overlapping avatar images, two hardcoded product line items (thumbnail, name, quantity with +/- buttons, price), a totals breakdown (subtotal, promo code, tax, total), and "Pay with Card" (`ply-stroked-button`) plus "Checkout" (`ply-button`) action buttons. Purely presentational template with `OnPush` change detection and an empty class body — all content is hardcoded and the quantity/checkout buttons have no click handlers wired up.

---

### FormCheckoutSummaryComponent
**Selector:** `ply-form-checkout-summary`
**Standalone:** true

Pre-built checkout confirmation/order summary block composed from `ply-card`, `ply-card-body`, `ply-icon`, `ply-checkbox`, and `[ply-button]`. Renders a "Confirmation" header with three check-circle step icons, a hardcoded item list, shipping/delivery/payment sections (including static native radio buttons for VISA/PayPal selection), an itemized totals breakdown with promo-code discount, a Terms and Conditions `ply-checkbox`, and "Proceed to Checkout" (primary button) plus "Back" actions. All content is static demo copy — the component has no inputs or outputs and no wired-up event handlers; it is a copyable layout template rather than a configurable widget. Uses OnPush change detection.

---

### FormDeleteAccountComponent
**Selector:** `ply-form-delete-account`
**Standalone:** true

Pre-built "delete account" danger-zone form rendered inside a `ply-card`: a red warning banner with an alert-triangle icon, static consequence bullet points (deleted projects, lost team access, cancelled subscriptions) with links to export data or transfer ownership, a type-to-confirm text input, and a full-width red "Delete Account Permanently" button. The confirmation value is tracked in an internal signal via the input's `(input)` event, and the delete button stays disabled until the user types exactly `DELETE`. Uses OnPush change detection; the button performs no action itself (no output is emitted on click), and the displayed counts/links are static demo content.

---

### FormFeedbackComponent
**Selector:** `ply-form-feedback`
**Standalone:** true

Pre-composed "Feedback" form card built from library primitives: a `ply-card` containing a heading, side-by-side Name and Email inputs, a feedback-type `<select>` (single "General" option) with a chevron-down end-addon icon, a 5-row Message textarea, and a full-width primary "Send Feedback" button. Purely presentational (OnPush) — it has no inputs, outputs, form bindings, or submit handling; the button performs no action.

---

### FormFilterComponent
**Selector:** `ply-form-filter`
**Standalone:** true

Self-contained filter/search panel rendered inside a `ply-card`: a search input with a start-addon icon, toggleable status chips, a from/to date range, a sort-by `<select>` with a chevron end-addon, toggleable tag chips, and Apply Filters / Reset actions. Chip data (`statuses`, `tags`) is hardcoded in internal signals and toggled on click; a computed `activeCount` shows a "Clear all (N)" button only when at least one chip is active, and `clearAll()` deactivates every chip. Uses OnPush change detection; has no inputs or outputs, so it is a fixed showcase widget rather than a configurable control.

---

### FormLoginComponent
**Selector:** `ply-form-login`
**Standalone:** true

Prebuilt login form block rendered inside a `ply-card`: email and password `ply-input-group` fields, a "Keep me logged in" `ply-checkbox` with a "Forgot password?" link, a full-width primary "Sign In" `ply-button`, and a "Sign up" footer link. Purely presentational — the template is static markup with no form bindings, no submit handling, and no configurable state; uses `OnPush` change detection. Composes `CardComponent`, `InputGroupComponent`, `LabelComponent`, `BaseInputDirective`, `CheckboxComponent`, and `BaseButtonDirective`.

---

### FormLoginTabsComponent
**Selector:** `ply-form-login-tabs`
**Standalone:** true

Prebuilt authentication block: a `ply-card` containing an underline-style `ply-tabs` with two tabs — "Sign Up" (name, lastname, phone, email, password, confirm-password inputs, a Terms and Conditions checkbox, and a primary Sign Up button) and "Login" (login and password inputs with an eye-icon addon button, a "Remember me" checkbox, a "Forgot password?" link, and a full-width primary Sign In button). Both tabs end with a row of stroked icon buttons for facebook, linkedin, and x-twitter social sign-in. Purely presentational static markup with `OnPush` change detection — no form bindings, no configurable inputs, and no outputs; composed from Card, Tabs, InputGroup, Label, Checkbox, Icon, and the button/input/link/addon directives.

---

### FormNewsletterComponent
**Selector:** `ply-form-newsletter`
**Standalone:** true

Pre-built newsletter signup card: a `ply-card` containing a centered email icon in a rounded tile, a "Subscribe to Our Weekly Newsletter" heading, a "no spam" tagline, a `ply-input-group` with a center-aligned email text input, and a full-width primary Subscribe button. All copy is hardcoded and the component has no logic — the input is not bound to any form model and the button emits no events, so it serves as a static template/starting point rather than a functional form. Uses `ChangeDetectionStrategy.OnPush`.

---

### FormNotificationsComponent
**Selector:** `ply-form-notifications`
**Standalone:** true

Prebuilt notification-settings card widget. Renders a `ply-card` with a "Notifications" header, two toggle sections ("Activity notifications" and "Marketing", each row pairing a label with a `ply-toggle`), and an "Add more contacts" panel containing name/email `ply-input-group` fields (the email field shows a green check-circle icon via `ply-addon-end`), a radio option, and Add (`ply-button color="primary"`) / Cancel (`ply-stroked-button`) buttons. Purely presentational: it has no inputs, outputs, or component state — toggle/input values are not bound or emitted, so consumers must copy or wrap the template to wire up real behavior. Uses `ChangeDetectionStrategy.OnPush`.

---

### FormPaymentComponent
**Selector:** `ply-form-payment`
**Standalone:** true

Prebuilt static payment form section: a `ply-card` with a "Payment Info" header showing a 3-step progress indicator (two check-circle icons and a numbered dot), payment-method selector buttons (VISA active, PayPal dimmed), and inputs for cardholder name, card number, expiry date, and CVV via `ply-input-group`/`ply-label`/`ply-input`. Footer holds a stroked "Back" button (with arrow-left icon) and a primary "Pay Now" button. Purely presentational template with no bound state, form logic, or validation — composes CardComponent, CardBodyComponent, InputGroupComponent, LabelComponent, BaseInputDirective, IconComponent, BaseButtonDirective, and StrokedButtonDirective; uses OnPush change detection.

---

### FormProfileSettingsComponent
**Selector:** `ply-form-profile-settings`
**Standalone:** true

Prebuilt profile-settings form block rendered inside a `ply-card`: a cover-image header with an overlaid title, avatar, and round icon-button actions (edit, delete, user, more), followed by a card body with two-column text inputs (first/last name, phone, email with a green check-circle end addon, zipcode, area), country/state `<select>` fields styled via `ply-input` with chevron end addons, a bio textarea, and full-width Save (primary) / Cancel buttons. Entirely static template with hard-coded sample values (no Angular Forms wiring, no configurable state); uses OnPush change detection.

---

### FormReviewComponent
**Selector:** `ply-form-review`
**Standalone:** true

Pre-composed "Write a Review" form card. Renders a `ply-card` containing a header row with title and a close-icon button, a hardcoded product summary (watch image and name), a read-only star rating display (`ply-star-rating` with a single `ply-star` fixed at rating 4), a Title text input, a Review textarea, and a full-width primary "Write a Review" submit button. The component class is empty — it has no inputs, outputs, or form wiring; all content is static template markup (uses OnPush change detection), so it serves as a copyable layout block rather than a configurable widget.

---

### FormShippingComponent
**Selector:** `ply-form-shipping`
**Standalone:** true

Prebuilt shipping-information form block rendered inside a `ply-card`. The card header shows a "Shipping Info" title with a 3-step progress indicator (check icon, current step "2", x icon); the body contains two delivery-method toggle buttons (Free Delivery / Express Delivery), `ply-input-group` fields for street address, first/last name, phone, email, and zipcode, native `<select>` dropdowns (with `ply-addon-end` chevron icons) for country/state/city, an "Area" textarea, and Back / Next Step stroked buttons. All content is static demo markup — the component class is empty, with no inputs, outputs, form bindings, or event handlers; uses OnPush change detection.

---

### FormSignupComponent
**Selector:** `ply-form-signup`
**Standalone:** true

Pre-built static sign-up form rendered inside a `ply-card`: side-by-side First Name / Last Name inputs, Email and Password fields (each a `ply-input-group` with `ply-label` and `ply-input`), a full-width primary `ply-button` "Sign Up" button, and an "Already have an account? Log in" footer link. Purely presentational with OnPush change detection — no inputs, outputs, form bindings, or submit handling; the fields are plain uncontrolled native inputs and the button has no click handler.

---

### FormSignupTabsComponent
**Selector:** `ply-form-signup-tabs`
**Standalone:** true

Pre-built signup/login form block: a `ply-card` containing underline-style `ply-tabs` with two tabs — "Sign Up" (name, lastname, phone, email, password and confirm-password inputs with eye-icon end addons, a Terms and Conditions checkbox, a primary Sign Up button, and Facebook/LinkedIn/X social sign-in icon buttons) and "Login" (login/password inputs, "Remember me" checkbox, "Forgot password?" link, full-width Sign In button, and the same social buttons). The template is purely static markup composed from library components (Card, Tabs, InputGroup, Label, Checkbox, Button/IconButton directives, Icon) — no form model, validation, or event wiring is included, so consumers copy or wrap it to add real form logic. Uses OnPush change detection.

---

### FormSuccessMessageComponent
**Selector:** `ply-form-success-message`
**Standalone:** true

Pre-built order-confirmation success card (OnPush). Renders a `ply-card` containing a large circled green check icon, a "Congratulations! Your order is accepted." message, a two-column summary strip (order number and delivery date), a primary "Track Your Order" button, and a "Back to home" text link. All content is hardcoded — there are no inputs or outputs; it is a static template block intended to be copied/customized rather than configured. Composes `CardComponent`, `IconComponent`, and `BaseButtonDirective`.

---

### FormTeamInviteComponent
**Selector:** `ply-form-team-invite`
**Standalone:** true

Pre-composed "Invite Team Members" form block rendered inside a `ply-card`: an email input paired with a role `<select>` (Admin/Member/Viewer, with a chevron-down icon via `ply-addon-end`), a full-width primary "Send Invitation" button, and a static "Pending Invitations" list showing initial-avatar rows with status badges (Pending/Accepted/Expired). Purely presentational with hardcoded demo content — no inputs, outputs, form bindings, or injected services; uses OnPush change detection.

---

### FormWizardComponent
**Selector:** `ply-form-wizard`
**Standalone:** true

Self-contained three-step account signup wizard rendered inside a `ply-card`, with a progress stepper (completed steps show a check icon, the active step is highlighted), an account-details form step, a plan-selection step (Starter/Pro cards with a "Popular" badge), and a confirmation summary step with a terms `ply-checkbox`. Navigation is driven by internal signals (`currentStep`, `selectedPlan`) via Back/Continue buttons; step labels and form content are hardcoded, and the component exposes no inputs or outputs. Uses OnPush change detection and composes CardComponent, InputGroupComponent, LabelComponent, BaseInputDirective, BaseButtonDirective, BadgeComponent, IconComponent, and CheckboxComponent.

---

## Blog Cards

> Editorial blog/article card variants. **Pro tier** — requires a license (`PLY_LICENSE_KEY`).

### BlogCardCenteredHeroComponent
**Selector:** `ply-blog-card-centered-hero`
**Standalone:** true

Static blog-post card with a centered hero layout, composed from `ply-card`, `ply-card-body`, and `ply-card-footer`. The body centers a category eyebrow label, title, and excerpt; the footer shows an author `ply-avatar` with name on the left and calendar/comment-count `ply-icon` metadata on the right (the date hides below the `sm` breakpoint). All text, avatar, and metadata content is hardcoded in the template — there are no inputs or outputs; the card uses OnPush change detection and has hover lift/shadow styling with dark-mode classes.

---

### BlogCardCollageComponent
**Selector:** `ply-blog-card-collage`
**Standalone:** true

Pre-composed blog post card with a two-image collage header, a category eyebrow label ("Feature"), a title, and a footer showing an author avatar/name plus date and comment-count icon stats. All content (images, text, avatar URL, stats) is hard-coded in the template — this is a static pro-tier showcase block with no configurable API. Built by composing `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`; uses OnPush change detection, lazy-loaded images, and hover effects (card lift, shadow, image zoom).

---

### BlogCardCompactComponent
**Selector:** `ply-blog-card-compact`
**Standalone:** true

Compact blog-post card block (pro tier) composed from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`. Renders a lazy-loaded cover image that zooms on hover (with card lift/shadow), a category label, a title, and a footer row with author avatar/name plus calendar-date and comment-count icon groups. All content (image, category, title, author, date, comment count) is hardcoded in the template — the component has no inputs or outputs and uses OnPush change detection.

---

### BlogCardFloatingPanelComponent
**Selector:** `ply-blog-card-floating-panel`
**Standalone:** true

Preset blog-post card rendering a full-height cover image with a frosted-glass (backdrop-blur) panel floating over its bottom edge; the panel shows a category eyebrow, post title, and a footer with author avatar/name plus calendar-date and comment-count icon stats. Hovering lifts the card, deepens the shadow, and zooms the image. All content (image, text, avatar URL, icons) is hardcoded — the component has no inputs or outputs — and it composes `CardComponent`, `CardBodyComponent`, `CardFooterComponent`, `AvatarComponent`, and `IconComponent` with `OnPush` change detection.

---

### BlogCardGradientHeroComponent
**Selector:** `ply-blog-card-gradient-hero`
**Standalone:** true

Pre-composed blog hero card (pro tier) built from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`. Renders a full-bleed background image with a bottom-anchored dark gradient overlay containing a category eyebrow, headline, and a footer row with author avatar/name plus date and comment-count icons; on hover the card lifts and the image zooms. All content (image, text, author, date, comment count) is hard-coded in the template — there are no inputs or outputs, and the component uses OnPush change detection.

---

### BlogCardHorizontalFeatureComponent
**Selector:** `ply-blog-card-horizontal-feature`
**Standalone:** true

Static horizontal featured blog card composed from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`. Renders a wide cover image (left 3/5 on `lg` screens, stacked above the text on smaller viewports) beside an eyebrow label, headline, excerpt, and a footer with author avatar/name plus calendar-date and comment-count metadata (date hidden below `sm`). All content (image, text, avatar URL, date, counts) is hardcoded in the template — the component has no inputs or outputs; hover applies a lift/shadow on the card and a slow zoom on the image, and it uses OnPush change detection.

---

### BlogCardImageTopComponent
**Selector:** `ply-blog-card-image-top`
**Standalone:** true

Pre-composed blog/article preview card with a top cover image, built from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`. Renders a lazy-loaded cover image that zooms on hover (with card lift and shadow), a category label, an article title, and a footer with author avatar/name plus calendar-date and comment-count icon stats. All content (image, category, title, author, date, comment count) is hard-coded in the template — there are no inputs or outputs; it serves as a static pro-tier block meant to be copied and customized. Uses `ChangeDetectionStrategy.OnPush`.

---

### BlogCardInlineImageComponent
**Selector:** `ply-blog-card-inline-image`
**Standalone:** true

Blog post card with the article image inset between the title block and the footer (title above, full-width 180px cover image in the middle, meta footer below). Composes `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`; hover applies a lift, shadow, and a slow image zoom. All content is hard-coded in the template (a "Latest" tag, title, `assets/images/office.jpeg` image, author avatar/name, calendar date, and comment count) — it is a copy-and-adapt pro-tier template with no configurable API. Uses OnPush change detection.

---

### BlogCardMiniGridComponent
**Selector:** `ply-blog-card-mini-grid`
**Standalone:** true

Compact blog-list card built on `ply-card`/`ply-card-body`, rendering four hardcoded mini blog entries (64px square thumbnail plus bold title) in a responsive grid — single column on small screens, 2x2 on `lg`. Content is entirely static (no inputs): image paths and titles are baked into the template, images are lazy-loaded, and each item shows a hover effect (image zoom, title tint to indigo) via `group/item`. Uses OnPush change detection.

---

### BlogCardNewsletterComponent
**Selector:** `ply-blog-card-newsletter`
**Standalone:** true

Static newsletter signup promo card styled as an indigo gradient panel, composed from `ply-card`, `ply-card-body`, and `ply-card-footer` with a large decorative `ply-icon` ("mail") watermark. Renders a fixed "Join the Club" heading and tagline, a plain email `<input>`, and a "Subscribe Now" button — none of which are wired to Angular forms, bindings, or events; consumers must attach their own submit handling. Uses OnPush change detection and has no configurable API.

---

### BlogCardOverlayFeaturedComponent
**Selector:** `ply-blog-card-overlay-featured`
**Standalone:** true

Featured blog card with a full-bleed background image and a left-side gradient overlay panel (dark slate to transparent) containing an eyebrow label, large title, and excerpt, plus a footer row with author avatar, name, and a publish date (date hidden below the `sm` breakpoint). Composed from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`; on hover the card lifts with a shadow and the image scales up. All content (image, text, avatar URL, date) is hardcoded in the template — the component has no inputs or outputs and uses OnPush change detection, so it serves as a copy-and-customize pro-tier template.

---

### BlogCardOverlayMarketingComponent
**Selector:** `ply-blog-card-overlay-marketing`
**Standalone:** true

Pre-styled marketing blog card with a full-bleed cover image and a bottom-anchored text overlay on a dark gradient. Renders a hardcoded category label ("Marketing"), title, author avatar/name, date, and comment count — all content is static in the template (no inputs). Composes `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`, with hover effects (lift, shadow, image zoom) and `OnPush` change detection; the date/calendar segment is hidden below the `sm` breakpoint.

---

### BlogCardQuoteComponent
**Selector:** `ply-blog-card-quote`
**Standalone:** true

Pre-styled blog quote card with fully static content: an orange-tinted `ply-card` (left orange accent border, light/dark variants) containing a large serif italic pull-quote, a decorative rotated quotation-mark SVG watermark, and a footer with a `ply-avatar` plus hardcoded author role/name attribution. Composes CardComponent, CardBodyComponent, CardFooterComponent, and AvatarComponent; uses OnPush change detection. Has no inputs or outputs — the quote text, avatar URL, and attribution are hardcoded in the template, and hover applies a lift/shadow transition.

---

### BlogCardSplitImageComponent
**Selector:** `ply-blog-card-split-image`
**Standalone:** true

Pre-composed blog post card with a split two-image header: two side-by-side cover images (each 50% width) above a category label, title, and a footer with author avatar/name plus date and comment-count icon stats. Built from `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, and `ply-icon`; on hover the card lifts with a shadow and both images zoom slightly. All content (images, category, title, author, date, comment count) is hard-coded in the template — the component exposes no inputs or outputs, so customization requires copying the template. Uses OnPush change detection.

---

### BlogCardStatsComponent
**Selector:** `ply-blog-card-stats`
**Standalone:** true

Preset statistic blog card built from `ply-card`, `ply-card-body`, and `ply-card-footer`. Renders a large hardcoded stat number ("837") with a caption, and a footer row of three overlapping `ply-avatar` circles (hardcoded pravatar.cc image URLs) that spread apart on hover. Fully static — all content is baked into the template with no inputs, outputs, or content projection; uses OnPush change detection and includes hover lift/shadow styling with light/dark theme classes.

---

### BlogCardVideoComponent
**Selector:** `ply-blog-card-video`
**Standalone:** true

Static video-teaser blog card built on `ply-card`/`ply-card-body`: a full-bleed cover image (hardcoded to `assets/images/modern_office_architecture_1776362675453.png`) under a dark overlay with a centered frosted-glass "Play Video" pill containing a `play-circle` icon. On hover the card lifts with a larger shadow, the image scales up, and the overlay fades out. Uses OnPush change detection; it has no inputs or outputs, so the image, label, and click handling cannot be configured — consumers must bind their own click listener on the host.

---

## Article Cards

> Long-form article presentation blocks. **Pro tier** — requires a license.

### ArticleCardEditorialComponent
**Selector:** `ply-article-card-editorial`
**Standalone:** true

Editorial-style article card with fully hard-coded demo content, composed from `ply-card`/`ply-card-body`. Renders a timestamp header with share/more icon buttons, a headline, lead paragraph, a `ply-quote` pull quote with author attribution, a lazy-loaded hero image with photo credit and carousel-dot indicators, an author byline row (`ply-avatar` + name) with Facebook/X/LinkedIn share icons, and a comments footer with a count and an outline "View comments" button. Uses `OnPush` change detection; it has no inputs or outputs, so it serves as a copyable layout template rather than a configurable component.

---

### ArticleCardFullReaderComponent
**Selector:** `ply-article-card-full-reader`
**Standalone:** true

Full article reading experience rendered inside a `ply-card`: byline header with prev/more icon buttons, centered title, view/comment/share stats, hero image with caption, numbered content sections (one with a side-by-side image layout), an avatar-left `ply-quote` block, an author/share footer with social icons, a 3-column "Related News" grid, a threaded comments list (including a highlighted reply), and a comment composer (`ply-textarea` with an attach icon button and a full-width "Post Comment" button). All content is hardcoded demo copy — the component has no inputs or outputs and uses OnPush change detection. Composes `CardComponent`, `CardBodyComponent`, `QuoteComponent`, `AvatarComponent`, `IconComponent`, `InputGroupComponent`, and the `ply-button` / `ply-icon-button` / `ply-textarea` directives.

---

### ArticleCardHeroGalleryComponent
**Selector:** `ply-article-card-hero-gallery`
**Standalone:** true

Static, pre-composed article card (pro tier) with a full-width hero image section and a mini image gallery. The hero area layers a dark overlay over the image and shows an "Explore" label, share/more icon buttons, date, title, and author avatar; the card body renders a lead paragraph, a `ply-quote` (icon-top variant), a 3-image gallery grid with a hover zoom overlay on the middle image, a bullet list section, tag badges, a views/share row, and a comments footer with an "Add Comment" button. All content (text, images, counts) is hardcoded in the template — the component has no inputs or outputs and uses OnPush change detection; it composes `CardComponent`, `CardBodyComponent`, `IconButtonDirective`, `IconComponent`, `QuoteComponent`, `AvatarComponent`, `BaseButtonDirective`, and `BadgeComponent`.

---

### ArticleCardHeroTagsComponent
**Selector:** `ply-article-card-hero-tags`
**Standalone:** true

Pre-composed article/blog-post card with a full-bleed hero image header (dark overlay, back/share/more icon buttons, date, title, and view count rendered over the image). The body contains static article copy with an inline image split, a tag row of `ply-badge` chips, a share bar with social icons, and a comments section featuring a text comment, a mock voice-note comment with a play button and audio-waveform bars, and a "Login to add comment" footer. All content is hardcoded (no inputs/outputs); uses OnPush change detection and composes `ply-card`, `ply-card-body`, `ply-icon`, `ply-avatar`, `ply-badge`, and the `ply-button`/`ply-icon-button` directives.

---

## Ecommerce Blocks

> Storefront sections (hero banners, product detail, promos). **Pro tier** — requires a license.

### EcommerceBlockDualPromoComponent
**Selector:** `ply-ecommerce-block-dual-promo`
**Standalone:** true

Static two-column promo row (stacking to one column below `lg`): a product spotlight card with a "Just In" `ply-badge`, product title, price, image, and a primary "Shop Now" button, alongside a full-bleed image sale banner with a dark overlay, headline, and a white "Shop Sale" button. The banner image zooms slightly on hover. All content (copy, prices, `/assets/demo/` images) is hardcoded in the template — the component has no configurable API. Uses OnPush change detection; composes `BadgeComponent` and `BaseButtonDirective`.

---

### EcommerceBlockHeroBannerComponent
**Selector:** `ply-ecommerce-block-hero-banner`
**Standalone:** true

Full-width ecommerce hero banner block with a fixed-height (600px) rounded background image, a dark overlay, and centered content: a heading, a subtitle, and a pill-shaped "Explore Now" CTA rendered with `[ply-button]` (`color="primary"`). All content is hardcoded (including the background image at `/assets/demo/drone.png`) — the component exposes no inputs, outputs, or content projection. Uses `OnPush` change detection.

---

### EcommerceBlockLifestyleGridComponent
**Selector:** `ply-ecommerce-block-lifestyle-grid`
**Standalone:** true

Static, presentational ecommerce lifestyle grid block with hardcoded demo content: a large hero image tile ("Denim Collection") with a gradient overlay and a "Shop Collection" button (via `BaseButtonDirective`), a featured product card (portable speaker with name and price), and a stacked column of two smaller cards (a wireless headphones product card and an "Accessories" lifestyle image tile). Responsive layout goes from a single column to 2 columns at `md` and 4 columns at `lg`, with hover scale/shadow transitions on each tile; uses `OnPush` change detection. Images are loaded lazily from `/assets/demo/`, and all content is fixed in the template — the component has no inputs, outputs, or content projection.

---

### EcommerceBlockProductDetailComponent
**Selector:** `ply-ecommerce-block-product-detail`
**Standalone:** true

Pre-built (pro tier) horizontal product detail block: a two-column card with product info on the left and a full-bleed product image on the right. Renders a fixed 4.5-star rating (`ply-star`) with review count, hardcoded product title/price/description, a size selector built from `ply-radio-group`/`ply-radio-button`, color swatch buttons, a quantity `ply-input-spinner` (min 1, max 10), an "Add to Bag" `ply-button`, and a heart `ply-icon-button` wishlist action. All content is static demo copy — the component has no configurable API; uses OnPush change detection.

---

### EcommerceBlockProductTabsComponent
**Selector:** `ply-ecommerce-block-product-tabs`
**Standalone:** true

Static pro-tier ecommerce block rendering a split product detail layout: a large product image panel on the left and, on the right, the product name, price with an "In Stock" tonal success badge, and an underline-type `ply-tabs` group with three tabs — Overview (description plus a check-icon feature list), Specifications (label/value spec rows), and Reviews (a `ply-star` 4.8 rating and a quoted review). Below the tabs it renders a full-width primary "Add to Cart" button and "Share" / "Ask a question" link buttons. All content (copy, price, rating, image) is hardcoded in the template; the component class is empty with `ChangeDetectionStrategy.OnPush` and composes `BadgeComponent`, `IconComponent`, `StarComponent`, the tabs family, and the `ply-button`/`ply-link` directives.

---

### EcommerceBlockSplitBannerComponent
**Selector:** `ply-ecommerce-block-split-banner`
**Standalone:** true

Split ecommerce banner block with marketing copy on one side and a product image on the other, arranged in a responsive two-column grid (stacked on small screens) inside a rounded container. The copy side renders a "Limited Edition" `ply-badge`, product heading, description, price, and a rounded "Shop Now" `ply-button`; the image side shows a lazily loaded demo speaker image (`/assets/demo/speaker.png`). All content is hardcoded — the component has no inputs, outputs, or projected content, and uses OnPush change detection.

---

## Media Widgets

> Audio/video players, playlists and media cards. **Pro tier** — requires a license.

### MediaWidgetAlbumCarouselComponent
**Selector:** `ply-media-widget-album-carousel`
**Standalone:** true

Pre-built media widget (pro tier) rendering a `ply-card` containing a `ply-horizontal-carousel` titled "Albums" with eight hard-coded album items. Each item shows a lazy-loaded square cover image with hover effects (lift, image zoom, dark blurred overlay revealing Play and Bookmark `ply-icon-button`s), album title, artist name, and a `ply-star-rating`/`ply-star` rating with a `ply-tooltip` showing the numeric value. Uses OnPush change detection; entirely static content with no configurable API — customize by copying the template.

---

### MediaWidgetAlbumPlayerComponent
**Selector:** `ply-media-widget-album-player`
**Standalone:** true

Static album-player media widget rendered inside a `ply-card`: a cover-image panel with share/bookmark/download icon buttons and an album info overlay (artist, title, stats), beside a scrollable track list where the active track shows animated equalizer bars, plus a footer bar with previous/pause/next icon buttons and a mock volume slider (hidden below the `sm` breakpoint). All content (image, artist, tracks, durations) is hardcoded in the template — the component has no inputs, outputs, or state, uses `OnPush` change detection, and composes `CardComponent`, `IconButtonDirective`, and `IconComponent`. The playback controls and track rows are visual only; clicking them triggers no behavior.

---

### MediaWidgetAudioPlayerCompactComponent
**Selector:** `ply-media-widget-audio-player-compact`
**Standalone:** true

Compact audio-player media widget rendered inside a `ply-card`: a round stroked pause icon-button, hard-coded track title/artist ("Hold On, We're Going Home" / "Drake"), a "more" icon-button, a decorative static waveform made of bars, elapsed/total time labels, like and play-count stats, and a hover-revealed volume slider mock. Entirely presentational with all content hard-coded — no inputs, outputs, or playback logic; uses `OnPush` change detection and composes `CardComponent`, `IconButtonDirective`, `IconStrokedButtonDirective`, and `IconComponent` from the library.

---

### MediaWidgetAudioPlayerDarkComponent
**Selector:** `ply-media-widget-audio-player-dark`
**Standalone:** true

Static dark-themed audio player widget rendered inside a `ply-card` with a forced `bg-slate-900!` background (always dark regardless of theme). Displays hardcoded demo content: a "Radio NRJ 104.2" station header with a "more" icon button, a round stroked pause button, track title/artist ("Freedom" — Pharrell Williams), a decorative six-bar equalizer visualization, a listener count line, and a purely visual volume slider whose thumb appears on hover. Uses OnPush change detection; purely presentational — no inputs, outputs, or playback logic.

---

### MediaWidgetAudioPlayerHeroComponent
**Selector:** `ply-media-widget-audio-player-hero`
**Standalone:** true

Full-height hero audio player card (pro tier) built on `ply-card`. Renders a cover image with a dark gradient overlay containing a bookmark icon button, a genre badge, and the track title/artist, above a control panel with a static progress bar (hardcoded times and 1/3 progress) and shuffle/backward/play/forward/refresh icon buttons. Purely presentational: all content (image, track metadata, times) is hardcoded, the control buttons have aria-labels but no click handlers, and the component uses OnPush change detection with no state.

---

### MediaWidgetPlaylistComponent
**Selector:** `ply-media-widget-playlist`
**Standalone:** true

Static (display-only) music playlist widget rendered inside a `ply-card`: a "Playlist" header with a more-options icon button, a transport bar with backward/pause/forward icon buttons and a decorative hover-reveal volume slider (shown only at `sm`–`lg` and `xl+` breakpoints), and a vertically scrollable list of ten hard-coded demo tracks, each with a play/pause icon button, artist/title text, and duration — one track is styled as active. Uses `OnPush` change detection and composes `CardComponent`, `IconButtonDirective`, and `IconComponent`; all content is fixed in the template, so the component has no inputs, outputs, or interactive logic beyond the static markup.

---

### MediaWidgetRelatedVideosComponent
**Selector:** `ply-media-widget-related-videos`
**Standalone:** true

Static "Related Videos" showcase widget rendered inside a `ply-card`: a header row with a "Related Videos" title and a transparent `ply-icon-button` ("More"), above a vertically scrollable list of seven hardcoded video entries. Each entry shows a lazy-loaded thumbnail with a hover play-icon overlay and duration badge, a two-line clamped title, and views/age metadata, with hover scale/shadow/color transitions and full light/dark styling. Uses OnPush change detection; it has no inputs or outputs — all content (titles, durations, `assets/images/gallery/slide-*.png` thumbnails) is fixed demo data.

---

### MediaWidgetTopSinglesComponent
**Selector:** `ply-media-widget-top-singles`
**Standalone:** true

Music chart card ("Top Singles") built on `ply-card`, with a header row containing a "More" icon button, a Week/Month/Year tab strip (static, non-interactive — "Week" is styled as selected), and a hardcoded ranked list of 5 tracks showing rank number, cover image, title/artist, and an up/down/steady trend icon. Uses `ChangeDetectionStrategy.OnPush`; all content is static demo data (no inputs, outputs, or injected services) — track images load from `assets/images/gallery/`. Fully styled for light and dark mode.

---

### MediaWidgetVideoHeroComponent
**Selector:** `ply-media-widget-video-hero`
**Standalone:** true

Pro-tier showcase widget rendering a static video-player hero inside a `ply-card` with a 16:9 (`aspect-video`) frame. Shows a cover image with a centered play button that fades out on hover, while hover reveals a top overlay (avatar, title, share/info icon buttons) and a bottom control bar (backward/pause/forward transport buttons, timestamps, a decorative progress bar with hover scrubber thumb, a volume slider hidden below `md`, a quality `ply-select`, and a maximize button). Purely presentational with hardcoded demo content — no inputs, outputs, or playback logic; composes `CardComponent`, `IconButtonDirective`, `IconStrokedButtonDirective`, `IconComponent`, `AvatarComponent`, and `SelectComponent`, and uses `OnPush` change detection.

---

### MediaWidgetVideoPostComponent
**Selector:** `ply-media-widget-video-post`
**Standalone:** true

Pre-composed social video post card (pro tier) built on `ply-card`, using `OnPush` change detection. Renders a hardcoded demo layout: a 21/10 cover image (loaded from `assets/images/gallery/slide-3.png`, with the avatar from `assets/images/avatar2.jpeg`) with gradient overlay, author avatar/name/follower count, a white "Follow" stroked button, a centered play icon button that fades out on hover, a faux red playback progress bar, hover-revealed duration and volume/settings/maximize control icons, followed by a date, title, clamped description, and a footer with likes/views/comments counters plus share/link/flag icon buttons. All content is static — the component class is empty with no inputs or outputs; customization requires editing the template or overriding classes.

---

## Social Widgets

> Social feed, profile, chat and engagement blocks. **Pro tier** — requires a license.

### SocialWidgetActivityComponent
**Selector:** `ply-social-widget-activity`
**Standalone:** true

Static, presentational social activity feed widget built on `ply-card` with `OnPush` change detection. Renders a card header with an "Activity" title and a "Mark all read" button (visual only — no click handler is wired), followed by three hardcoded activity entries (a like, a comment with a quoted reply bubble, and a new follower), each with a colored circular `ply-icon` bubble (heart, message, user-plus) joined by a dashed vertical timeline and an uppercase relative timestamp. All content is fixed in the template; there is no data binding, so it serves as a demo/showcase widget rather than a configurable component.

---

### SocialWidgetArticleCommentsComponent
**Selector:** `ply-social-widget-article-comments`
**Standalone:** true

Static social-feed article card with a comment thread, composed from `ply-card`, `ply-avatar`, `ply-icon`, `ply-icon-button`, and `ply-button`. Renders a hardcoded publisher header, article title/excerpt with hero image, an engagement row (overlapping liker avatars, like/comment/share counts), Like and Comment action buttons, two sample comments (the second indented as a reply), and a "Write a comment..." input with star and plus-circle icon buttons. Uses OnPush change detection; all content is placeholder copy with no inputs, outputs, or interactive logic — customize by editing the template.

---

### SocialWidgetCalendarComponent
**Selector:** `ply-social-widget-calendar`
**Standalone:** true

Pro-tier social widget that renders the library's `CalendarComponent` (`<ply-calendar>`) horizontally centered via `mx-auto`. A thin presentational wrapper with `OnPush` change detection; it exposes no configuration of its own — all calendar behavior comes from the embedded `ply-calendar`.

---

### SocialWidgetChatComponent
**Selector:** `ply-social-widget-chat`
**Standalone:** true

Static, fixed-height (540px) one-to-one chat conversation mockup rendered inside a `ply-card`. Shows a header with the contact's avatar, green online-status dot, back and "more" buttons; a scrollable message thread with a "Today" date separator, incoming text and image bubbles, an outgoing bubble with timestamp and read-receipt check icon; and a composer footer with a text input plus attach, star, and send buttons. All content is hardcoded placeholder data — the component has no inputs, outputs, or interactive logic (buttons and input are visual only), and uses OnPush change detection. Composes `CardComponent`, `AvatarComponent`, `IconComponent`, and `IconButtonDirective`.

---

### SocialWidgetFeedPostComponent
**Selector:** `ply-social-widget-feed-post`
**Standalone:** true

Pre-built social feed post widget: a `ply-card` with a header row (avatar, author name, timestamp, and a "more" icon button), a fixed-height cover image, and a footer action bar with like, comment, and share buttons showing hardcoded counts. All content (avatar URL, name, image, counts) is static — the component has no inputs or outputs and uses OnPush change detection. Composes `CardComponent`, `AvatarComponent`, `IconComponent`, and `IconButtonDirective`; the action buttons apply hover color transitions but emit no events.

---

### SocialWidgetFollowSuggestionsComponent
**Selector:** `ply-social-widget-follow-suggestions`
**Standalone:** true

Static "Who to follow" social suggestion card built from `ply-card`, `ply-card-header`, and `ply-card-body`, with a "View All" text button in the header. Renders three hardcoded suggestion rows, each with a small circular `ply-avatar`, name, @handle, and a Follow (`ply-stroked-button`) or Following (`ply-button color="primary"`) action button. Uses OnPush change detection; all user data is hardcoded in the template and no click handlers are wired — it is a presentational demo widget with no configurable API.

---

### SocialWidgetImageCaptionComponent
**Selector:** `ply-social-widget-image-caption`
**Standalone:** true

Social-media style image card (pro tier) rendering a fixed-height (`h-80`) `ply-card` with a full-bleed background photo and gradient overlays. The top overlay shows a `ply-avatar` with a username and a "more" icon button (`ply-icon-button` with the `more-horisontal` icon); the bottom overlay shows a caption headline, a location row with a `map-pin` icon, and a `heart` icon with a like count. All content (image path, avatar URL, texts, counts) is hardcoded in the template — the component is a static showcase block with `OnPush` change detection and no configurable API.

---

### SocialWidgetImageOverlayComponent
**Selector:** `ply-social-widget-image-overlay`
**Standalone:** true

Social media post card with a full-bleed background image and gradient overlays (fixed height `h-80`, OnPush). The top overlay shows a hardcoded author avatar (`ply-avatar`), name ("Philip Drake"), and a "more-horisontal" stroked icon button; the bottom overlay shows hardcoded like (2.6k) and comment (384) counts with heart/message icons. All content is static — the component has no configurable API and composes `CardComponent`, `AvatarComponent`, `IconComponent`, and `IconStrokedButtonDirective` from the library.

---

### SocialWidgetInboxComponent
**Selector:** `ply-social-widget-inbox`
**Standalone:** true

Compact inbox/message-list card: a header with an "Inbox" title, unread-count `ply-badge`, and a search icon button, above a divided list of three conversation rows (avatar with online dot, sender name, one-line message preview, timestamp). The first row is styled as unread/active with a blue left border and tinted background. All conversations are hardcoded demo content — no inputs or outputs; OnPush change detection; composes `ply-card`, `ply-card-header`, `ply-card-body`, `ply-avatar`, `ply-badge`, `ply-icon`, and `ply-icon-button`.

---

### SocialWidgetPlatformStatsComponent
**Selector:** `ply-social-widget-platform-stats`
**Standalone:** true

2×2 grid of social-platform stat tiles (Facebook likes, X/Twitter followers, Instagram tags, video subs), each a `ply-card` with a platform `ply-icon`, a large count, and an uppercase label, with hover lift/shadow effects. All four tiles are hardcoded demo content — no inputs or outputs; OnPush change detection.

---

### SocialWidgetProfileCenteredComponent
**Selector:** `ply-social-widget-profile-centered`
**Standalone:** true

Centered profile card: gradient cover strip with a settings icon button, an overlapping circular `ply-avatar`, name, @handle, an italic bio quote, and a 3-column Posts/Followers/Following stats row divided by hairlines. All profile content is hardcoded demo copy — no inputs or outputs; OnPush change detection; composes `ply-card`, `ply-card-body`, `ply-avatar`, and `ply-icon`.

---

### SocialWidgetProfileCoverComponent
**Selector:** `ply-social-widget-profile-cover`
**Standalone:** true

Profile card with a photo cover: a 160px lazy-loaded cover image (hover zoom, dark gradient overlay) with the avatar, name, and role overlaid bottom-left; below it a 3-column Photos/Followers/Following stats row, "Send Message" (`ply-button` primary) and "Follow" (`ply-stroked-button`) actions, and a footer with a location pin and X/Instagram/link social icons. All content is hardcoded demo copy — no inputs or outputs; OnPush change detection. Note: the cover references `assets/images/breathtaking_nature_mountain_*.png`, which ships with the demo app, not the icon sprites — swap in your own image.

---

### SocialWidgetSettingsMenuComponent
**Selector:** `ply-social-widget-settings-menu`
**Standalone:** true

Account/settings menu card: a blue gradient header with avatar, name, plan label and an "Upgrade to Pro" `ply-stroked-button`, followed by a divided menu of three rows (Account Settings, Notifications with an unread dot, Privacy) each with a tinted icon bubble, title, subtitle, and chevron, and a "Log Out Everywhere" footer action. All content is hardcoded demo copy — no inputs or outputs; OnPush change detection; composes `ply-card`, `ply-avatar`, `ply-icon`, and `ply-stroked-button`.

---

### SocialWidgetTextPostComponent
**Selector:** `ply-social-widget-text-post`
**Standalone:** true

Text-only social post card: author header (avatar, name, @handle · time, more icon button), a short text body, and a footer bar with reply/repost/like buttons and counts. All post content is hardcoded demo copy — no inputs or outputs; OnPush change detection; composes `ply-card`, `ply-card-body`, `ply-card-footer`, `ply-avatar`, `ply-icon`, and `ply-icon-button`.

---

### SocialWidgetTrendingTopicsComponent
**Selector:** `ply-social-widget-trending-topics`
**Standalone:** true

"Trending Topics" card with a wrap of hashtag pill chips (#photography, #uiux, #angular highlighted in blue, #frontend, #webdesign) with hover states. All chips are hardcoded demo content — no inputs or outputs; OnPush change detection; composes `ply-card`.

---

### SocialWidgetUploadDropzoneComponent
**Selector:** `ply-social-widget-upload-dropzone`
**Standalone:** true

Thin preset wrapper around `ply-file-upload` configured as a multi-file dropzone ("Drop files here to upload"). It exposes no inputs or outputs of its own — use `FileUploadComponent` directly for events and configuration; this block exists as a copy-ready showcase variant. OnPush change detection.

---

## Utilities

### SpinnerComponent
**Selector:** `ply-spinner`
**Standalone:** true

A standard circular loading spinner component. Uses CSS animations for a smooth spinning effect.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | 'md' | The diameter/thickness of the loading spinner. |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'inverted'` | 'primary' | The semantic color variant. Use 'inverted' for white spinners on dark backgrounds. |

---

### SpinnerWrapperComponent
**Selector:** `ply-spinner-wrapper`
**Standalone:** true

A wrapper to center a spinner within a block or the entire page. Provides a backdrop that can be dark or light.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| backdrop | `'dark' \| 'light'` | 'light' | The backdrop style behind the spinner. |

---

### ProgressComponent
**Selector:** `ply-progress`
**Standalone:** true

A linear progress bar. On hover (or keyboard focus), a tip bubble appears at the leading edge of the fill showing the current percentage. Disable with `[showTip]="false"`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | 0 | The current progress value (0 to 100). |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent'` | 'primary' | The semantic color variant of the progress bar. |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | 'md' | The height/thickness of the progress bar. |
| showTip | `boolean` | `true` | Show the value tip at the fill edge on hover/focus. |
| class | `string` | `''` | Extra host classes. |

---

### MeterGroupComponent
**Selector:** `ply-meter-group`
**Standalone:** true

Stacked multi-value meter with optional legend. Pass `MeterGroupItem[]` (`label`, `value`, optional `color` / `icon`). Segment widths are proportional to values (or to optional `max`). Free tier. Install: `npx ply-ui-cli add meter-group`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `MeterGroupItem[]` | `[]` | Segments to render. |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Bar thickness. |
| max | `number` | sum of values | Optional capacity baseline. |
| showLegend | `boolean` | `true` | Show legend under the bar. |
| showValue | `boolean` | `true` | Show absolute values in the legend. |
| showPercent | `boolean` | `true` | Show percentage share in the legend. |
| class | `string` | `''` | Extra host classes. |

---

### CodeComponent
**Selector:** `ply-code`
**Standalone:** true

A component to display formatted code blocks with syntax highlighting and a copy-to-clipboard button. Supports HTML, TypeScript, JavaScript, and Bash highlighting.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| language | `string` | '' | The programming language of the code (e.g. 'HTML', 'TypeScript', 'Bash'). Used for syntax highlighting. |
| showCode | `boolean` | false | If true, the code block is expanded and visible by default. |

---

### ComingSoonComponent
**Selector:** `ply-coming-soon`
**Standalone:** true

A placeholder component used to indicate that a feature or page is under construction. Displays a shimmer effect and customizable text.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | '' | The primary heading text to display. |
| description | `string` | '' | The secondary descriptive text providing more context. |

---

### EmptyStateComponent
**Selector:** `ply-empty-state`
**Standalone:** true

A standard layout component to display when a list or view has no data. Centers an icon, title, and description.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| iconName | `string` | — | The name of the SVG icon to display at the top. |
| title | `string` | — | The primary heading text. |
| description | `string` | — | The secondary body text explaining the empty state. |

---

### QuoteComponent
**Selector:** `ply-quote`
**Standalone:** true

A stylized blockquote component for displaying testimonials, reviews, or pull quotes.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'border-left' \| 'icon-top' \| 'avatar-left'` | 'default' | The structural and visual layout variant of the quote. |
| authorName | `string` | — | The name of the person being quoted. |
| authorRole | `string` | — | The subtitle or role of the author. |
| avatarUrl | `string` | — | The URL to the author's avatar image. |
| iconColor | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'default' \| string` | 'primary' | The semantic color name for the quote icon. |

---

### RichTextEditorComponent
**Selector:** `ply-rich-text-editor`
**Standalone:** true

Lightweight WYSIWYG editor with a themed toolbar (`ply-stroked-icon-button`, tooltips, dropdown, divider) and a `contenteditable` body. Implements `ControlValueAccessor` — value is an HTML string. Toolbar: undo/redo, block style (p/h1–h3), bold/italic/underline/strike, bullet/numbered lists, alignment, link, clear formatting. Pro tier (`npx ply-ui-cli add rich-text-editor`).

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | `''` | Extra host classes merged via `cn()`. |
| placeholder | `string` | `'Write something...'` | Shown when the editor is empty. |
| minHeight | `number` | `180` | Minimum editable area height in pixels. |
| ariaLabel | `string` | `'Rich text editor'` | Accessible label for the editable region. |

---

## Directives

### BaseButtonDirective
**Selector:** `[ply-button]`
**Standalone:** true

A standard button directive. Extra `class` values merge via `cn()`. Primary/danger colors and radius read `--ply-*` tokens. Includes a `focus-visible` ring.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'white' \| 'black' \| 'default' \| 'transparent' \| string` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'xxl'` | 'default' | The size of the button. |
| width | `string` | — | Optional custom width (e.g. '100%'). |

---

### StrokedButtonDirective
**Selector:** `[ply-stroked-button]`
**Standalone:** true

A stroked button directive. Extra `class` values merge via `cn()`. Includes a `focus-visible` ring.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'white' \| 'black' \| 'default'` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'xxl'` | 'default' | The size of the button. |
| width | `string` | — | Optional custom width (e.g. '100%'). |

---

### IconButtonDirective
**Selector:** `[ply-icon-button]`
**Standalone:** true

An icon-only button directive. Extra `class` values merge via `cn()` (e.g. `class="rounded-full"`). Includes a `focus-visible` ring.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'white' \| 'black' \| 'default' \| 'transparent' \| string` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'xxl'` | 'default' | The size of the button. |

---

### IconStrokedButtonDirective
**Selector:** `[ply-stroked-icon-button]`
**Standalone:** true

A stroked icon-only button directive. Extra `class` values merge via `cn()`. Includes a `focus-visible` ring.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'white' \| 'black' \| 'default'` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'xxl'` | 'default' | The size of the button. |

---

### BaseLinkDirective
**Selector:** `[ply-link]`
**Standalone:** true

A link directive applying Lussos theme styles. Use this to style inline anchors and links.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'default'` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl'` | 'default' | The size of the link. |
| width | `string` | — | Optional custom width (e.g. '100%'). |

---

### BaseInputDirective
**Selector:** `[ply-input]`
**Standalone:** true

A standard input directive. Extra `class` values merge via `cn()`. Has no focus ring of its own — the ring lives on `ply-input-group` so addons stay inside it. Supports disabled and readonly states.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |

---

### BaseMaskDirective
**Selector:** `input[plyMask]`
**Standalone:** true

Dynamically masks a native `<input>` while typing. Pair with `[ply-input]` for styling. Form controls receive the masked display value; use `unmaskInputValue()` / `unmaskedValue()` for raw characters.

**Tokens:** `0` digit, `A` letter, `S` alphanumeric; any other character is a literal.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| plyMask | `string` | — (required) | Mask pattern, e.g. `(000) 000-0000`, `00/00/0000`, `AAAA-0000`. |

**Helpers (exported):** `applyInputMask(value, pattern)`, `unmaskInputValue(masked, pattern)`.

---

### BaseTextareaDirective
**Selector:** `[ply-textarea]`
**Standalone:** true

A standard textarea directive. Extra `class` values merge via `cn()`. Has no focus ring of its own — the ring lives on `ply-input-group`.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| class | `string` | '' | Extra classes merged via `cn()`. |

---

### BaseAddonStartDirective
**Selector:** `[ply-addon-start]`
**Standalone:** true

An element positioned at the start of an input group.

*No inputs.*

---

### BaseAddonEndDirective
**Selector:** `[ply-addon-end]`
**Standalone:** true

An element positioned at the end of an input group.

*No inputs.*

---

### BaseHeadingDirective
**Selector:** `[plyHeadingText]`
**Standalone:** true

Applies standardized heading typography styles to an element.

*No inputs.*

---

### BaseListItemDirective
**Selector:** `[ply-list-item]`
**Standalone:** true

A stylistic directive that applies standardized padding, height, and hover effects for an item within a generic list view.

*No inputs.*

---

### BaseGroupButtonDirective
**Selector:** `[ply-group-button]`
**Standalone:** true

A standard group button directive applying Lussos theme styles.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'accent' \| 'transparent' \| 'default' \| string` | 'default' | The semantic visual color. |
| size | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'xxl' \| string` | 'default' | The size of the group button. |
| width | `string` | '' | Optional custom width (e.g. '100%'). |

---

### ContainerDirective
**Selector:** `[container]`
**Standalone:** true

A structural directive that forces the host element to act as a centered, max-width container. Limits width to 1280px and provides standard horizontal padding.

*No inputs.*

---

### CodeDirective
**Selector:** `[code]`
**Standalone:** true

A stylistic directive that applies monospace font and code-block styling to inline elements.

*No inputs.*

---

### DropdownMenuDirective
**Selector:** `[ply-dropdown-menu-trigger]`
**Standalone:** true

A directive that attaches a `ply-dropdown-menu` to a trigger element (like a button). Automatically handles overlay positioning, backdrop clicks, and detachment. Supports cascading submenus: put `[ply-dropdown-menu-trigger]` on a menu item with `placement="right"` (or `left`). Nested menus open on hover once the parent cascade is open; leaf clicks and outside clicks close.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| placement | `'start' \| 'end' \| 'left' \| 'right' \| 'top-start' \| 'top-end'` | 'end' | The physical placement of the dropdown relative to the trigger. |
| dropdownPanel (via `[ply-dropdown-menu-trigger]`) | `DropdownPanel<T>` | — | The reference to the `ply-dropdown-menu` component to open. |

---

### BaseDropdownMenuItemDirective
**Selector:** `[ply-dropdown-menu-item]`
**Standalone:** true

A stylistic directive that applies standard padding, hover effects, and typography to an element to make it look like a dropdown menu item.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| stayOpen | `boolean` | `false` | Keep the dropdown open after this item is clicked. |

---

### DrawerDirective
**Selector:** `[ply-drawer]`
**Standalone:** true

A directive that attaches a `ply-drawer` to a trigger element (like a button). Automatically handles the overlay backdrop and click-to-open behavior.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| placement | `'left' \| 'right' \| 'top' \| 'bottom' \| string` | 'right' | The edge of the screen to slide the drawer in from. |
| drawerPanel (via `[ply-drawer]`) | `DrawerPanel<T>` | — | The reference to the `ply-drawer` component to open. |

---

### ClickOutsideDirective
**Selector:** `[plyClickOutside]`
**Standalone:** true

A behavior directive that emits an event whenever the user clicks outside the host element's bounds. Useful for closing dropdowns, drawers, or modals.

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| plyClickOutside | `MouseEvent` | Event emitted when a click occurs outside the host element. |

---

### RevealDirective
**Selector:** `[plyReveal]`
**Standalone:** true

Reveals the host element with a fade + slide-up animation the first time it scrolls into the viewport (IntersectionObserver). Respects `prefers-reduced-motion` and is a no-op during SSR.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| revealDelay | `number` | 0 | Delay in ms before the animation starts once visible. Use for staggering grids. |
| revealTranslate | `number` | 24 | Distance in px the element travels upward while revealing. |
| revealDuration | `number` | 600 | Animation duration in ms. |

---

### ScrollToDirective
**Selector:** `[plyScrollTo]`
**Standalone:** true

A behavior directive that smoothly scrolls the window to a target element when the host is clicked.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| target (via `[plyScrollTo]`) | `string` | '' | A valid CSS selector (like an ID '#my-div') specifying the target to scroll to. |

---

### ScrollNavItemDirective
**Selector:** `[ply-scroll-nav-item]`
**Standalone:** true

A directive to link a navigation item to a specific element ID in a `ply-scroll-nav` layout. Automatically receives an active class when its target element is scrolled into view.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| elementId (via `[ply-scroll-nav-item]`) | `string` | '' | The HTML `id` of the target element in the content area to scroll to. |
| isActive | `boolean` | — | Whether this nav item is currently active. |

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| clicked | `ScrollNavItemDirective` | Emitted when the nav item is clicked. |

---

### BaseTabIconDirective
**Selector:** `[plyTabIcon]`
**Standalone:** true

A structural directive that styles a `<ply-icon>` projected inside a `ply-tab-label`. Automatically applies the correct sizing and stroke colors.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| type | `string` | 'default' | Optional variant type for the icon style. |

---

### BaseBadgeIconDirective
**Selector:** `[badge-icon]`
**Standalone:** true

Applies badge styling to an icon.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `string` | 'red' | Tailwind color name (e.g. 'red', 'blue', 'green'). |
| size | `string` | '16' | Numeric Tailwind spacing size for width and height. |

---

### BaseBadgeAddon
**Selector:** `[ply-badge-addon]`
**Standalone:** true

An addon element for a badge, typically used for small icons or indicators inside the badge.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | `string` | 'primary' | The color variant. |
| size | `string` | 'md' | The size variant. |
| width | `string` | '' | Optional custom width. |

---

### SliderDirective
**Selector:** `[plySlider]`
**Standalone:** true

A structural directive that wraps elements inside a slider/carousel, adding touch-swipe support.

**Outputs:**
| Name | Emit Type | Description |
|------|-----------|-------------|
| slideAction | `boolean` | Emitted when a swipe gesture is detected (true = prev, false = next). |

---

### AlertDismissDirective
**Selector:** `[plyAlertDismiss]`
**Standalone:** true

A directive that dismisses the parent `ply-alert` when clicked.

*No inputs or outputs.*

---

### DialogCloseDirective
**Selector:** `[ply-dialog-close]`
**Standalone:** true

A directive that automatically closes the current open dialog when the host element is clicked. Injects `DialogContext` to find the active dialog reference. Icon-only close buttons use `provideBaseUiI18n().close` unless `[ariaLabel]` is set.

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| ariaLabel | `string` | i18n.close | Optional aria-label. Falls back to `provideBaseUiI18n().close`. |
| type | `string` | 'button' | The native button type. |

---

### DrawerPanel (Interface)
**Selector:** N/A (Interface)

Interface that a drawer component must satisfy for use with the `[ply-drawer-trigger]` directive.

**Properties:**
- `templateRef: TemplateRef<T>`
- `closed: EventEmitter<void>`

---

### DropdownPanel (Interface)
**Selector:** N/A (Interface)

Interface that a dropdown component must satisfy for use with the `[ply-dropdown-menu-trigger]` directive.

**Properties:**
- `templateRef: TemplateRef<T>`
- `closed: EventEmitter<void>`

---

### DialogContainer (Interface)
**Selector:** N/A (Interface)

Interface that a dialog container must satisfy. The default implementation is `DialogContainerComponent`.

**Properties:**
- `context: DialogContext<any>`
- `container: ViewContainerRef`
- `className: string`

---

### DialogContext (Injectable)
**Selector:** N/A (Injectable)

Injected into every dynamically-opened dialog component to provide `data` and close/reject controls.

**Properties:**
- `data?: T`

**Methods:**
- `close(result?: T): void` — Closes the dialog with an optional result.
- `reject(reason?: T): void` — Rejects the dialog with an optional reason.

---

## Pipes

### FilterPipe
**Name:** `filter`
**Standalone:** true

A generic data transformation pipe that filters an array of objects or strings based on a search term. Capable of searching across multiple object properties recursively.

**Usage:**
```
{{ items | filter: searchQuery }}
{{ items | filter: searchQuery: 'name' }}
{{ items | filter: searchQuery: ['name', 'email'] }}
```

---

## Services

### ThemeService
**`providedIn: 'root'`**

A service that manages the application's light/dark mode state. SSR-safe: `localStorage` is only touched in the browser; the `dark` class is still applied to `<html>` during server render (default theme is dark).

**Properties:**
- `isDarkMode: Signal<boolean>` — Whether the current theme is dark.

**Methods:**
- `toggleTheme(): void` — Toggles between light and dark mode.
- `setTheme(theme: 'light' | 'dark'): void` — Sets the theme explicitly and persists to localStorage (browser only).

---

### SidebarService
**`providedIn: 'root'`**

A service to control the visibility state of the application sidebar.

**Properties:**
- `isOpen$: Observable<boolean>` — Observable that emits sidebar open/close state.
- `isOpen: boolean` — Current sidebar open state (synchronous getter).

**Methods:**
- `toggle(): void` — Toggles the sidebar open/closed.
- `setOpen(open: boolean): void` — Sets the sidebar open state explicitly.

---

### CurrentScreenSizeService
**`providedIn: 'root'`**

A service that monitors viewport resizing and provides the current Tailwind breakpoint (XSmall, Small, Medium, Large, XLarge).

**Properties:**
- `currentScreenSize: string` — The current screen size name.
- `size$: Observable<string>` — Observable that emits on breakpoint changes.

---

### DialogService
**`providedIn: 'root'`**

A service for dynamically rendering and managing dialogs/modals. SSR-safe: `open()` is a no-op on the server (returns `of(undefined)`). `confirm()` emits `false` on the server. Overlay hosts are appended via injected `DOCUMENT`, not the global `document`. Unit tests: `DialogHarness` with `TestbedHarnessEnvironment.documentRootLoader(fixture)`. `npx ply-ui-cli add dialog` includes `AlertDialogComponent`.

**Methods:**
- `open<T>(type: Type<any>, data?: T, className?: string, options?: { hideOnBackdropClick?: boolean; containerType?: Type<any> }): Observable<TResult | undefined>` — Opens a component dynamically inside a dialog container. Returns an Observable that emits the result when the dialog is closed. On the server, emits `undefined` immediately.
- `confirm(options: { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean }): Observable<boolean>` — Opens the built-in alert dialog. Emits `true` only when the user confirms; Cancel, Escape, and backdrop emit `false`.

---

### ToastService
**`providedIn: 'root'`**

Imperative stacked toast API with expandable deck, swipe-to-dismiss, hover pause, and a reduced-motion static list. SSR-safe: skips DOM work off the browser and creates/appends the host via injected `DOCUMENT`. Do not place `ply-toast-container` in templates. Inject with `inject(ToastService)`; do not add the service to `imports`.

**Methods:**
- `show(message: string, config?: ToastConfig): number` — Shows a toast and returns its id. `duration` defaults to 4000ms; `duration: 0` keeps it until dismissed.
- `success(message: string, config?: ToastConfig): number` — Success toast (`color: 'success'`, `icon: 'check'`).
- `error(message: string, config?: ToastConfig): number` — Error toast (`color: 'danger'`).
- `warning(message: string, config?: ToastConfig): number` — Warning toast.
- `info(message: string, config?: ToastConfig): number` — Info toast.
- `promise<T>(promiseOrFn: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>, config?: ToastConfig): Promise<T>` — Loading toast that resolves to success or error when the promise settles.
- `dismiss(id: number): void` — Dismisses a toast by id.
- `clearAll(): void` — Dismisses every visible toast.

**ToastConfig:** `color`, `duration`, `icon`, `position`, `action` (`{ label, onClick, dismiss? }`).

---

### ToggleButtonService
**`providedIn: 'root'`**

An internal service used by `ButtonGroupComponent` to coordinate toggle state among child `GroupButtonComponent` instances. You do not normally inject it directly.

---

## Animations

All animations are exported as Angular animation triggers from `animations.ts`.

| Name | Type | Description |
|------|------|-------------|
| `dropdown` | `trigger` | Slide-down fade-in animation for dropdown menus and overlays. |
| `openClose` | `trigger` | Expand/collapse animation for accordions and collapsible panels. |
| `rotate180` | `trigger` | 180-degree rotation animation, useful for chevron toggles. |
| `tabAnimation` | `trigger` | Horizontal slide animation for tab content panes. |
| `buttonSlideRightToLeft` | `trigger` | Slide-right-to-left animation for action buttons. |
| `slideLeft` | `trigger` | Slide-in from the left animation. |
| `slideRight` | `trigger` | Slide-in from the right animation. |
| `slideBottom` | `trigger` | Slide-in from the bottom animation. |
| `slideTop` | `trigger` | Slide-in from the top animation. |

---

## Utility Functions

### cn()
```
cn(...inputs: ClassValue[]): string
```

Merges Tailwind classes safely, resolving conflicts using `tailwind-merge` and `clsx`. Also exports `FOCUS_RING` (buttons), `FOCUS_RING_INSET` (compact cells), and `FOCUS_RING_WITHIN` (`ply-input-group` wrapper so addons sit inside the halo).

### provideBaseUiI18n()
```
provideBaseUiI18n(overrides?: Partial<BaseUiI18n>): EnvironmentProviders
```

Chrome-string dictionary for empty states, paginator labels, dialog close/confirm, and password show/hide. Register once in `app.config.ts`. English defaults apply when omitted. Per-instance inputs (`emptyMessage`, `emptyText`) still win. Install: `npx ply-ui-cli add i18n`.

### provideBaseUI()
```
provideBaseUI(overrides?: Partial<BaseUiConfig>): EnvironmentProviders
```

Library defaults for icon sprite paths and default icon size. Register once in `app.config.ts`. Per-instance `[path]`, `[filledPath]`, and `[size]` still win. `w-*` / `h-*` classes keep class-based sizing. Install: `npx ply-ui-cli add config`.

---

### getMenuItems() / focusMenuItem() / focusMenuItemEdge() / focusMenuItemTypeahead()
```
getMenuItems(container: ParentNode): HTMLElement[]
focusMenuItem(container: ParentNode, current: HTMLElement | null, delta: number): HTMLElement | null
focusMenuItemEdge(container: ParentNode, edge: 'first' | 'last'): HTMLElement | null
focusMenuItemTypeahead(container: ParentNode, char: string, current: HTMLElement | null): HTMLElement | null
```

Shared roving-focus helpers for `role="menuitem*"` panels (dropdown-menu, context-menu). Combobox, custom-select, and command-palette keep `aria-activedescendant` instead of moving DOM focus. Install: `npx ply-ui-cli add a11y-keyboard`.

---

## Token Exports

| Name | Type | Description |
|------|------|-------------|
| `GALLERY_SLIDER_TOKEN` | `InjectionToken` | Injection token used internally by gallery slider components to share state. |
| `RADIO_GROUP` | `InjectionToken` | Injection token for radio group coordination. |
| `BASE_UI_I18N` | `InjectionToken<BaseUiI18n>` | Chrome-string dictionary. Prefer `provideBaseUiI18n()`. |
| `BASE_UI_CONFIG` | `InjectionToken<BaseUiConfig>` | Icon sprite paths and default size. Prefer `provideBaseUI()`. |

## Type Exports

| Name | Type | Description |
|------|------|-------------|
| `CookieConsent` | `'accepted' \| 'rejected'` | Choice stored by `ply-cookie-banner` and emitted on `consentChange`. |
| `BaseUiI18n` | `interface` | Chrome-string dictionary passed to `provideBaseUiI18n()`. |
| `BaseUiConfig` | `interface` | Library defaults passed to `provideBaseUI()`. |
