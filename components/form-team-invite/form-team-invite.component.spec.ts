import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTeamInviteComponent } from './form-team-invite.component';

describe('FormTeamInviteComponent', () => {
  let component: FormTeamInviteComponent;
  let fixture: ComponentFixture<FormTeamInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTeamInviteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormTeamInviteComponent);
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
