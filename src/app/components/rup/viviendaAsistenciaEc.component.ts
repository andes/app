import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
            selector: 'rup-ViviendaAsistenciaEc',
            templateUrl: 'viviendaAsistenciaEc.html'
})//@Component

export class ViviendaAsistenciaEcComponent implements OnInit { 

      @Input('datosIngreso') datosIngreso: any;       
      @Input('tipoPrestacion') tipoPrestacion: any;
      @Input('paciente') paciente: IPaciente;
      @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

      data1: any;
      data: any = { mensaje: {
                              class: "",
                              texto: "",
                              },
                  };  

    public form: FormGroup;
    constructor(private formBuilder: FormBuilder) { }


    ngOnInit() { 
                 this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;                                     
               } //ngOnInit()

    devolverValores() { //Hacer las validaciones                                                
                         this.data.mensaje = this.getMensajes();
                         this.evtData.emit(this.data);
                      }//devolverValores()

    getMensajes(){};
                      
    }//export class ViviendaAsistenciaEcComponent