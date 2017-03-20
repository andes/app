// import { IPaciente } from './../../../interfaces/IPaciente';
// import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

// @Component({
//     selector: 'rup-EstadoNutricional',
//     templateUrl: 'estadoNutricional.html'
// })// @Component

// export class EstadoNutricionalComponent implements OnInit {

//     @Input('datosIngreso') datosIngreso: any;
//     @Input('tipoPrestacion') tipoPrestacion: any;
//     @Input('paciente') paciente: IPaciente;
//     @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

//     data: any = {
//         mensaje: {
//             class: '',
//             texto: '',
//         },
//     };

//     // *************************************************************************************** //
//     ngOnInit() {
//         this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;


//         // this.paciente = {
//         //     "id": "57ebacce69fe79a598e6281d",
//         //     "documento": "29410428",
//         //     "activo": true,
//         //     "estado": "validado",
//         //     "nombre": "Carolina",
//         //     "apellido": "Celeste",
//         //     "sexo": "femenino",
//         //     "genero": "femenino",
//         //     "fechaNacimiento": "02/11/1993",
//         //     "estadoCivil": "soltera"
//         // };

//         // {
//         //     this.tipoPrestacion = "id" : "58c937167cf90c44906b17cc",
//         //     "key" : "estadoNutricional",
//         //     "nombre" : "Estado Nutricional",
//         //     "autonoma" : false,
//         //     "activo" : true,
//         //     "granularidad" : "atomos",
//         //     "turneable" : false,
//         //     "componente" : {
//         //         "ruta" : "rup/atomos/estadoNutricional.component.ts",
//         //         "nombre" : "EstadoNutricionalComponent"
//         //     };

// }

//     } // ngOnInit()


//     // *************************************************************************************** //
//     devolverValores() { // Hacer las validaciones
//         this.data.mensaje = this.getMensajes();
//         this.evtData.emit(this.data);
//     }// devolverValores()


//     // *************************************************************************************** //
//     getMensajes() {
//         let Edad;
//         let prc;
//         let mensaje: any = {
//             texto: '',
//             class: 'outline-danger'
//         }; // let mensaje

//         Edad = this.paciente.edad;
//         debugger;
//         prc = this.data[this.tipoPrestacion.key];


//         if (Edad >= 2) {
//             switch (prc) {
//                 case (prc > 97): mensaje.texto = 'O (Obesidad)';
//                     break;
//                 case (prc > 85 && prc <= 97): mensaje.texto = 'Sp (Sobrepeso)';
//                     break;
//                 case (prc >= 15 && prc < 85): mensaje.texto = 'N (Normal)';
//                     break;
//                 case (prc >= 3 && prc < 15): mensaje.texto = 'RN (Riesgo Nutricional)';
//                     break;
//                 case (prc < 3): mensaje.texto = 'Em (Emaciación)';
//                     break;
//                 default:
//                     break;
//             } // switch (prc)
//         } // if (Edad >= 2)

//     }// getMensajes()
// }// export class EstadoNutricionalComponent

