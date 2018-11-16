import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictOfficeComponent } from './district-office.component';

describe('DistrictOfficeComponent', () => {
  let component: DistrictOfficeComponent;
  let fixture: ComponentFixture<DistrictOfficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistrictOfficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistrictOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
