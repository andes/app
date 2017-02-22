import { IPaciente } from './../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
            selector: 'rup-frecuencia-respiratoria',
            templateUrl: 'frecuenciaRespiratoria.html'
          })

export class FrecuenciaRespiratoriaComponent implements OnInit {
                @Input('datosIngreso') datosIngreso: any;
                @Input('tipoPrestacion') prestacion: any;
                @Input('paciente') paciente: IPaciente;

                @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

                frecuenciaRespiratoria: Number = null;
                mensaje               : String = null;
                data                  : any    = { valor: this.frecuenciaRespiratoria, mensaje: { texto: String }};


                ngOnInit() {
                            if (this.datosIngreso) { this.frecuenciaRespiratoria = this.datosIngreso; }
                           }

                devolverValores(){

                    //   // agregar validaciones

                    // Ver validacines para NEO - Ver unidad de la edad 

                    // if (this.paciente.edad < 1) {
                    //     if (this.frecuenciaRespiratoria >=40 && this.frecuenciaRespiratoria <=90 ) {this.mensaje = 'Prematuro: Dentro de los parámetros normales'}             
                    //     else {this.mensaje = 'Prematuro: Fuera de los parámetros normales'} } 

                    if (this.paciente.edad < 1) {
                        if (this.frecuenciaRespiratoria >=30 && this.frecuenciaRespiratoria <=80 ) {this.mensaje = 'Recien Nacido a término: Dentro de los parámetros normales'}             
                        else {this.mensaje = 'Recien Nacido a término: Fuera de los parámetros normales'}}

                    if (this.paciente.edad === 1) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 40 ) {this.mensaje = '1 año: Dentro de los parámetros normales'}             
                        else {this.mensaje = '1 año: Fuera de los parámetros normales'}}                                                                

                    if (this.paciente.edad === 2) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 30 ) {this.mensaje = '2 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '2 años: Fuera de los parámetros normales'}}
                                                
                    if (this.paciente.edad === 5) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 25 ) {this.mensaje = '5 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '5 años: Fuera de los parámetros normales'}}                                                                

                    if (this.paciente.edad === 10) {
                        if (this.frecuenciaRespiratoria >= 17 && this.frecuenciaRespiratoria <= 22 ) {this.mensaje = '10 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '10 años: Fuera de los parámetros normales'}}                                                                  

                    if (this.paciente.edad === 15) {
                        if (this.frecuenciaRespiratoria >= 15 && this.frecuenciaRespiratoria <= 20 ) {this.mensaje = '15 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '15 años: Fuera de los parámetros normales'}}                                                                                                                                                                                                                                                                  

                    if (this.paciente.edad > 17) {
                        if (this.frecuenciaRespiratoria >= 12 && this.frecuenciaRespiratoria <= 20 ) {this.mensaje = 'Adulto: Dentro de los parámetros normales'}             
                        else {this.mensaje = 'Adulto: Fuera de los parámetros normales'}}      


                    this.evtData.emit(this.frecuenciaRespiratoria);    
                    this.data.mensaje.texto = this.mensaje;                                                           
                    
                    }                                                                                                                                     
                                                                            

                            }

