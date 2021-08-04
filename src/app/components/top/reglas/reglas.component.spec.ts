import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglasComponent } from './reglas.component';

describe('ReglasComponent', () => {
    let component: ReglasComponent;
    let fixture: ComponentFixture<ReglasComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ReglasComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReglasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
