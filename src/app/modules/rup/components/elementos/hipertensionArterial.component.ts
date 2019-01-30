import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-hipertensionArterial',
    templateUrl: '../core/rup.html'
})
@RupElement()
export class HipertensionArterialComponent extends RUPComponent implements OnInit {
    ngOnInit() {

    }
}
