import { IPaciente } from './../../interfaces/IPaciente';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';
import { PrestacionesService } from '../../modules/rup/services/prestaciones.service';
import * as moment from 'moment';
import { TurnoService } from '../../services/turnos/turno.service';
import { TipoPrestacionService } from '../../services/tipoPrestacion.service';
import { OrganizacionService } from '../../services/organizacion.service';
import { ProfesionalService } from '../../services/profesional.service';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
})
export class SolicitudesComponent implements OnInit {

    paciente: any;
    profesionalDestino: any;
    organizacionDestino: any;
    turnoSeleccionado: any[];
    solicitudSelccionada: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    labelVolver = 'Lista de Solicitudes';

    public permisos = [];
    public autorizado = false;

    public modelo: any = {
        paciente: {},
        profesional: {},
        organizacion: {},
        solicitud: {
            fecha: null,
            paciente: {},
            organizacion: {},
            profesional: {},
            organizacionOrigen: this.auth.organizacion,
            profesionalOrigen: {},
            turno: null
        },
        estados: [
            { tipo: 'pendiente' }
        ]
    };
    public registros: any = {
        solicitudPrestacion: {
            profesionales: [],
            motivo: '',
            autocitado: false
        }
    };

    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;
    public showSeleccionarPaciente = false;

    public prestaciones = [];
    public fechaDesde: Date = new Date();
    public fechaHasta: Date = new Date();
    public darTurnoArray = [];
    public auditarArray = [];
    public visualizar = [];
    constructor(private servicioPrestacion: PrestacionesService,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private auth: Auth,
        private router: Router,
        private plex: Plex,
        public servicioTurnos: TurnoService) { }

    ngOnInit() {
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.showCargarSolicitud = false;

        this.cargarSolicitudes();
        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {

        }
    }

    cambiarDia(fecha, dias, dir) {
        switch (dir) {
            case 'sumar':
                this[String(fecha)] = moment(this[String(fecha)]).add(1, 'days');
                break;
            case 'restar':
                this[String(fecha)] = moment(this[String(fecha)]).subtract(1, 'days');
                break;
        }
        this.cargarSolicitudes();
    }

    refreshSelection(value, tipo) {
        return true;
    }

    estaSeleccionada(solicitud: any) {
        return this.prestaciones.findIndex(x => x.id === solicitud._id);
    }

    seleccionar(indice) {
        for (let i = 0; i < this.prestaciones.length; i++) {
            this.prestaciones[i].seleccionada = false;
        }

        this.prestaciones[indice].seleccionada = true;
        this.solicitudSelccionada = this.prestaciones[indice];

        if (this.prestaciones[indice].solicitud && this.prestaciones[indice].solicitud.turno) {

            let params = {
                id: this.solicitudSelccionada.solicitud.turno
            };

            this.servicioTurnos.getTurnos(params).subscribe(turno => {
                this.turnoSeleccionado = turno[0];
            });
        } else {
            this.turnoSeleccionado = null;
        }

    }

    darTurno(prestacionSolicitud) {
        // Pasar filtros al calendario
        this.solicitudTurno = prestacionSolicitud;
        this.pacienteSeleccionado = prestacionSolicitud.paciente;
        this.showDarTurnos = true;
    }

    volverDarTurno() {
        this.cargarSolicitudes();
        this.showDarTurnos = false;
        this.solicitudTurno = null;
    }

    auditar() {

    }

