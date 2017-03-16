
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";

@Component({
      selector: 'rup-ViviendaContaminantes',
      templateUrl: 'viviendaContaminantes.html'
})//@Component

export class ViviendaContaminantesComponent implements OnInit {

      @Input('datosIngreso') datosIngreso: any;
      @Input('tipoPrestacion') tipoPrestacion: any;
      @Input('paciente') paciente: IPaciente;
      @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

      data: any = {
            mensaje: {
                  class: "",
                  texto: "",
            },
      };

      // Esta lista se deberá cargar en algún schema...(Ver más adelante)                          
      public SelectContaminantes: Array<Object> = [{ id: 'Humo', nombre: 'Humo' },
      { id: 'Basurales', nombre: 'Basurales' },
      { id: 'Agroquímicos', nombre: 'Agroquímicos' },
      { id: 'Vectores', nombre: 'Vectores' },
      { id: 'Terrenos', nombre: 'Terrenos' },
      { id: 'Inundables', nombre: 'Inundables' },
      { id: 'Petroquímica', nombre: 'Petroquímica' },
      ]; //SelectContaminantes:Array

      ngOnInit() {
            this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : [];
      }//ngOnInit()


      devolverValores() { //Hacer las validaciones

            if (this.data[this.tipoPrestacion.key]) {
                  this.data[this.tipoPrestacion.key] = this.data[this.tipoPrestacion.key].map(elemento => { return elemento.id });
            } //if (this.Contaminantes)
            else this.data.valor = [];

            this.data.mensaje = this.getMensajes();
            this.evtData.emit(this.data);
      }//devolverValores()

      getMensajes() { } //getMensajes()


}//export class ViviendaContaminantesComponent