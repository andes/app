import { Component, OnInit } from '@angular/core';
import { ListaHojatrabajoComponent } from './../lista-hojatrabajo/lista-hojatrabajo.component';
import { EstadoHojaTrabajo } from './../../../../../../utils/enumerados';

@Component({
    selector: 'gestor-hojatrabajo',
    templateUrl: './gestor-hojatrabajo.html'
})
export class GestorHojatrabajoComponent implements OnInit {

    // Propiedades
    public accionIndex = 0;
    public modo = '';

    // Constructor
    constructor() { }

    ngOnInit() {

    }

    cambio($event) {
        this.accionIndex = $event;
        if ($event === 0) {
            this.modo = 'impresion';
        } else if ($event === 1) {
            this.modo = 'analisis';
        }
        // this.refreshSelection();
    }


    guardarHoja() {
        console.log('guardar hoja', new Date);
    }

    agregarHoja() {
        console.log('agregar hoja', new Date);
    }

    volverLista() {
        console.log('guardar hoja', new Date);
    }
}
