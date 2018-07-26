import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { IPaciente } from './../../../interfaces/IPaciente';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
})
export class SolicitudesComponent implements OnInit {

    paciente: any;
    turnoSeleccionado: any[];
    solicitudSelccionada: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    labelVolver = 'Lista de Solicitudes';

    public autorizado = false;
    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;
    public prestaciones = [];
    public fechaDesde: Date = new Date();
    public fechaHasta: Date = new Date();
    public darTurnoArray = [];
    public auditarArray = [];
    public visualizar = [];
    tipoSolicitud: any;
    prestacionesSalida: any;
    prestacionesEntrada: any;
    constructor(
        private auth: Auth,
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        public servicioTurnos: TurnoService
    ) { }

    ngOnInit() {
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
        if (this.fechaDesde && this.fechaHasta) {
            let params = {
                estado: [
                    'auditoria', // solicitudes a ser auditadas, pueden pasar a rechazadas o a pendientes
                    'pendiente', // solicitudes pendientes pueden tener o no turno asociado, están pendientes de ejecución
                    'rechazada', // solicitudes rechazadas en el proceso de auditoría
                    'validada'   // solicitudes validadas, si tienen turno asociado veremos la información
                ],
                solicitudDesde: this.fechaDesde,
                solicitudHasta: this.fechaHasta
            };
            this.servicioPrestacion.get(params).subscribe(resultado => {
                this.prestaciones = resultado;
                this.prestacionesSalida = resultado.filter((prest: any) => { return (prest.solicitud.organizacionOrigen) ? (this.auth.organizacion.id === prest.solicitud.organizacionOrigen.id) : false; });
                this.prestacionesEntrada = resultado.filter((prest: any) => { return (prest.solicitud.organizacion) ? this.auth.organizacion.id === prest.solicitud.organizacion.id : false; });

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
                        case 'auditoria':

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

    formularioSolicitud(tipoSolicitud) {
        console.log(tipoSolicitud);
        this.tipoSolicitud = tipoSolicitud;
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
    }



    afterNewSolicitud(event) {
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.showCargarSolicitud = false;
    }

}
