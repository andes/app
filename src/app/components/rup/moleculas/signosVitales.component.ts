import { Molecula } from './../core/molecula.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: 'signosVitales.html'
})

export class SignosVitalesComponent  extends Molecula implements OnInit{

    ngOnInit() {

        //VER SERVICIO PRESTACION SE REPITE EN RUP

        // como es una molécula buscamos sus atomos
        this.servicioElementosRUP.getById(this.elementoRUP.id).subscribe(tipoPrestacion => {
            this.elementoRUP = tipoPrestacion;
            // si vienen datos por input, los asignamos a nuestro objeto data
            this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
        });


    }
}
