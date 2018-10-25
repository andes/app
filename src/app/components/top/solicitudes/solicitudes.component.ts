import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import * as moment from 'moment';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TurnoService } from '../../../services/turnos/turno.service';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
    styles: [' .blue  {color: #00A8E0 }']
})
export class SolicitudesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    paciente: any;
    turnoSeleccionado: any;
    solicitudSeleccionada: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    labelVolver = 'Lista de Solicitudes';
    showAuditar = false;
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
    public salidaCache: any;
    public prestacionesEntrada: any;
    public entradaCache: any;

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

    filtrarPaciente() {
        if (this.paciente) {
            let auxEntrada = this.prestacionesEntrada;
            let auxSalida = this.prestacionesSalida;

            let search = this.paciente.toLowerCase();
            this.prestacionesEntrada = auxEntrada.filter(t => {
                let nombreCompleto = '';
                if (t.paciente && t.paciente.id) {
                    nombreCompleto = t.paciente.apellido + ' ' + t.paciente.nombre;
                }
                return (t.paciente && t.paciente.id &&
                    (nombreCompleto.toLowerCase().indexOf(search) >= 0
                        || t.paciente.nombre.toLowerCase().indexOf(search) >= 0
                        || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                        || t.paciente.documento.toLowerCase().indexOf(search) >= 0)
                );
            });
            this.prestacionesSalida = auxSalida.filter(t => {
                let nombreCompleto = '';
                if (t.paciente && t.paciente.id) {
                    nombreCompleto = t.paciente.apellido + ' ' + t.paciente.nombre;
                }
                return (t.paciente && t.paciente.id &&
                    (nombreCompleto.toLowerCase().indexOf(search) >= 0
                        || t.paciente.nombre.toLowerCase().indexOf(search) >= 0
                        || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                        || t.paciente.documento.toLowerCase().indexOf(search) >= 0)
                );
            });
            this.setearArreglos();
            // console.log('pe ', PE);
        } else {
            this.prestacionesEntrada = this.entradaCache;
            this.prestacionesSalida = this.salidaCache;
        }
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
                this.turnoSeleccionado = turnos[0].bloques[0].turnos[0];
            });
        } else {
            this.turnoSeleccionado = null;
        }
        this.showSidebar = true;
        this.showAuditar = false;
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

    auditar(arrayPrestaciones, indice) {
        let indicePrestacion = this.prestaciones.findIndex((prest: any) => { return prest.id === arrayPrestaciones[indice].id; });
        this.solicitudSeleccionada = this.prestaciones[indicePrestacion].solicitud;
        this.prestacionSeleccionada = this.prestaciones[indicePrestacion];
        this.pacienteSolicitud = this.prestaciones[indicePrestacion].paciente;
        this.showAuditar = true;
        this.showSidebar = false;
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
            this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
                this.prestaciones = resultado;
                this.prestacionesSalida = resultado.filter((prest: any) => { return (prest.solicitud.organizacionOrigen) ? (this.auth.organizacion.id === prest.solicitud.organizacionOrigen.id) : false; });
                this.prestacionesEntrada = resultado.filter((prest: any) => { return (prest.solicitud.organizacion) ? this.auth.organizacion.id === prest.solicitud.organizacion.id : false; });
                if (this.paciente) {
                    this.filtrarPaciente();
                }
                this.entradaCache = this.prestacionesEntrada;
                this.salidaCache = this.prestacionesSalida;
                this.setearArreglos();

            }, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    // TODO: Refactor
    setearArreglos() {
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
                case 'rechazada':

                    // Se puede dar turno?
                    this.darTurnoArraySalida[i] = false;

                    // Se puede visualizar?
                    this.visualizarSalida[i] = false;

                    // Se puede auditar?
                    this.auditarArraySalida[i] = false;
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

    returnAuditoria(event) {
        this.showAuditar = false;
        if (event.status) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'estadoPush',
                    estado: { tipo: 'pendiente' }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => {
                        this.cargarSolicitudes();
                        this.plex.toast('success', '', 'Solicitud Aceptada');
                    }
                );
            }
        } else {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'estadoPush',
                    estado: { tipo: 'rechazada', motivoRechazo: event.motivo }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => {
                        this.cargarSolicitudes();
                        this.plex.toast('danger', '', 'Solicitud Rechazada');
                    }
                );
            }
        }
    }

}
