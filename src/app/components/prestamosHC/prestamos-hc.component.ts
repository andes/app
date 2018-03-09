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

    listaCarpetas: any;

    ngOnInit() {

    }

    onShowPrestar(event) {
        this.showDevolver = false;
        this.showPrestar = true;
    }

    onShowDevolver(event) {
        this.showPrestar = false;
        this.showDevolver = true;
    }

    onCarpetaPrestada(event) {
        this.prestar = event;
    }

    onCarpeta(event) {
        debugger;
        this.listaCarpetas = event;
    }

    onCancelPrestar(event) {
        this.showPrestar = event;
    }

    onCancelDevolver(event) {
        this.showDevolver = event;
    }

    constructor() { }
}
