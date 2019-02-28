import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramScreenComponent } from './audiogram-screen.component';

describe('AudiogramScreenComponent', () => {
  let component: AudiogramScreenComponent;
  let fixture: ComponentFixture<AudiogramScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudiogramScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudiogramScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
