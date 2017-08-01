import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';


@Component({
    selector: 'rup-odontologia',
    templateUrl: 'odontologia.html'
})
export class OdontologiaComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {};
    mensaje: any = {};

    public SelectControlEdad: Array<Object> = [
        { id: '6M', nombre: '6 Meses' },
        { id: '15M', nombre: '15 Meses' },
        { id: '24M', nombre: '24 Meses' },
        { id: '3A', nombre: '3 Años' },
        { id: '4A', nombre: '4 Años' },
        { id: '5A', nombre: '5 Años' },
        { id: '6A', nombre: '6 Años' },
    ]; // EdadControl:Array


    public SelectSanoOactividades: Array<Object> = [
        { id: 'Sano', nombre: 'Sano' },
        { id: 'SoloAct', nombre: 'Sólo actividades de prevención' },
    ]; // SelectSanoOactividades:Array


    public SelectPatologiaOTratamiento: Array<Object> = [
        { id: 'Patologia', nombre: 'Patología' },
        { id: 'Necesitatratamiento', nombre: 'Necesita tratamiento' },
    ]; // SelectPatologiaOTratamiento:Array




    ngOnInit() {

        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            edadControl: {}, concurrio: false, sanoOactividades: {}, patologiaOTratamiento: {}
        };
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.devolverValores();
        }
    }



    devolverValores() {

        if (this.data[this.tipoPrestacion.key] === null) {
            this.data = {};
        }

        this.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    };


    getMensajes() {
        // let mensaje: any = {
        //     texto: '',
        //     class: 'outline-danger'
    };


} // export class OdontologiaComponent implements OnInit
