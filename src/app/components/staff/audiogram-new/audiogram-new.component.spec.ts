import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramNewComponent } from './audiogram-new.component';

describe('AudiogramNewComponent', () => {
  let component: AudiogramNewComponent;
  let fixture: ComponentFixture<AudiogramNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudiogramNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudiogramNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
