import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDepartmentComponent } from './client-department.component';

describe('ClientDepartmentComponent', () => {
  let component: ClientDepartmentComponent;
  let fixture: ComponentFixture<ClientDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
