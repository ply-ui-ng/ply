import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogBodyComponent } from './dialog-body.component';

describe('DialogBodyComponent', () => {
  let component: DialogBodyComponent;
  let fixture: ComponentFixture<DialogBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBodyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogBodyComponent);
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
