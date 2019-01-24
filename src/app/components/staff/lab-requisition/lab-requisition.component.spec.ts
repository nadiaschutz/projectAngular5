import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabRequisitionComponent } from './lab-requisition.component';

describe('LabRequisitionComponent', () => {
  let component: LabRequisitionComponent;
  let fixture: ComponentFixture<LabRequisitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabRequisitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
