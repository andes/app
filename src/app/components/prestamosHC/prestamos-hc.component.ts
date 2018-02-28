import { Component, OnInit } from '@angular/core';

import { ListarSolicitudesComponent } from './solicitudes/listar-solicitudes.component';
import { PrestarHcComponent } from './solicitudes/prestar-hc.component';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html'
})

export class PrestamosHcComponent implements OnInit {
    showPrestar = false;

    ngOnInit() {

    }

    onShowPrestar($event) {
        debugger;

        this.showPrestar = true;
    }

    constructor() { }
}
