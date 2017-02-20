// 000 - Leandro Lambertucci - LL - 20/02/2017
//---------------------------------------------------------------------------------------------------------------------------------------------------
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-temperatura',
    templateUrl: 'temperatura.html'
})

export class TemperaturaComponent {

                                    @Input('datosIngreso') datosIngreso: any;
                                    @Input('paciente') paciente: IPaciente;
                                    @Input('tipoPrestacion') prestacion: any;
                                    @Input('required') required: Boolean;
                                    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

                                    temperatura: Number = null;
                                    mensaje    : String = null;
                                    data       : any    = {  valor: this.temperatura,mensaje: { texto: String }};


                                    ngOnInit() {
                                                    if (this.datosIngreso) {this.temperatura = this.datosIngreso;}
                                               }


                                    devolverValores() { // agregar validaciones
                                        
                                                        if (this.temperatura > 38 ) { this.mensaje = 'Fiebre' }
                                                        else{this.mensaje = 'Normal' }

                                                        this.evtData.emit(this.temperatura);    
                                                        this.data.mensaje.texto = this.mensaje;   
                                                      }
                                }