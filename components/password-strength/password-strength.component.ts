import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ply-password-strength',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './password-strength.component.html'
})
export class PasswordStrengthComponent {
  readonly password = input<string>('');

  protected readonly score = computed(() => {
    const pwd = this.password() || '';
    let s = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^a-zA-Z\d]/.test(pwd)) s++;
    return s;
  });

  protected getSegmentColor(segment: number): string {
    const s = this.score();
    if (segment > s) return 'bg-slate-200 dark:bg-slate-700'; // inactive
    
    switch (s) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-slate-200 dark:bg-slate-700';
    }
  }

  protected readonly labelText = computed(() => {
    switch (this.score()) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  });

  protected readonly labelColor = computed(() => {
    switch (this.score()) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-600 dark:text-yellow-500';
      case 4: return 'text-green-500';
      default: return 'text-slate-500';
    }
  });
}
