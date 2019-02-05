import { TestBed } from '@angular/core/testing';

import { DepartmentListResolverService } from './department-list-resolver.service';

describe('DepartmentListResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DepartmentListResolverService = TestBed.get(DepartmentListResolverService);
    expect(service).toBeTruthy();
  });
});
