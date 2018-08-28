import { TestBed, inject } from '@angular/core/testing';

import { QuestionLoaderService } from './question-loader.service';

describe('QuestionLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionLoaderService]
    });
  });

  it('should be created', inject([QuestionLoaderService], (service: QuestionLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
