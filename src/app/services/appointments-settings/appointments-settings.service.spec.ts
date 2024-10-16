import { TestBed } from '@angular/core/testing';

import { AppointmentsSettingsService } from './appointments-settings.service';

describe('AppointmentsSettingsService', () => {
  let service: AppointmentsSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentsSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
