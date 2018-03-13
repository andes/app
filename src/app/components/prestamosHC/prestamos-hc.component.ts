import { Component, OnInit } from '@angular/core';

import { ListarSolicitudesComponent } from './solicitudes/listar-solicitudes.component';
import { PrestarHcComponent } from './solicitudes/prestar-hc.component';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html'
})

export class PrestamosHcComponent implements OnInit {

    prestar: any;

    listaCarpetas: any;

    ngOnInit() {

    }

    onCarpetaPrestada(event) {
        this.prestar = event;
    }

    constructor() { }
}
