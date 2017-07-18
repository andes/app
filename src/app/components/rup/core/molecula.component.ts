import { RupComponent } from './../rup.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';


@Component({
    selector: 'molecula',
    templateUrl: 'molecula.html'
})
export class Molecula extends RupComponent implements OnInit {

    ngOnInit() {
        //VER SERVICIO PRESTACION SE REPITE EN RUP
        //setTimeout( () => {
            // como es una molécula buscamos sus atomos
            this.servicioElementosRUP.getById(this.elementoRUP.id).subscribe(tipoPrestacion => {
                this.elementoRUP = tipoPrestacion;
                // si vienen datos por input, los asignamos a nuestro objeto data
                this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
            });
        //});

    }
}
