export type AlertColor = '' | 'primary' | 'success' | 'danger' | 'accent' | 'warning';
export type AlertVariant = 'soft' | 'solid' | 'outline';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'active' | 'inactive';
export type BadgeColor =
  | 'primary'
  | 'danger'
  | 'success'
  | 'accent'
  | 'warning'
  | 'default'
  | 'transparent'
  | 'slate-light'
  | 'primary-light'
  | 'danger-light'
  | 'success-light'
  | 'accent-light'
  | 'warning-light';
export type BadgeSize = 'sm' | 'md' | 'default' | 'lg' | 'xl';
export type BadgeShape = 'rectangular' | 'circle' | 'rounded' | 'pill';
export type CheckboxColor = 'primary' | 'danger' | 'success' | 'accent' | 'warning';
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | string;
export type FileUploadVariant = 'input' | 'button' | 'dropzone' | 'icon';
export type FileUploadButtonColor = 'primary' | 'danger' | 'success' | 'warning' | 'accent' | '';
export type FileUploadButtonVariant = 'solid' | 'stroked';
export type ProgressColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent';
export type ProgressSize = 'sm' | 'md' | 'default' | 'lg' | 'xl';

/** Semantic color for a meter-group segment (same palette as progress). */
export type MeterGroupColor = ProgressColor;

/** Size / thickness of the meter-group bar. */
export type MeterGroupSize = ProgressSize;

/** A single segment in a {@link MeterGroupComponent}. */
export interface MeterGroupItem {
  /** Display label for the legend. */
  label: string;
  /** Absolute value used to compute width share of the bar. */
  value: number;
  /** Segment color. Defaults by cycling the palette when omitted. */
  color?: MeterGroupColor;
  /** Optional `ply-icon` name shown in the legend. */
  icon?: string;
}
export type QuoteVariant = 'default' | 'border-left' | 'icon-top' | 'avatar-left';
export type RadioColor = 'primary' | 'danger' | 'success' | 'accent' | 'warning';
export type SpinnerColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'inverted';
export type SpinnerSize = 'sm' | 'md' | 'default' | 'lg' | 'xl';
export type ToggleColor = 'primary' | 'danger' | 'success' | 'accent' | 'warning';
export type ToggleSize = 'sm' | 'md' | 'default' | 'lg';
export type ToggleShape = 'rounded' | 'square' | 'smooth';
export type GroupButtonColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'transparent' | 'default';
export type GroupButtonSize = 'sm' | 'md' | 'default' | 'lg' | 'xl' | 'xxl';
export type ButtonColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'
  | 'white'
  | 'black'
  | 'default'
  | 'secondary'
  | 'dark'
  | 'slate'
  | 'transparent';
export type ButtonSize = 'sm' | 'default' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconButtonColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'
  | 'white'
  | 'black'
  | 'default'
  | 'secondary'
  | 'inverted'
  | 'transparent';
export type IconButtonSize = 'sm' | 'md' | 'default' | 'lg' | 'xl' | 'xxl';
export type IconStrokedButtonColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'
  | 'white'
  | 'black'
  | 'transparent'
  | 'default';
export type IconStrokedButtonSize = 'sm' | 'md' | 'default' | 'lg' | 'xl' | 'xxl';

/** Force sidenav chrome for demos/previews; `auto` follows the `lg` breakpoint. */
export type SidenavLayoutMode = 'auto' | 'mobile' | 'desktop';

/** Force shell chrome for demos/previews; `auto` follows viewport breakpoints. */
export type ShellLayoutMode = 'auto' | 'mobile' | 'desktop';

/**
 * `page` = marketing / content shell (hamburger drawer under 991px, no mini).
 * `dashboard` = app shell with expanded / mini / mobile rail.
 */
export type ShellMode = 'page' | 'dashboard';

/** Which edge a `ply-shell` sidebar occupies. */
export type ShellSide = 'left' | 'right';

/** @deprecated Use {@link ShellSide}. */
export type PageShellSide = ShellSide;

