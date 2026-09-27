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

@Component({
  imports: [CodeComponent],
  template: `
    <ply-code language="Bash" [showCode]="open()" [collapsible]="false">
      <pre>npx ply-ui-cli init</pre>
    </ply-code>
  `,
})
class FixedCodeHostComponent {
  readonly open = signal(true);
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

  it('labels the language without adding a heading to the page outline', () => {
    expect(root.querySelector('ply-code h1, ply-code h2, ply-code h3, ply-code h4')).toBeNull();
    expect(root.querySelector('ply-code span')?.textContent?.trim()).toBe('HTML');
  });

  it('shows the show/hide toggle by default', () => {
    expect(root.querySelector('[aria-label="Hide code"]')).toBeTruthy();
  });
});

describe('CodeComponent without a toggle', () => {
  let fixture: ComponentFixture<FixedCodeHostComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedCodeHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FixedCodeHostComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    await flush();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('keeps the snippet open with only the copy button', () => {
    expect(root.querySelector('[aria-label="Hide code"]')).toBeNull();
    expect(root.querySelector('[aria-label="Copy to clipboard"]')).toBeTruthy();
    expect(root.querySelector('pre[data-ply-code-highlighted]')?.textContent).toContain('npx ply-ui-cli init');
  });

  it('still offers the toggle when the block starts collapsed', () => {
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    expect(root.querySelector('[aria-label="Show code"]')).toBeTruthy();
  });

  it('scrolls long lines instead of wrapping them', () => {
    const highlighted = root.querySelector('pre[data-ply-code-highlighted]') as HTMLElement;
    expect(highlighted.className).toContain('whitespace-pre');
    expect(highlighted.className).not.toContain('whitespace-pre-wrap');
    expect(highlighted.className).toContain('overflow-x-auto');
  });
});
