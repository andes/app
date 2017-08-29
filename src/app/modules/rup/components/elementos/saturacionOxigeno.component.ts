import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

import * as moment from 'moment';
@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
export class SaturacionOxigenoComponent extends RUPComponent {

    //     getMensajes() {
    //     let saturacionOxigeno = this.data[this.elementoRUP.key];
    //     let edadEnMeses;

    //     // Calculo Edad en Meses
    //     let edadMeses: any = null;
    //     let fechaNac: any;
    //     let fechaActual: Date = new Date();
    //     let fechaAct: any;
    //     let difDias: any;
    //     let difMeses: any;
    //     fechaNac = moment(this.paciente.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
    //     fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
    //     difDias = fechaAct.diff(fechaNac, 'd');     // Diferencia en días
    //     edadEnMeses = Math.trunc(difDias / 30.4375); // Diferencia en Meses

    //     let mensaje: any = {
    //         texto: '',
    //         class: 'danger'
    //     };

    //     if (saturacionOxigeno) {
    //         // agregar validaciones aca en base al paciente y el tipo de prestacion
    //         if (saturacionOxigeno >= 90 && saturacionOxigeno <= 94) {
    //             mensaje.texto = 'Hipoxemia';
    //         }
    //         if (saturacionOxigeno <= 94) {
    //             mensaje.texto = 'Hipoxemia Severa';
    //         }
    //     }
    //     return mensaje;
    // }
}
