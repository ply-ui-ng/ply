import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
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

  it('treats a numeric width attribute as pixels', () => {
    fixture.componentRef.setInput('width', '400');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.width).toBe('400px');
  });

  it('appends px to a numeric width input', () => {
    fixture.componentRef.setInput('width', 400);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.width).toBe('400px');
  });

  it('keeps CSS width strings that already have units', () => {
    fixture.componentRef.setInput('width', '48rem');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.width).toBe('48rem');
  });

  it('does not stretch to 100% when width is omitted', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.style.width).toBe('');
  });
});
