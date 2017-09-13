import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'rup-evolucion-problema-default',
    templateUrl: 'evolucionProblemaDefault.html'
})

export class EvolucionProblemaDefaultComponent extends RUPComponent implements OnInit {
    public fechaInicio: Date;
    public estado: String; // activo / inactivo / resuleto
    public esCronico: Boolean = false; //
    public esEnmienda: Boolean = false;
    public evolucion: String; //
    public hallazgoHudsCompleto: any; //
    public unaEvolucion;
    public indice = 0;
    public evoluciones;

    // estadoActual: any = { id: 'activo', nombre: 'Activo' };
    inicioEstimadoUnidad: any = null;
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }, { id: 'transformado', nombre: 'Transformado' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' }, { id: 'dias', nombre: 'Día(s)' }];


    /* los atomos por defecto se inicializan en null porque generalmente tienen un solo input
     * al ser este un caso de atomo medio particular que lleva muchas propiedades dentro
     * entonces inicializamos data como un objeto
     */
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = { estado: 'activo' };
        } else {
            this.friendlyDate(this.registro.valor.fechaInicio);
        }
        // Si llega un idRegistroOrigen es porque se trata de evolucionar un problema que ya existe en la HUDS
        // tenemos que mostrar las evoluciones anteriores
        // if (this.registro) {
        //     this.servicioPrestacion.getUnHallazgoPacienteXOrigen(this.paciente.id, this.datosIngreso.idRegistroOrigen)
        //         .subscribe(hallazgo => {
        //             if (hallazgo) {
        //                 this.hallazgoHudsCompleto = hallazgo;
        //                 this.evoluciones = JSON.parse(JSON.stringify(this.hallazgoHudsCompleto.evoluciones));
        //                 if (this.datosIngreso.evolucion) {
        //                     this.evoluciones.shift();
        //                 }
        //                 if (this.evoluciones && this.evoluciones.length > 0) {
        //                     this.unaEvolucion = this.evoluciones[0];
        //                     this.data[this.elementoRUP.key].estado = this.datosIngreso.estado ? this.datosIngreso.estado : (this.unaEvolucion.estado ? this.unaEvolucion.estado : 'activo');
        //                     this.data[this.elementoRUP.key].esCronico = this.datosIngreso.esCronico ? this.datosIngreso.esCronico : (this.unaEvolucion.estado ? this.unaEvolucion.esCronico : false);
        //                     this.data[this.elementoRUP.key].esEnmienda = this.datosIngreso.esEnmienda ? this.datosIngreso.esEnmienda : (this.unaEvolucion.esEnmienda ? this.unaEvolucion.esEnmienda : false);
        //                     this.data[this.elementoRUP.key].evolucion = this.datosIngreso.evolucion ? this.datosIngreso.evolucion : '';
        //                 }
        //             }
        //         });


        // } else {
        //     this.friendlyDate(this.registro.valor.fechaInicio);
        //     this.devolverValores();
        //     //         }

        //     //     } else {
        //     //     this.data[this.elementoRUP.key].esEnmienda = false;
        //     //     this.data[this.elementoRUP.key].esCronico = false;
        //     //     this.data[this.elementoRUP.key].estado = 'activo';
        //     // }

        // }
    }


    formatearEstado() {
        this.registro.valor.estado = ((typeof this.registro.valor.estado === 'string')) ? this.registro.valor.estado : (Object(this.registro.valor.estado).id);
        this.emitChange();
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

        this.registro.valor.fechaInicio = fechaCalc;
        this.emitChange();
    }



    friendlyDate(fecha) {

        let oldDateMoment = moment(fecha, 'YYYY/MM/DD');
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


    cambiarEvolucion(signo) {
        if (signo === '+') {
            if (this.indice < (this.evoluciones.length - 1)) {
                this.indice = this.indice + 1;
                this.unaEvolucion = this.evoluciones[this.indice];
            }
        } else {
            if (this.indice > 0) {
                this.indice = this.indice - 1;
                this.unaEvolucion = this.evoluciones[this.indice];
            }
        }
    }

}
