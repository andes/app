import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-autocitado',
    templateUrl: 'autocitado.html'
})
export class AutocitadoComponent extends RUPComponent implements OnInit {
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    public prestacionSeleccion;


//     ngOnInit() {
//         this.registro[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
//         // Carga tipos de prestaciones permitidas para el usuario
//         this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
//             this.tiposPrestacion = data;
//             if (!this.datosIngreso) {
//                 this.tiposPrestacion.forEach(element => {
//                     if (element.conceptId === this.prestacion.solicitud.tipoPrestacion.conceptId) {
//                         this.data[this.elementoRUP.key].prestacionSeleccion = element;
//                     }
//                 });
//             }
//         });
//     }
 }