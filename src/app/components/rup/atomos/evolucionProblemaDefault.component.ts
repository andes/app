import { Atomo } from './../core/atomoComponent';
// import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'rup-evolucion-problema-default',
    templateUrl: 'evolucionProblemaDefault.html'
})

export class EvolucionProblemaDefaultComponent extends Atomo implements OnInit {
    public fechaInicio: Date;
    public estado: String; // activo / inactivo / resuleto
    public esCronico: Boolean = false; //
    public esEnmienda: Boolean = false;
    public evolucion: String; //

    // estadoActual: any = { id: 'activo', nombre: 'Activo' };
    inicioEstimadoUnidad: any = null;
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' }, { id: 'dias', nombre: 'Día(s)' }];


    /* los atomos por defecto se inicializan en null porque generalmente tienen un solo input
     * al ser este un caso de atomo medio particular que lleva muchas propiedades dentro
     * entonces inicializamos data como un objeto
     */
    ngOnInit() {

        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.friendlyDate(this.datosIngreso.fechaInicio);
            this.devolverValores();
        } else {
            this.data[this.elementoRUP.key].estado = { id: 'activo', nombre: 'Activo' };
        }

    }

    calcularFecha() {
        let fechaCalc;
        switch (true) {
            case (this.inicioEstimadoTiempo.id === 'anios'):
                fechaCalc = moment().subtract('years', this.inicioEstimadoUnidad);
                break;
            case (this.inicioEstimadoTiempo.id === 'mes'):
                fechaCalc = moment().subtract('months', this.inicioEstimadoUnidad);
                break;
            case (this.inicioEstimadoTiempo.id === 'semanas'):
                fechaCalc = moment().subtract('week', this.inicioEstimadoUnidad);
                break;
            case (this.inicioEstimadoTiempo.id === 'dias'):
                fechaCalc = moment().subtract('days', this.inicioEstimadoUnidad);
                break;
            default:
                fechaCalc = new Date();
        }

        this.data[this.elementoRUP.key].fechaInicio = fechaCalc;
        this.devolverValores();
    }

    friendlyDate(fecha) {

        let oldDateMoment = moment(fecha, 'YYYY/MM/DD');
        console.log(fecha);
        let newDateMoment = moment();

        let numYears = newDateMoment.diff(oldDateMoment, 'years');
        let numMonths = newDateMoment.diff(oldDateMoment, 'months');
        let numDays = newDateMoment.diff(oldDateMoment, 'days');

        if (numYears > 0) {
            this.inicioEstimadoUnidad = numYears;
            this.inicioEstimadoTiempo = { id: 'anios', nombre: 'Año(s)' };
        } else {
            if (numMonths > 0) {
                this.inicioEstimadoUnidad = numMonths;
                this.inicioEstimadoTiempo = { id: 'mes', nombre: 'Mes(es)' };
            } else {
                this.inicioEstimadoUnidad = numDays;
                this.inicioEstimadoTiempo = { id: 'dias', nombre: 'Día(s)' };
            }
        }
    }

}

