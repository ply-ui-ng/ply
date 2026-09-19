import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsInputComponent } from './tags-input.component';

describe('TagsInputComponent', () => {
  let component: TagsInputComponent;
  let fixture: ComponentFixture<TagsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds a unique tag', () => {
    component.addTag('angular');
    component.addTag('angular');
    expect(component.tags()).toEqual(['angular']);
  });

  it('adds the current query on Tab', () => {
    component.query.set('signals');
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(component.tags()).toEqual(['signals']);
  });

  it('removes a tag by index', () => {
    component.addTag('one');
    component.addTag('two');
    component.removeAt(0);
    expect(component.tags()).toEqual(['two']);
  });
});
