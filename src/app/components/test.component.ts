import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { ElementosRupService } from '../services/elementosRUP.service';

@Component({
    selector: 'test',
    templateUrl: 'test.html'
})

export class TestComponent implements OnInit {

    public elementoRUP: any;
    public data: any = {};
    public paciente = {
        "id": "586e6e8c27d3107fde138254",
        "documento": "41438020",
        "apellido": "FERNANDES",
        "nombre": "NATASHA EDNA",
        "telefono": "2996240102",
        "edad": 35
    };
    public datosIngreso: any = {};
    public soloValores: Boolean = false;
    constructor(private servicioElementosRUP: ElementosRupService) {

    }
    ngOnInit() {

        //VER SERVICIO PRESTACION SE REPITE EN RUP
        //this.elementoRUP.id = '594a8b5c884431c25d9a0265';
        // como es una molécula buscamos sus atomos
        this.servicioElementosRUP.getById('594a8b5c884431c25d9a0265').subscribe(tipoPrestacion => {
            this.elementoRUP = tipoPrestacion;
            // si vienen datos por input, los asignamos a nuestro objeto data
            //this.data[this.elementoRUP.key] = {};
        });

    }

    devolverValores(obj?: any, elementoRUPactual?: any) {
        //debugger;
        //this.data[elementoRUPactual.key] = obj;
        let valor = (typeof obj !== 'undefined' && obj && obj[elementoRUPactual.key]) ? obj[elementoRUPactual.key] : null;
        if (valor) {
            if (!this.data[this.elementoRUP.key]) {
                this.data[this.elementoRUP.key] = {};
            }
            if (!this.data[this.elementoRUP.key][elementoRUPactual.key]) {
                this.data[this.elementoRUP.key][elementoRUPactual.key] = {};
            }
            this.data[this.elementoRUP.key][elementoRUPactual.key] = valor;
        } else if (this.data[this.elementoRUP.key][elementoRUPactual.key] && valor == null) {
            delete this.data[this.elementoRUP.key][elementoRUPactual.key];
        }
        if (!Object.keys(this.data[this.elementoRUP.key]).length) {
            this.data = {};
        }

    }



}
