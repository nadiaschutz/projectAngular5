import { FhirModule } from './fhir.module';

describe('FhirModule', () => {
  let fhirModule: FhirModule;

  beforeEach(() => {
    fhirModule = new FhirModule();
  });

  it('should create an instance', () => {
    expect(fhirModule).toBeTruthy();
  });
});
