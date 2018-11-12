import { Component, OnInit } from '@angular/core';
import { ListaHojatrabajoComponent } from './../lista-hojatrabajo/lista-hojatrabajo.component';

@Component({
    selector: 'gestor-hojatrabajo',
    templateUrl: './gestor-hojatrabajo.html'
})
export class GestorHojatrabajoComponent implements OnInit {

    constructor() { }

    ngOnInit() {

    }

    guardarHoja() {
        console.log('guardar hoja', new Date);
    }

    volverLista() {
        console.log('guardar hoja', new Date);
    }
}
