import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewServiceRequestComponent } from './edit-new-service-request.component';

describe('EditNewServiceRequestComponent', () => {
  let component: EditNewServiceRequestComponent;
  let fixture: ComponentFixture<EditNewServiceRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNewServiceRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNewServiceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
