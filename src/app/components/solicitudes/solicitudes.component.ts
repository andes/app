import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';
import { PrestacionesService } from '../../modules/rup/services/prestaciones.service';
import * as moment from 'moment';
import { TurnoService } from '../../services/turnos/turno.service';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
})
export class SolicitudesComponent implements OnInit {
    turnoSeleccionado: any[];
    solicitudSelccionada: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    labelVolver = 'Lista de Solicitudes';
    public prestaciones = [];
    public fechaDesde: Date = new Date();
    public fechaHasta: Date = new Date();
    public darTurnoArray = [];
    public auditarArray = [];
    public visualizar = [];
    constructor(private auth: Auth, private plex: Plex,
        private router: Router, public servicioPrestacion: PrestacionesService, public servicioTurnos: TurnoService) { }

    ngOnInit() {
        // this.cargarSolicitudes();
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
}
