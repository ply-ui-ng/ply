import { describe, expect, it } from 'vitest';
import { addOutput, doctorOutput, parseAddReport, parseDoctorChecks, parseUpdateFiles, updateOutput } from './cli-report';

describe('CLI report parsers', () => {
  it('reads doctor check lines and skips the summary', () => {
    const checks = parseDoctorChecks(`✔ ply-ui.json: Found
⚠ Tailwind: @source is missing
✖ Angular CDK: Not installed
3 checks: 1 passed, 1 warning, 1 error.
`);
    expect(doctorOutput.safeParse({ ok: true, checks, stdout: 'kept', stderr: undefined }).success).toBe(true);
    expect(checks).toEqual([
      { name: 'ply-ui.json', status: 'ok', message: 'Found' },
      { name: 'Tailwind', status: 'warn', message: '@source is missing' },
      { name: 'Angular CDK', status: 'error', message: 'Not installed' },
    ]);
  });

  it('reads the exact install command and package names', () => {
    const report = parseAddReport(`\nInstall missing npm dependencies:\n  npm install @angular/cdk lucide-angular\n`);
    expect(report.installCommand).toBe('npm install @angular/cdk lucide-angular');
    expect(report.missingPackages).toEqual(['@angular/cdk', 'lucide-angular']);
    expect(addOutput.safeParse({ ok: true, ...report, confirmation: 'accepted', stderr: undefined }).success).toBe(true);
  });

  it('reads one update result per file line', () => {
    const files = parseUpdateFiles(`  ↑ button/button.component.ts
  + button/extra.ts
  ↓ dialog/dialog.component.ts  (reverted local edits; upstream unchanged)
  = tabs/tabs.component.ts  (kept your version)
  ⋈ alert/alert.component.html  (3-way merge, clean)
  ⚠ card/card.component.ts  (3-way merge left conflict markers — edit the file)
  ⇄ menu/menu.component.ts.upstream  (merge by hand — your file was left untouched)
`);
    expect(files.map((file) => file.action)).toEqual([
      'updated',
      'added',
      'reverted',
      'kept',
      'merged',
      'merge-conflict',
      'saved-aside',
    ]);
    expect(files[2].detail).toContain('reverted local edits');
    expect(files[3].path).toBe('tabs/tabs.component.ts');
    expect(updateOutput.safeParse({ ok: true, files, confirmation: 'declined', stderr: undefined }).success).toBe(true);
  });
});
