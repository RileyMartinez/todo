import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneTimeLoginComponent } from './one-time-login.component';

describe('OneTimeLoginComponent', () => {
    let component: OneTimeLoginComponent;
    let fixture: ComponentFixture<OneTimeLoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OneTimeLoginComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OneTimeLoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
