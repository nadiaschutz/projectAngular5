import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewServiceRequestNoClientComponent } from './new-service-request-no-client.component';

describe('NewServiceRequestNoClientComponent', () => {
  let component: NewServiceRequestNoClientComponent;
  let fixture: ComponentFixture<NewServiceRequestNoClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewServiceRequestNoClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewServiceRequestNoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
