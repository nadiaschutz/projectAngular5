import { TestBed } from '@angular/core/testing';

import { ContactUsFormResolverService } from './contact-us-form-resolver.service';

describe('ContactUsFormResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContactUsFormResolverService = TestBed.get(ContactUsFormResolverService);
    expect(service).toBeTruthy();
  });
});
