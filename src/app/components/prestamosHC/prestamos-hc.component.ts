import { Component, OnInit } from '@angular/core';

import { ListarSolicitudesComponent } from './solicitudes/listar-solicitudes.component';
import { PrestarHcComponent } from './solicitudes/prestar-hc.component';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html'
})

export class PrestamosHcComponent implements OnInit {
    showPrestar = false;
    showDevolver = false;

    prestar: any;

    ngOnInit() {

    }

    onShowPrestar(event) {
        debugger;
        this.showDevolver = false;
        this.showPrestar = true;
    }

    onShowDevolver(event) {
        debugger;
        this.showPrestar = false;
        this.showDevolver = true;
    }

    onCarpetaPrestada(event) {
        debugger;
        this.prestar = event;
    }

    onListaCarpeta(event) {
        debugger;
    }

    constructor() { }
}
