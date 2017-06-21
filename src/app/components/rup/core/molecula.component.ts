import { RupComponent } from './../rup.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';


@Component({
    selector: 'molecula',
    templateUrl: 'molecula.html'
})
export class Molecula extends RupComponent {

    ngOnInit() {

        //VER SERVICIO PRESTACION SE REPITE EN RUP

        // como es una molécula buscamos sus atomos
        this.servicioElementosRUP.getById(this.elementoRUP.id).subscribe(tipoPrestacion => {
            this.elementoRUP = tipoPrestacion;
        });

        // si vienen datos por input, los asignamos a nuestro objeto data
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
    }

    // devolverValores(obj: any, tipoPrestacion: any) {
    //     // valor: variable con el resultado qeu viene del input del formulario
    //     let valor = (typeof obj !== 'undefined' && obj && obj[tipoPrestacion.key]) ? obj[tipoPrestacion.key] : null;

    //     if (valor) {
    //         if (!this.data[this.tipoPrestacion.key]) {
    //             this.data[this.tipoPrestacion.key] = {};
    //         }

    //         if (!this.data[this.tipoPrestacion.key][tipoPrestacion.key]) {
    //             this.data[this.tipoPrestacion.key][tipoPrestacion.key] = {};
    //         }
    //         this.data[this.tipoPrestacion.key][tipoPrestacion.key] = valor;

    //     } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && valor == null) {
    //         delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
    //     }


    //     if (!Object.keys(this.data[this.tipoPrestacion.key]).length) {
    //         this.data = {};
    //     }

    //     this.evtData.emit(this.data);
    // }

}
