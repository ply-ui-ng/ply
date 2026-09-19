import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoTextComponent } from './info-text.component';

describe('InfoTextComponent', () => {
  let component: InfoTextComponent;
  let fixture: ComponentFixture<InfoTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTextComponent);
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
