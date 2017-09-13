import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: '../core/rup.html'
})

export class SignosVitalesComponent extends RUPComponent implements OnInit {
    ngOnInit() {

    }
}
