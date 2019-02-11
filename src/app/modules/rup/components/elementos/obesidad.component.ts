import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-obesidad',
    templateUrl: '../core/rup.html'
})
@RupElement('ObesidadComponent')
export class ObesidadComponent extends RUPComponent implements OnInit {
    ngOnInit() {

    }
}
