import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionItemHeaderComponent } from './accordion-item-header.component';

describe('AccordionItemHeaderComponent', () => {
  let component: AccordionItemHeaderComponent;
  let fixture: ComponentFixture<AccordionItemHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItemHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItemHeaderComponent);
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
