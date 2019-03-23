import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewClientDepartmentComponent } from './add-new-client-department.component';

describe('AddNewClientDepartmentComponent', () => {
  let component: AddNewClientDepartmentComponent;
  let fixture: ComponentFixture<AddNewClientDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewClientDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewClientDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