    cargarSolicitudes() {
        // Solicitudes que no tienen prestacionOrigen ni turno
        // Si tienen prestacionOrigen son generadas por RUP y no se listan
        // Si tienen turno, dejan de estar pendientes de turno y no se listan
        if (this.fechaDesde && this.fechaHasta) {
            let params = {
                estado: 'pendiente',
                solicitudDesde: moment(this.fechaDesde).startOf('day'),
                solicitudHasta: moment(this.fechaHasta).endOf('day')
            };
            this.servicioPrestacion.get(params).subscribe(resultado => {
                this.prestaciones = resultado;
                for (let i = 0; i < this.prestaciones.length; i++) {

                    switch (this.prestaciones[i].estados[this.prestaciones[i].estados.length - 1].tipo) {
                        case 'pendiente':

                            // Se puede auditar?
                            this.auditarArray[i] = false;

                            // Hay turno?
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizar[i] = true;
                            } else {
                                // Se puede dar turno?
                                this.darTurnoArray[i] = true;

                                // Se puede visualizar?
                                this.visualizar[i] = false;
                            }
                            break;
                        case 'pendiente auditoria':

                            // Se puede dar turno?
                            this.darTurnoArray[i] = false;

                            // Se puede visualizar?
                            this.visualizar[i] = false;

                            // Se puede auditar?
                            this.auditarArray[i] = true;

                            // Hay turno?
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizar[i] = true;
                            } else {
                                // Se puede visualizar?
                                this.visualizar[i] = false;
                            }
                            break;
                        case 'validada':

                            // Hay turno?
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizar[i] = true;
                            }
                            // Se puede dar turno?
                            this.darTurnoArray[i] = false;
                            // Se puede auditar?
                            this.auditarArray[i] = false;
                            break;
                    }
                }
                console.log('prestaciones ', this.prestaciones);
            }, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }


    seleccionarPaciente(paciente: any): void {
        if (paciente.id) {
            this.paciente = paciente;
            this.showSeleccionarPaciente = false;
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        }
    }


    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.solicitud.profesional.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.solicitud.profesional);
        }
    }

    loadProfesionalesMulti(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.registros.solicitudPrestacion.profesionales) {
                    listaProfesionales = (resultado) ? this.registros.solicitudPrestacion.profesionales.concat(resultado) : this.registros.solicitudPrestacion.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.registros.solicitudPrestacion.profesionales);
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
    }

    formularioSolicitud() {
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
        this.showSeleccionarPaciente = true;
    }

    guardarSolicitud($event) {

        if ($event.formValid && this.organizacionDestino._id && this.profesionalDestino._id) {

            // Se limpian keys del bendito plex-select
            delete this.modelo.solicitud.organizacion.$order;
            delete this.modelo.solicitud.profesional.$order;
            delete this.modelo.solicitud.tipoPrestacion.$order;
            if (this.registros.solicitudPrestacion.profesionales) {
                this.registros.solicitudPrestacion.profesionales.filter(profesional => {
                    return delete profesional.$order;
                });
            }

            this.modelo.solicitud.registros = {
                nombre: this.modelo.solicitud.tipoPrestacion.term,
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: this.registros.solicitudPrestacion
                },
                tipo: 'solicitud'
            };

            this.modelo.paciente = this.paciente;
            this.modelo.solicitud.organizacion = this.organizacionDestino;
            this.modelo.solicitud.profesional = this.profesionalDestino ? this.profesionalDestino : { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
            this.modelo.solicitud.profesionalOrigen = { id: this.auth.profesional.id, nombre: this.auth.usuario.nombre, apellido: this.auth.usuario.apellido };

            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {

                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.showCargarSolicitud = false;
                this.showBotonCargarSolicitud = true;

                this.modelo = {
                    paciente: this.paciente,
                    profesional: {},
                    organizacion: {},
                    solicitud: {
                        fecha: null,
                        paciente: {},
                        organizacion: {},
                        organizacionOrigen: this.auth.organizacion,
                        profesional: {},
                        profesionalOrigen: {},
                        turno: null
                    },
                    estados: [
                        { tipo: 'pendiente' }
                    ]
                };
                this.registros = {
                    solicitudPrestacion: {
                        profesionales: [],
                        motivo: '',
                        autocitado: false,
                    }
                };

            });

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        // this.modelo.solicitud = {};
        // this.registros = [];
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.showCargarSolicitud = false;
        // this.cancelarSolicitudVentanilla.emit(true);

        this.modelo = {
            paciente: this.paciente,
            profesional: {},
            organizacion: this.auth.organizacion,
            solicitud: {
                fecha: null,
                paciente: {},
                organizacion: {},
                organizacionOrigen: this.auth.organizacion,
                profesional: {},
                profesionalOrigen: {},
                turno: null
            },
            estados: [
                { tipo: 'pendiente' }
            ]
        };
        this.registros = {
            solicitudPrestacion: {
                profesionales: [],
                motivo: '',
                autocitado: false
            }
        };

    }

}
