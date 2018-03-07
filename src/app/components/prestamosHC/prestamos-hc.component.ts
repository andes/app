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
<<<<<<< HEAD
    onCarpeta(event){
        console.log('onCarpeta', event);
    }
=======

    onCancelPrestar(event) {
        this.showPrestar = event;
    }

    onCancelDevolver(event) {
        this.showDevolver = event;
    }

>>>>>>> d3de0bfccc3323a76782bbc0e4ce0642608c62c9
    constructor() { }
}
