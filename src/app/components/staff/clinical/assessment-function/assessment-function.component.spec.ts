import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentFunctionComponent } from './assessment-function.component';

describe('AssessmentFunctionComponent', () => {
  let component: AssessmentFunctionComponent;
  let fixture: ComponentFixture<AssessmentFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentFunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
