import { TestBed, inject } from '@angular/core/testing';

import { QrequestService } from './qrequest.service';

describe('QrequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QrequestService]
    });
  });

  it('should be created', inject([QrequestService], (service: QrequestService) => {
    expect(service).toBeTruthy();
  }));
});
