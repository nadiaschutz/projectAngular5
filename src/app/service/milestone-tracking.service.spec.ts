import { TestBed } from '@angular/core/testing';

import { MilestoneTrackingService } from './milestone-tracking.service';

describe('MilestoneTrackingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MilestoneTrackingService = TestBed.get(MilestoneTrackingService);
    expect(service).toBeTruthy();
  });
});
