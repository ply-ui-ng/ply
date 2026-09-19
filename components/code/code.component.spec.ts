import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CodeComponent } from './code.component';

const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

@Component({
  imports: [CodeComponent],
  template: `
    <ply-code language="HTML" [showCode]="true">
      <pre>{{ snippet() }}</pre>
    </ply-code>
  `,
})
class CodeHostComponent {
  readonly snippet = signal('<ply-badge color="primary">Badge</ply-badge>');
}

describe('CodeComponent', () => {
  let component: CodeComponent;
  let fixture: ComponentFixture<CodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});

describe('CodeComponent live snippets', () => {
  let fixture: ComponentFixture<CodeHostComponent>;
  let root: HTMLElement;
  const copied: string[] = [];

  const visibleText = () =>
    root.querySelector('pre[data-ply-code-highlighted]')?.textContent ?? '';

  beforeEach(async () => {
    copied.length = 0;
    await TestBed.configureTestingModule({
      imports: [CodeHostComponent],
      providers: [
        provideNoopAnimations(),
        { provide: Clipboard, useValue: { copy: (text: string) => copied.push(text) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeHostComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    await flush();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('highlights the projected snippet', () => {
    expect(visibleText()).toContain('ply-badge');
    expect(root.querySelector('pre[data-ply-code-highlighted] span')).toBeTruthy();
  });

  it('keeps the projected node attached (hidden) so later updates are not lost', () => {
    const source = root.querySelector(
      'ply-code pre:not([data-ply-code-highlighted])',
    ) as HTMLElement | null;
    expect(source).toBeTruthy();
    expect(source?.style.display).toBe('none');
  });

  it('repaints when the projected snippet changes', async () => {
    expect(visibleText()).toContain('color="primary"');

    fixture.componentInstance.snippet.set('<ply-badge color="danger" size="xl">Badge</ply-badge>');
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();

    expect(visibleText()).toContain('color="danger"');
    expect(visibleText()).toContain('size="xl"');
    expect(visibleText()).not.toContain('color="primary"');
  });

  it('copies the current snippet, not the first one', async () => {
    fixture.componentInstance.snippet.set('<ply-badge color="success">Badge</ply-badge>');
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();

    (root.querySelector('[aria-label="Copy to clipboard"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(copied).toHaveLength(1);
    expect(copied[0]).toContain('color="success"');
  });
});
