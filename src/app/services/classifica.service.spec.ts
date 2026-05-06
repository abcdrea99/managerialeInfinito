import { TestBed } from '@angular/core/testing';

import { ClassificaService } from './classifica.service';

describe('ClassificaService', () => {
  let service: ClassificaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
