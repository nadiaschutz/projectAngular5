import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationScreenComponent } from './immunization-screen.component';

describe('ImmunizationScreenComponent', () => {
  let component: ImmunizationScreenComponent;
  let fixture: ComponentFixture<ImmunizationScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
