import { TestBed, inject } from '@angular/core/testing';

import { AdminHomeScreenService } from './admin-home-screen.service';

describe('AdminHomeScreenService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AdminHomeScreenService]
        });
    });

    it('should be created', inject([AdminHomeScreenService], (service: AdminHomeScreenService) => {
        expect(service).toBeTruthy();
    }));
});
