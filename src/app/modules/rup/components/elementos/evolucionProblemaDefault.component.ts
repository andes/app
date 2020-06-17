
import { RUPComponent } from './../core/rup.component';
import { Component, OnInit, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { RupElement } from '.';

@Component({
    selector: 'rup-evolucion-problema-default',
    templateUrl: 'evolucionProblemaDefault.html',
})
@RupElement('EvolucionProblemaDefaultComponent')
export class EvolucionProblemaDefaultComponent extends RUPComponent implements OnInit {
    public fechaInicio: Date;
    public estado: String;
    public esCronico: Boolean = false;
    public esEnmienda: Boolean = false;
    public evolucion: String;
    public hallazgoHudsCompleto: any;
    public evolucionActual;
    public indice = 0;
    public evoluciones;

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
        if (!this.registro.valor) {

            this.registro.valor = { estado: 'activo' };
            if (this.registro.concepto.semanticTag === 'hallazgo') {
                this.registro.valor.fechaInicio = new Date();
                this.friendlyDate(this.registro.valor.fechaInicio);
            }
        } else {
            // Si llega un idRegistroOrigen es porque se trata de evolucionar un problema que ya existe en la HUDS
            // tenemos que mostrar las evoluciones anteriores
            if (this.registro.valor.idRegistroOrigen) {
                this.getHallazgo(this.registro.valor.idRegistroOrigen);
            }
            this.friendlyDate(this.registro.valor.fechaInicio);
        }

        if (this.soloValores) {

            if (this.registro.evoluciones && this.registro.evoluciones.length) {
                this.evolucionActual = this.registro.evoluciones[0];

                // RELACIONES
                this.prestacionesService.getById(this.evolucionActual.idPrestacion).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.registro.evoluciones.forEach(evolucion => {
                        if (evolucion.relacionadoCon && evolucion.relacionadoCon.length > 0) {
                            if (typeof evolucion.relacionadoCon[0] === 'string') {
                                evolucion.relacionadoCon = evolucion.relacionadoCon.map(x => x = prestacion.ejecucion.registros.find(r => r.id === evolucion.relacionadoCon[0]));
                            }
                        }
                    });
                });
            }
        }
    }

    getHallazgo(idOrigen) {
        this.prestacionesService.getUnHallazgoPacienteXOrigen(this.paciente.id, idOrigen)
            .subscribe(hallazgo => {
                if (hallazgo) {
                    this.hallazgoHudsCompleto = hallazgo;
                    this.evoluciones = JSON.parse(JSON.stringify(this.hallazgoHudsCompleto.evoluciones));

                    if (this.registro.valor.evolucion) {
                        this.evoluciones.shift();
                    }
                    if (this.evoluciones && this.evoluciones.length > 0) {
                        this.evolucionActual = this.evoluciones[0];
                        this.registro.valor.estado = this.registro.valor.estado ? this.registro.valor.estado : (this.evolucionActual.estado ? this.evolucionActual.estado : 'activo');
                        this.registro.valor.evolucion = this.registro.valor.evolucion ? this.registro.valor.evolucion : '';
                        if (this.registro.concepto.semanticTag === 'hallazgo') {
                            this.registro.valor.fechaInicio = new Date();
                            this.friendlyDate(this.registro.valor.fechaInicio);
                        }
                    }
                } else {
                    this.hallazgoHudsCompleto = null;
                    this.registro.valor.estado = 'activo';
                    if (this.registro.concepto.semanticTag === 'hallazgo') {
                        this.registro.valor.fechaInicio = new Date();
                        this.friendlyDate(this.registro.valor.fechaInicio);
                    }
                }
            });
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



    /**
     * Media pila, hacer un pipe
     */
    friendlyDate(fecha) {
        if (this.registro.valor.fechaInicio) {
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
    }


    cambiarEvolucion(signo) {
        this.evolucionActual = null;
        if (signo === '+') {
            if (this.indice < (this.registro.evoluciones.length - 1)) {
                this.indice = this.indice + 1;
            }
        } else {
            if (this.indice > 0) {
                this.indice = this.indice - 1;
            }
        }

        this.evolucionActual = this.registro.evoluciones[this.indice];
        this.evolucionActual.fechaCarga = this.registro.evoluciones[this.indice].fechaCarga;

        let idp = (this.evolucionActual as any).informeRequerido.idPrestacion ? (this.evolucionActual as any).informeRequerido.idPrestacion : this.registro.idPrestacion;

        if (typeof idp !== 'undefined') {
            this.prestacionesService.getById(idp).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.registro.evoluciones.forEach(evolucion => {
                    if (evolucion.relacionadoCon && evolucion.relacionadoCon.length > 0) {
                        if (typeof evolucion.relacionadoCon[0] === 'string') {
                            evolucion.relacionadoCon = evolucion.relacionadoCon.map(x => x = this.prestacion.ejecucion.registros.find(r => r.id === evolucion.relacionadoCon[0]));
                        }
                    }
                });
            });
        }
    }
}
