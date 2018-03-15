import { Component, OnInit } from '@angular/core';

import { ListarSolicitudesComponent } from './solicitudes/listar-solicitudes.component';
import { PrestarHcComponent } from './solicitudes/prestar-hc.component';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html',
    styleUrls: ['./prestamos-hc.scss']
})

export class PrestamosHcComponent implements OnInit {

    recargaPrestamos: any = false;
    recargaSolicitudes: any = false;
    listaCarpetas: any;

    constructor() { }

    ngOnInit() {

    }

    recargarPrestamos(event) {
        this.recargaPrestamos = true;
    }

    recargarSolicitudes(event) {
        this.recargaSolicitudes = true;
    }
}
