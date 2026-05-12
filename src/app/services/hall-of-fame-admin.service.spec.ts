import { TestBed } from '@angular/core/testing';

import { HallOfFameAdminService } from './hall-of-fame-admin.service';

describe('HallOfFameAdminService', () => {
  let service: HallOfFameAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HallOfFameAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
