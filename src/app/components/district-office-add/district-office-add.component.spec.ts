import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictOfficeAddComponent } from './district-office-add.component';

describe('DistrictOfficeAddComponent', () => {
  let component: DistrictOfficeAddComponent;
  let fixture: ComponentFixture<DistrictOfficeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistrictOfficeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistrictOfficeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
