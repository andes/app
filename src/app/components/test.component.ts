import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { ElementosRupService } from '../services/elementosRUP.service';

@Component({
    selector: 'test',
    templateUrl: 'test.html'
})

export class TestComponent implements OnInit {

    public elementoRUP: any;
    public data: any;
    constructor(private servicioElementosRUP: ElementosRupService){

    }
ngOnInit() {

        //VER SERVICIO PRESTACION SE REPITE EN RUP

        // como es una molécula buscamos sus atomos
        this.servicioElementosRUP.getById(this.elementoRUP.id).subscribe(tipoPrestacion => {
            this.elementoRUP = tipoPrestacion;
        });

        // si vienen datos por input, los asignamos a nuestro objeto data
        this.data[this.elementoRUP.key] = {};
    }
}
