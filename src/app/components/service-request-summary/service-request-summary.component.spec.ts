import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRequestSummaryComponent } from './service-request-summary.component';

describe('ServiceRequestSummaryComponent', () => {
  let component: ServiceRequestSummaryComponent;
  let fixture: ComponentFixture<ServiceRequestSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceRequestSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceRequestSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
