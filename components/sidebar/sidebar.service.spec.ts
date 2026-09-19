import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start open by default', () => {
    expect(service.isOpen()).toBe(true);
  });

  it('should toggle open state', () => {
    service.toggle();
    expect(service.isOpen()).toBe(false);
    service.toggle();
    expect(service.isOpen()).toBe(true);
  });

  it('should set open state explicitly', () => {
    service.setOpen(false);
    expect(service.isOpen()).toBe(false);
    service.setOpen(true);
    expect(service.isOpen()).toBe(true);
  });
});
