import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render classic content by default', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', '$48,295');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Revenue');
    expect(fixture.nativeElement.textContent).toContain('$48,295');
    expect(fixture.nativeElement.querySelector('svg[role="img"]')).toBeNull();
  });

  it('should format metric delta as a signed percent pill', () => {
    fixture.componentRef.setInput('variant', 'metric');
    fixture.componentRef.setInput('label', 'Net revenue');
    fixture.componentRef.setInput('value', '$248,910');
    fixture.componentRef.setInput('delta', 0.062);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('+6.2%');
    expect(fixture.nativeElement.textContent).toContain('Net revenue');
  });

  it('should render a sparkline polyline when series is provided in metric mode', () => {
    fixture.componentRef.setInput('variant', 'metric');
    fixture.componentRef.setInput('label', 'Orders');
    fixture.componentRef.setInput('value', '1,284');
    fixture.componentRef.setInput('delta', -0.077);
    fixture.componentRef.setInput('series', [12, 14, 13, 16, 11]);
    fixture.componentRef.setInput('caption', 'vs previous period');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg[role="img"]') as SVGElement | null;
    const polyline = fixture.nativeElement.querySelector('polyline') as SVGPolylineElement | null;
    expect(svg).toBeTruthy();
    expect(polyline?.getAttribute('points')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('−7.7%');
    expect(fixture.nativeElement.textContent).toContain('vs previous period');
  });
});
