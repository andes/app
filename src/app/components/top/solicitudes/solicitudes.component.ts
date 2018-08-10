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
    styles: [' .blue  {color: #00A8E0 }']
})
export class SolicitudesComponent implements OnInit {

    paciente: any;
    turnoSeleccionado: any;
    solicitudSeleccionada: any;
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
    public darTurnoArraySalida = [];
    public darTurnoArrayEntrada = [];
    public auditarArraySalida = [];
    public auditarArrayEntrada = [];
    public visualizarSalida = [];
    public visualizarEntrada = [];
    public tipoSolicitud = 'entrada';
    public prestacionesSalida: any;
    public prestacionesEntrada: any;
    public showEditarReglas = false;
    public panelIndex = 0;
    public pacienteSolicitud: any;
    public activeTab = 0;
    public showSidebar = false;
    prestacionSeleccionada: any;

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

    cambio(activeTab) {

        this.activeTab = activeTab;
        this.showSidebar = false;
        this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
    }

    refreshSelection(value, tipo) {
        return true;
    }

    estaSeleccionada(solicitud: any) {
        return this.prestaciones.findIndex(x => x.id === solicitud._id);
    }

    seleccionar(arrayPrestaciones, indice) {
        for (let i = 0; i < this.prestaciones.length; i++) {
            this.prestaciones[i].seleccionada = false;
        }
        let indicePrestacion = this.prestaciones.findIndex((prest: any) => { return prest.id === arrayPrestaciones[indice].id; });
        this.prestaciones[indicePrestacion].seleccionada = true;
        this.solicitudSeleccionada = this.prestaciones[indicePrestacion].solicitud;
        this.prestacionSeleccionada = this.prestaciones[indicePrestacion];
        this.pacienteSolicitud = this.prestaciones[indicePrestacion].paciente;
        if (this.prestaciones[indicePrestacion].solicitud && this.prestaciones[indicePrestacion].solicitud.turno) {
            let params = {
                id: this.solicitudSeleccionada.turno
            };
            this.servicioTurnos.getTurnos(params).subscribe(turnos => {
                this.turnoSeleccionado = turnos[0];
            });
        } else {
            this.turnoSeleccionado = null;
        }
        this.showSidebar = true;
    }

    darTurno(prestacionSolicitud) {
        // Pasar filtros al calendario
        this.solicitudTurno = prestacionSolicitud;
        this.pacienteSeleccionado = prestacionSolicitud.paciente;
        this.showDarTurnos = true;
    }
    cancelar(prestacionSolicitud) {
        this.plex.confirm('¿Realmente quiere cancelar la solicitud?', 'Atención').then((confirmar) => {
            if (confirmar) {
                let cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'anulada' }
                };
                // CAMBIEMOS el estado de la prestacion a 'anulada'
                this.servicioPrestacion.patch(prestacionSolicitud.id, cambioEstado).subscribe(prestacion => {
                    this.plex.toast('info', 'Prestación cancelada');
                    this.cargarSolicitudes();
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación');
                });
            }
        });

    }

    volverDarTurno() {
        this.cargarSolicitudes();
        this.showDarTurnos = false;
        this.solicitudTurno = null;
    }

    volverReglas() {
        this.cargarSolicitudes();
        this.showEditarReglas = false;
    }

    auditar() {
        this.plex.confirm('', '¿Aprobar Solicitud?').then((confirmado) => {
            if (!confirmado) {
                return false;
            }

            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                this.prestacionSeleccionada.estados.push({ tipo: 'pendiente' });
                this.servicioPrestacion.put(this.prestacionSeleccionada).subscribe(respuesta => {
                    this.cargarSolicitudes();
                });
            }

        });
    }

    editarReglas() {
        this.showEditarReglas = true;
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

                for (let i = 0; i < this.prestacionesSalida.length; i++) {

                    switch (this.prestacionesSalida[i].estados[this.prestacionesSalida[i].estados.length - 1].tipo) {
                        case 'pendiente':

                            // Se puede auditar?
                            this.auditarArraySalida[i] = false;

                            // Hay turno?
                            if (this.prestacionesSalida[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarSalida[i] = true;
                            } else {
                                // Se puede dar turno?
                                this.darTurnoArraySalida[i] = true;

                                // Se puede visualizar?
                                this.visualizarSalida[i] = false;
                            }
                            break;
                        case 'auditoria':

                            // Se puede dar turno?
                            this.darTurnoArraySalida[i] = false;

                            // Se puede visualizar?
                            this.visualizarSalida[i] = false;

                            // Se puede auditar?
                            this.auditarArraySalida[i] = true;

                            // Hay turno?
                            if (this.prestacionesSalida[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarSalida[i] = true;
                            } else {
                                // Se puede visualizar?
                                this.visualizarSalida[i] = false;
                            }
                            break;
                        case 'validada':

                            // Hay turno?
                            if (this.prestacionesSalida[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarSalida[i] = true;
                            }
                            // Se puede dar turno?
                            this.darTurnoArraySalida[i] = false;
                            // Se puede auditar?
                            this.auditarArraySalida[i] = false;
                            break;
                    }
                }
                for (let i = 0; i < this.prestacionesEntrada.length; i++) {

                    switch (this.prestacionesEntrada[i].estados[this.prestacionesEntrada[i].estados.length - 1].tipo) {
                        case 'pendiente':

                            // Se puede auditar?
                            this.auditarArrayEntrada[i] = false;

                            // Hay turno?
                            if (this.prestacionesEntrada[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarEntrada[i] = true;
                            } else {
                                // Se puede dar turno?
                                this.darTurnoArrayEntrada[i] = true;

                                // Se puede visualizar?
                                this.visualizarEntrada[i] = false;
                            }
                            break;
                        case 'auditoria':

                            // Se puede dar turno?
                            this.darTurnoArrayEntrada[i] = false;

                            // Se puede visualizar?
                            this.visualizarEntrada[i] = false;

                            // Se puede auditar?
                            this.auditarArrayEntrada[i] = true;

                            // Hay turno?
                            if (this.prestacionesEntrada[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarEntrada[i] = true;
                            } else {
                                // Se puede visualizar?
                                this.visualizarEntrada[i] = false;
                            }
                            break;
                        case 'validada':

                            // Hay turno?
                            if (this.prestacionesEntrada[i].solicitud.turno !== null) {
                                // Se puede visualizar?
                                this.visualizarEntrada[i] = true;
                            }
                            // Se puede dar turno?
                            this.darTurnoArrayEntrada[i] = false;
                            // Se puede auditar?
                            this.auditarArrayEntrada[i] = false;
                            break;
                    }
                }
                // console.log('prestaciones ', this.prestaciones);
            }, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }



    formularioSolicitud(tipoSolicitud) {

        this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
    }



    afterNewSolicitud(event) {
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.showCargarSolicitud = false;
        this.cargarSolicitudes();
        this.activeTab = 0;
    }

    afterDetalleSolicitud(event) {
        this.showSidebar = false;
    }

}
