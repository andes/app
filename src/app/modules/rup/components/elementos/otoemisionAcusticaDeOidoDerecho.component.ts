import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-otoemision-oido-derecho',
    templateUrl: 'otoemisionOidoDerecho.html'
})
export class OtoemisionAcusticaDeOidoDerechoComponent extends RUPComponent implements OnInit {
    public referenceSet = [];
    ngOnInit() {

    }
}
