import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHomeScreenComponent } from './admin-home-screen.component';

describe('AdminHomeScreenComponent', () => {
    let component: AdminHomeScreenComponent;
    let fixture: ComponentFixture<AdminHomeScreenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AdminHomeScreenComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminHomeScreenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
