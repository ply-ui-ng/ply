import { ApplicationRef, Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountdownComponent } from './countdown.component';

@Component({
  standalone: true,
  imports: [CountdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ply-countdown [targetDate]="target" />`,
})
class HostComponent {
  target = new Date(Date.now() + 86_400_000);
}

describe('CountdownComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let countdown: CountdownComponent;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    countdown = fixture.debugElement.children[0].componentInstance as CountdownComponent;
  });

  afterEach(() => {
    fixture?.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(countdown).toBeTruthy();
  });

  it('should compute remaining time on first paint (not stuck at zeros)', () => {
    const t = countdown.time();
    expect(t.days).toBe(1);
    expect(t.total).toBeGreaterThan(0);
  });

  it('should start the client ticker after the first render', () => {
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });

  it('should emit finished when the target is in the past', () => {
    const pastFixture = TestBed.createComponent(CountdownComponent);
    pastFixture.componentRef.setInput('targetDate', new Date(Date.now() - 1_000));
    const finished: void[] = [];
    pastFixture.componentInstance.finished.subscribe(() => finished.push(undefined));
    pastFixture.detectChanges();

    expect(pastFixture.componentInstance.done()).toBe(true);
    expect(finished.length).toBe(1);
    expect(pastFixture.componentInstance.time().total).toBe(0);
    pastFixture.destroy();
  });
});
