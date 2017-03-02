import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
            selector: 'rup-viviendaNivelInstruccion',
            templateUrl: 'viviendaNivelInstruccion.html'
})//@Component

export class ViviendaNivelInstruccionComponent implements OnInit { 

      @Input('datosIngreso') datosIngreso: any;       
      @Input('tipoPrestacion') tipoPrestacion: any;
      @Input('paciente') paciente: IPaciente;
      @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

      data: any = { mensaje: {
                              class: "",
                              texto: "",
                              },
                  };  

    public form1: FormGroup;  
    public form2: FormGroup;  
    public form3: FormGroup;
    constructor(private formBuilder: FormBuilder) { }


    ngOnInit() { 

                    this.tipoPrestacion = {
                                                "_id" : "58b8278bb64acd0989b9f53e",
                                                "key" : "viviendaNivelInstruccion",
                                                "nombre" : "Nivel de Instrucción",
                                                "autonoma" : false,
                                                "activo" : true,
                                                "componente" : {
                                                    "ruta" : "rup/viviendaNivelInstruccion.component.ts",
                                                    "nombre" : "ViviendaNivelInstruccionComponent"
                                                },
                                                "turneable" : false
                                            }



                 this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;                    
               
                 //Primario Competo
                 this.data[this.tipoPrestacion.key] = { activo: false };
                 this.form1 = this.formBuilder.group({activo: [''],});
                 this.form1.valueChanges.subscribe((value) => {this.data[this.tipoPrestacion.key] = value;});  

                 //Secundario Completo   
                 this.data[this.tipoPrestacion.key] = { activo: false };
                 this.form2 = this.formBuilder.group({activo: [''],});
                 this.form2.valueChanges.subscribe((value) => {this.data[this.tipoPrestacion.key] = value;});  


                 //Terciario/Universitario
                 this.data[this.tipoPrestacion.key] = { activo: false };
                 this.form3 = this.formBuilder.group({activo: [''],});
                 this.form3.valueChanges.subscribe((value) => {this.data[this.tipoPrestacion.key] = value;}); 

               } //ngOnInit()


    devolverValores() { //Hacer las validaciones                                                
                         this.data.mensaje = this.getMensajes();
                         this.evtData.emit(this.data);
                      }//devolverValores()

    getMensajes(){};
                      
    }//export class ViviendaNivelInstruccionComponent