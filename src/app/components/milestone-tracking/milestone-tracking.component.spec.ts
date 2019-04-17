import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneTrackingComponent } from './milestone-tracking.component';

describe('MilestoneTrackingComponent', () => {
  let component: MilestoneTrackingComponent;
  let fixture: ComponentFixture<MilestoneTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
