import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheulderComponent } from './scheulder.component';

describe('ScheulderComponent', () => {
  let component: ScheulderComponent;
  let fixture: ComponentFixture<ScheulderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheulderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheulderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