/** Dashboard rail layout derived from breakpoints. */
export type ShellRailMode = 'expanded' | 'mini' | 'mobile';
export type LinkColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'default' | 'secondary';
export type LinkSize = 'sm' | 'md' | 'default' | 'lg' | 'xl';
export type StrokedButtonColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'accent'
  | 'white'
  | 'black'
  | 'default'
  | 'secondary'
  | 'dark'
  | 'slate'
  | 'transparent';
export type StrokedButtonSize = 'sm' | 'md' | 'default' | 'lg' | 'xl' | 'xxl';
export type DropdownPlacement = 'start' | 'end' | 'left' | 'right' | 'top-start' | 'top-end';

/** Tooltip position relative to the host (use `tooltipPlacement` in templates). */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';

export type ChipColor = '' | 'primary' | 'success' | 'danger' | 'warning' | 'accent';
export type ChipSize = 'sm' | 'md' | 'default' | 'lg';

export type ToastColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/** Optional button rendered on a toast. `dismiss` defaults to true after click. */
export interface ToastAction {
  label: string;
  onClick: () => void;
  dismiss?: boolean;
}

/** Option row for {@link ComboboxComponent}. */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

/** 12-hour or 24-hour clock for {@link TimePickerComponent}. */
export type TimePickerHourCycle = '12' | '24';

/** Role of a message in {@link ChatComponent}. */
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

/** Lifecycle of a tool-call row in {@link ChatComponent}. */
export type ChatToolStatus = 'pending' | 'running' | 'done' | 'error';

/** A single turn in {@link ChatComponent}. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  name?: string;
  avatarUrl?: string;
  streaming?: boolean;
  toolName?: string;
  toolStatus?: ChatToolStatus;
}

export type SliderColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent';

/** Selected span for `ply-dual-range-slider` (start ≤ end). */
export interface DualRangeValue { start: number; end: number }

/** Panel layout for `ply-splitter`. */
export type SplitterOrientation = 'horizontal' | 'vertical';

export type TableSortDirection = 'asc' | 'desc' | '';
export interface TableColumn {
  /** Property on each row. Default cells interpolate `row[key]`; override with `plyTableCell`. */
  key: string;
  label: string;
  sortable?: boolean;
  /** Initial CSS width (`120px`, `20%`). Used as the start width when the table is resizable. */
  width?: string;
  /** Minimum CSS width while dragging a resize handle. Defaults to `80px`. */
  minWidth?: string;
  /** When the table is `resizable`, set `false` to lock this column. */
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}

/** Page change from a data table paginator. */
export interface DataTablePageChange {
  page: number;
  pageSize: number;
}

/** Sort change from a data header. */
export interface DataTableSortChange {
  key: string;
  direction: TableSortDirection;
}

// New component types
export type TimelineColor ='primary' | 'success' | 'danger' | 'warning' | 'accent' | 'default';
export type StatCardColor = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'default';
/** Classic = icon-left KPI tile; metric = Motif-style vertical stack with delta pill + sparkline. */
export type StatCardVariant = 'classic' | 'metric';
export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

/** 'auto' fits content, 'half'/'full' are viewport fractions, or pass a custom CSS height value (e.g. '420px'). */
export type BottomSheetHeight = 'auto' | 'half' | 'full' | string;

/** Corner placement for scroll-top / scroll-bottom FAB buttons. */
export type ScrollButtonPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/** Direction actions expand from a speed-dial trigger. */
export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';

/** Corner placement for a fixed/absolute speed dial. */
export type SpeedDialPosition = ScrollButtonPosition;

export type { ScrollContainerTarget } from '../scroll-container/scroll-container';

/** Stored choice from {@link CookieBannerComponent}. */
export type CookieConsent = 'accepted' | 'rejected';

/** Semantic color for {@link ChartComponent} series and segments. */
export type ChartColor = SliderColor;

/** Supported chart visualizations in {@link ChartComponent}. */
export type ChartType = 'line' | 'bar' | 'donut' | 'sparkline';

/** A single data point for {@link ChartComponent}. */
export interface ChartDataPoint {
  /** Category label (x-axis, legend, or tooltip). */
  label: string;
  /** Numeric value. */
  value: number;
  /** Optional per-point color override. */
  color?: ChartColor;
}
