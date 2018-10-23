import { TestBed, inject } from '@angular/core/testing';

import { FHIRService } from './fhir.service';

describe('FHIRService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FHIRService]
    });
  });

  it('should be created', inject([FHIRService], (service: FHIRService) => {
    expect(service).toBeTruthy();
  }));
});
