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

      data: any = { mensaje: {
                              class: "",
                              texto: "",
                              },
                  };  

    public form: FormGroup;
    public requiereAsistencia: any;
    constructor(private formBuilder: FormBuilder) { }


    ngOnInit() { 
                 this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;                    
               
                 this.data[this.tipoPrestacion.key] = { activo: false };
                 this.form = this.formBuilder.group({activo: [''],});
                 this.form.valueChanges.subscribe((value) => {this.data[this.tipoPrestacion.key] = value;});    
               } //ngOnInit()


    devolverValores() { //Hacer las validaciones                                                
                         this.data.mensaje = this.getMensajes();
                         this.evtData.emit(this.data);
                      }//devolverValores()

    getMensajes(){};
                      
    }//export class ViviendaResiduosComponent