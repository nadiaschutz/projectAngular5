import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsohpRegionalComponent } from './psohp-regional.component';

describe('PsohpRegionalComponent', () => {
  let component: PsohpRegionalComponent;
  let fixture: ComponentFixture<PsohpRegionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsohpRegionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsohpRegionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
