// import { TipoProblemaService } from './../../../../services/rup/tipoProblema.service';
// import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

// import * as moment from 'moment';

// @Component({
//     selector: 'rup-factores-de-riesgo-nino-sano',
//     templateUrl: 'factorDeRiesgoNinoSano.html'
// })
// export class FactoresDeRiesgoNinoSanoComponent implements OnInit {

//     @Input('datosIngreso') datosIngreso: any;
//     @Input('tipoPrestacion') tipoPrestacion: any;
//     @Input('paciente') paciente: any; // IPaciente;
//     @Input('soloValores') soloValores: Boolean;
//     @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

//     data: any = {};
//     mensaje: any = {};

//     tipoProblemas = [];

//     constructor(private servicioTipoProblema: TipoProblemaService) {
//     }

//     ngOnInit() {
//         this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
//         // si tengo valores cargados entonces devuelvo los resultados y mensajes
//         if (this.datosIngreso) {
//             this.devolverValores();
//         }

//         // buscamos lista de problemas
//         if (this.tipoPrestacion.granularidad === 'atomos' && this.tipoPrestacion.tipoProblemas) {
//             this.servicioTipoProblema.get({tiposProblemas: this.tipoPrestacion.tipoProblemas}).subscribe(tiposProblemas => {
//                 this.tipoProblemas = tiposProblemas;
//                 console.log(tiposProblemas);
//             });
//         }
//     }

//     devolverValores() {
//             this.mensaje = this.getMensajes();
//             this.evtData.emit(this.data);
//     }

//     getMensajes() {
//         // let mensaje: any = {
//         //     texto: '',
//         //     class: 'outline-danger'
//         // };

//         // return mensaje;
//     }

// }