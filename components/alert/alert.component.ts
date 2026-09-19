import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
  ChangeDetectionStrategy
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { AlertColor, AlertVariant } from '../types';
import { cn } from '../tw-merge/tw-merge';

/**
 * A highly configurable alert component for displaying important messages.
 *
 * @example
 * <ply-alert color="danger" variant="soft" [close]="true" (closed)="onClose()">
 *   Something went wrong!
 * </ply-alert>
 */
@Component({
  selector: 'ply-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './alert.component.html',
  host: {
    role: 'alert',
    '[class]': 'hostCls()'
}
})
export class AlertComponent implements OnInit, OnDestroy {
  readonly extraClass = input('', { alias: 'class' });
  readonly color      = input<AlertColor>('');
  readonly variant    = input<AlertVariant>('soft');
  readonly icon       = input<string | undefined>(undefined);
  readonly close      = input(false, { transform: booleanAttribute });
  readonly duration   = input(0);

  readonly closed = output<void>();

  private readonly _isClosed = signal(false);
  readonly isClosed = this._isClosed.asReadonly();

  protected readonly hostCls = computed(() =>
    cn('block', this.extraClass())
  );

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    if (this.duration() > 0) {
      this.timer = setTimeout(() => this.handleClose(), this.duration());
    }
  }

  ngOnDestroy() { if (this.timer) clearTimeout(this.timer); }

  handleClose() {
    if (this._isClosed()) return;
    this._isClosed.set(true);
    this.closed.emit();
  }

  readonly alertClasses = computed(() => {
    const base = 'flex flex-col rounded-xl text-sm p-4 gap-3 not-prose border transition-all duration-200';
    const colorMap: Record<AlertVariant, Record<AlertColor, string>> = {
      soft: {
        '': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700',
        primary: 'bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800/70',
        success: 'bg-green-50 text-green-800 border-green-100 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800/70',
        danger:  'bg-red-50 text-red-800 border-red-100 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800/70',
        accent:  'bg-purple-50 text-purple-800 border-purple-100 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800/70',
        warning: 'bg-orange-50 text-orange-800 border-orange-100 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800/70'
},
      solid: {
        '': 'bg-slate-600 text-white border-slate-700 dark:bg-slate-700 dark:border-slate-600',
        primary: 'bg-blue-600 text-white border-blue-700',
        success: 'bg-green-600 text-white border-green-700',
        danger:  'bg-red-600 text-white border-red-700',
        accent:  'bg-purple-600 text-white border-purple-700',
        warning: 'bg-orange-600 text-white border-orange-700'
},
      outline: {
        '': 'bg-transparent text-slate-800 border-slate-300 dark:text-slate-200 dark:border-slate-600',
        primary: 'bg-transparent text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800',
        success: 'bg-transparent text-green-600 border-green-300 dark:text-green-400 dark:border-green-800',
        danger:  'bg-transparent text-red-600 border-red-300 dark:text-red-400 dark:border-red-800',
        accent:  'bg-transparent text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-800',
        warning: 'bg-transparent text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-800'
}
};
    return `${base} ${colorMap[this.variant()][this.color()]}`;
  });

  readonly iconClasses = computed(() => {
    const base = 'w-6 h-6 min-w-6';
    if (this.variant() === 'solid') return `${base} stroke-white`;
    const colorMap: Record<AlertColor, string> = {
      '': 'stroke-slate-700 dark:stroke-slate-300',
      primary: 'stroke-blue-600 dark:stroke-blue-400',
      success: 'stroke-green-600 dark:stroke-green-400',
      danger:  'stroke-red-600 dark:stroke-red-400',
      accent:  'stroke-purple-600 dark:stroke-purple-400',
      warning: 'stroke-orange-600 dark:stroke-orange-400'
};
    return `${base} ${colorMap[this.color()]}`;
  });

  readonly closeIconClasses = computed(() => {
    // Replace the base w-6 with w-4 for the close button icon
    return this.iconClasses().replace('w-6 h-6 min-w-6', 'w-4 h-4 min-w-4');
  });

  readonly closeButtonClasses = computed(() => {
    const base = 'w-7 h-7 min-w-7 flex justify-center items-center rounded-md -mr-2 -mt-2 transition-colors duration-200 cursor-pointer';
    if (this.variant() === 'solid') return `${base} hover:bg-white/20`;
    const hoverMap: Record<AlertColor, string> = {
      '': 'hover:bg-slate-200 dark:hover:bg-slate-700',
      primary: 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
      success: 'hover:bg-green-100 dark:hover:bg-green-900/40',
      danger:  'hover:bg-red-100 dark:hover:bg-red-900/40',
      accent:  'hover:bg-purple-100 dark:hover:bg-purple-900/40',
      warning: 'hover:bg-orange-100 dark:hover:bg-orange-900/40'
};
    return `${base} ${hoverMap[this.color()]}`;
  });
}
