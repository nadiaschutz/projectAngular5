import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOnsubmitSummaryComponent } from './client-onsubmit-summary.component';

describe('ClientOnsubmitSummaryComponent', () => {
  let component: ClientOnsubmitSummaryComponent;
  let fixture: ComponentFixture<ClientOnsubmitSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientOnsubmitSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientOnsubmitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
