import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { OrganizacionService } from '../../../services/organizacion.service';

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
    public permisos;
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
    public mostrarMasOpciones = false;
    public organizacion;
    public prestacionesPermisos = [];
    public permisosReglas;
    public permisoAnular = false;
    public showAnular = false;
    public prestacionDestino;
    public estado;
    public estados = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'rechazada', nombre: 'RECHAZADA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];
    prestacionSeleccionada: any;


    constructor(
        private auth: Auth,
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioTurnos: TurnoService,
        public servicioOrganizacion: OrganizacionService,
        public router: Router
    ) { }

    ngOnInit() {

        if (!this.auth.getPermissions('solicitudes:?').length) {
            this.router.navigate(['inicio']);
        }

        this.permisosReglas = this.auth.getPermissions('solicitudes:reglas:?').length > 0 ? this.auth.getPermissions('solicitudes:reglas:?')[0] === '*' : false;
        this.prestacionesPermisos = this.auth.getPermissions('solicitudes:tipoPrestacion:?');
        this.permisoAnular = this.auth.check('solicitudes:anular');
        this.showCargarSolicitud = false;
        this.cargarSolicitudes();
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
        } else {
            this.prestacionesEntrada = this.entradaCache;
            this.prestacionesSalida = this.salidaCache;
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF;
            if (this.prestacionesPermisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
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

    anular(arrayPrestaciones, indice) {
        let indicePrestacion = this.prestaciones.findIndex((prest: any) => { return prest.id === arrayPrestaciones[indice].id; });
        this.solicitudSeleccionada = this.prestaciones[indicePrestacion].solicitud;
        this.prestacionSeleccionada = this.prestaciones[indicePrestacion];
        this.pacienteSolicitud = this.prestaciones[indicePrestacion].paciente;
        this.showAnular = true;
        this.showSidebar = false;
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
                solicitudDesde: this.fechaDesde,
                solicitudHasta: this.fechaHasta
            };
            if (this.estado) {
                if (this.estado.id !== 'turnoDado') {
                    params['estados'] = [this.estado.id];
                    if (this.estado.id === 'pendiente') {
                        params['tieneTurno'] = false;
                    }
                } else {
                    params['tieneTurno'] = true;
                }
            } else {
                params['estados'] = [
                    'auditoria',
                    'pendiente',
                    'rechazada',
                    'validada'
                ];
            }
            if (this.organizacion) {
                params['organizacionOrigen'] = this.organizacion.id;
            }
            if (this.prestacionDestino) {
                params['prestacionDestino'] = this.prestacionDestino.id;
            } else {
                if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
                    params['tipoPrestaciones'] = this.prestacionesPermisos;
                }
            }

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

    returnAnular(event) {
        this.showAnular = false;
        if (event.status === false) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'estadoPush',
                    estado: { tipo: 'anulada', motivoRechazo: event.motivo }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => {
                        this.cargarSolicitudes();
                        this.plex.toast('danger', '', 'Solicitud Anulada');
                    }
                );
            }
        }
    }

}
