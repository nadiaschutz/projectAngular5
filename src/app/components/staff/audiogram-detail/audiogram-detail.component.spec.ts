import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramDetailComponent } from './audiogram-detail.component';

describe('AudiogramDetailComponent', () => {
  let component: AudiogramDetailComponent;
  let fixture: ComponentFixture<AudiogramDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudiogramDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudiogramDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
