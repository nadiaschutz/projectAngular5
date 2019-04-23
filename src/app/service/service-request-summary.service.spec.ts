import { TestBed } from '@angular/core/testing';

import { ServiceRequestSummaryService } from './service-request-summary.service';

describe('ServiceRequestSummaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceRequestSummaryService = TestBed.get(ServiceRequestSummaryService);
    expect(service).toBeTruthy();
  });
});
