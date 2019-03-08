import { TestBed } from '@angular/core/testing';

import { AudiogramService } from './audiogram.service';

describe('AudiogramService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AudiogramService = TestBed.get(AudiogramService);
    expect(service).toBeTruthy();
  });
});
