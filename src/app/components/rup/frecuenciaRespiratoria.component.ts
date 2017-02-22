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

  @Output() evtData: EventEmitter < any > = new EventEmitter < any > ();

  frecuenciaRespiratoria: Number = null;
  mensaje: String = null;
  data: any = {
    valor: this.frecuenciaRespiratoria,
    mensaje: {
      texto: String
    }
  };


  ngOnInit() {
    if (this.datosIngreso) {
      this.frecuenciaRespiratoria = this.datosIngreso;
    }
  }

  devolverValores() {
                    // Ver validaciones - Falta definición para lograr identidicarlos                                                                   
                    if(this.paciente.edadReal.unidad === 'Días' || this.paciente.edadReal.unidad === 'Meses' || this.paciente.edadReal.unidad === 'Horas'){ 

                        //Prematuro -ver el peso del paciente   
                        if (this.frecuenciaRespiratoria >=40 && this.frecuenciaRespiratoria <=90 ) {this.mensaje = 'Paciente Prematuro: Dentro de los parámetros normales'}             
                        else {this.mensaje = 'Paciente Prematuro: Fuera de los parámetros normales'}                                      

                        // Recien Nacido a término     
                        if (this.frecuenciaRespiratoria >=30 && this.frecuenciaRespiratoria <=80 ) {this.mensaje = 'Paciente Recien Nacido a término: Dentro de los parámetros normales'}             
                        else {this.mensaje = 'Paciente Recien Nacido a término: Fuera de los parámetros normales'}
                    }

                    // Pacientes Años
                    if (this.paciente.edadReal.unidad === 'Años'){   
                                           
                    if (this.paciente.edadReal.valor === 1) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 40 ) {this.mensaje = 'Paciente de  1 año: Dentro de los parámetros normales'}             
                        else {this.mensaje = '1 año: Fuera de los parámetros normales'}}                                                                

                    if (this.paciente.edadReal.valor === 2) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 30 ) {this.mensaje = 'Paciente de  2 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '2 años: Fuera de los parámetros normales'}}
                                                
                    if (this.paciente.edadReal.valor === 5) {
                        if (this.frecuenciaRespiratoria >= 20 && this.frecuenciaRespiratoria <= 25 ) {this.mensaje = 'Paciente de  5 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '5 años: Fuera de los parámetros normales'}}                                                                

                    if (this.paciente.edadReal.valor === 10) {
                        if (this.frecuenciaRespiratoria >= 17 && this.frecuenciaRespiratoria <= 22 ) {this.mensaje = 'Paciente de  10 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '10 años: Fuera de los parámetros normales'}}                                                                  

                    if (this.paciente.edadReal.valor === 15) {
                        if (this.frecuenciaRespiratoria >= 15 && this.frecuenciaRespiratoria <= 20 ) {this.mensaje = 'Paciente de 15 años: Dentro de los parámetros normales'}             
                        else {this.mensaje = '15 años: Fuera de los parámetros normales'}}                                                                                                                                                                                                                                                                                         
                        if (this.paciente.edadReal.valor > 17) {
                            if (this.frecuenciaRespiratoria >= 12 && this.frecuenciaRespiratoria <= 20 ) {this.mensaje = 'Paciente Adulto: Dentro de los parámetros normales'}             
                            else {this.mensaje = 'Adulto: Fuera de los parámetros normales'}}      
                     } // If Pacientes Años


                    this.evtData.emit(this.frecuenciaRespiratoria);    
                    this.data.mensaje.texto = this.mensaje;                                                           
                    
                    }                                                                                                                                     
                                                                            

                            }
