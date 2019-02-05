import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: '../core/rup.html'
})
@RupElement('SignosVitalesComponent')
export class SignosVitalesComponent extends RUPComponent implements OnInit {
    ngOnInit() {

    }
}
