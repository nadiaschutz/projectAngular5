import { TestBed } from '@angular/core/testing';

import { NewServReqService } from './new-serv-req.service';

describe('NewServReqService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NewServReqService = TestBed.get(NewServReqService);
    expect(service).toBeTruthy();
  });
});
