import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServReqMainComponent } from './serv-req-main.component';

describe('ServReqMainComponent', () => {
  let component: ServReqMainComponent;
  let fixture: ComponentFixture<ServReqMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServReqMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServReqMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
