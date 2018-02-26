import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-otoemision-oido-izquierdo',
    templateUrl: 'otoemisionOidoIzquierdo.html'
})
export class OtoemisionAcusticaDeOidoIzquierdoComponent extends RUPComponent implements OnInit {
    public referenceSet = [];
    ngOnInit() {

    }
}
