import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
            selector: 'rup-frecuencia-respiratoria',
            templateUrl: 'frecuenciaRespiratoria.html'
          })

export class FrecuenciaRespiratoriaComponent{
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
                                    // agregar validaciones
                                    // if (this.frecuenciaRespiratoria >=40 && this.frecuenciaRespiratoria <=90 ) {this.mensaje = 'Prematuro'}
                                    // if (this.frecuenciaRespiratoria >=30 && this.frecuenciaRespiratoria <=80 ) {this.mensaje = 'Recien Nacido a término'}
                                    // if (this.frecuenciaRespiratoria >=20 && this.frecuenciaRespiratoria <=40 ) {this.mensaje = '1 año'}
                                    // if (this.frecuenciaRespiratoria >=20 && this.frecuenciaRespiratoria <=30 ) {this.mensaje = '2 años'}
                                    // if (this.frecuenciaRespiratoria >=20 && this.frecuenciaRespiratoria <=25 ) {this.mensaje = '5 años'}
                                    // if (this.frecuenciaRespiratoria >=17 && this.frecuenciaRespiratoria <=22 ) {this.mensaje = '10 años'}
                                    // if (this.frecuenciaRespiratoria >=15 && this.frecuenciaRespiratoria <=20 ) {this.mensaje = '15 años'}
                                    // if (this.frecuenciaRespiratoria >=12 && this.frecuenciaRespiratoria <=20 ) {this.mensaje = 'Adultos'}
                                    //if (this.frecuenciaRespiratoria >= && this.frecuenciaRespiratoria <= ) {this.mensaje = ''}  

                                    this.evtData.emit(this.frecuenciaRespiratoria);    
                                    this.data.mensaje.texto = this.mensaje;                      

                                }


                                           }