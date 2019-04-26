import { TestBed } from '@angular/core/testing';

import { RegionalOfficesResolverService } from './regional-offices-resolver.service';

describe('RegionalOfficesResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RegionalOfficesResolverService = TestBed.get(RegionalOfficesResolverService);
    expect(service).toBeTruthy();
  });
});
