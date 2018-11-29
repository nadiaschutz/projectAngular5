import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewServceRequestComponent } from './edit-new-servce-request.component';

describe('EditNewServceRequestComponent', () => {
  let component: EditNewServceRequestComponent;
  let fixture: ComponentFixture<EditNewServceRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNewServceRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNewServceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
