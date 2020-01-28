import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
    styleUrls: ['./solicitudes.scss']
})

export class SolicitudesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    paciente: any;
    turnoSeleccionado: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    labelVolver = 'Lista de Solicitudes';
    showAuditar = false;
    private scrollEnd = false;
    private skip = 0;
    private limit = 15;
    public permisos;
    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;
    public fechaDesde: Date = new Date();
    public fechaHasta: Date = new Date();
    public darTurnoArraySalida = [];
    public darTurnoArrayEntrada = [];
    public auditarArraySalida = [];
    public auditarArrayEntrada = [];
    public visualizarSalida = [];
    public visualizarEntrada = [];
    public tipoSolicitud = 'entrada';
    public prestacionesSalida = [];
    public prestacionesEntrada = [];

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
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'registroHUDS', nombre: 'REGISTRO EN HUDS' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];
    public prioridad;
    public prioridades = [
        { id: 'prioritario', nombre: 'PRIORITARIO' },
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

    onPacienteChange() {
        if (!this.paciente || this.paciente.length >= 3) {
            this.cargarSolicitudes();
        }
    }

    loadPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe(data =>
            event.callback(this.prestacionesPermisos[0] === '*' ? data : data.filter(e => this.prestacionesPermisos.indexOf(e.id) >= 0))
        );
    }

    cambio(activeTab) {
        this.activeTab = activeTab;
        this.showSidebar = false;
        this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
        this.cargarSolicitudes();
    }

    cerrar() {
        this.showSidebar = false;
        this.showAnular = false;
        this.showAuditar = false;
    }

    refreshSelection(value, tipo) {
        return true;
    }

    estaSeleccionada(solicitud: any) {
        return (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).findIndex(x => x.id === solicitud._id);
    }

    seleccionar(prestacion) {
        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).forEach(e => e.seleccionada = false);

        prestacion.seleccionada = true;
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        if (prestacion.solicitud && prestacion.solicitud.turno) {
            this.servicioTurnos.getTurnos({ id: prestacion.solicitud.turno }).subscribe(turnos => this.turnoSeleccionado = turnos[0].bloques[0].turnos[0]);
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
        this.plex.confirm('¿Realmente quiere cancelar la solicitud?', 'Atención').then(confirmar => {
            if (confirmar) {
                let cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'anulada' }
                };
                // CAMBIEMOS e  l estado de la prestacion a 'anulada'
                this.servicioPrestacion.patch(prestacionSolicitud.id, cambioEstado).subscribe(prestacion => {
                    this.plex.toast('info', 'Prestación cancelada');
                    this.cargarSolicitudes();
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación');
                });
            }
        });
    }

    anular(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        this.showAnular = true;
        this.showAuditar = false;
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

    auditar(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        this.showAuditar = true;
        this.showAnular = false;
        this.showSidebar = false;
    }

    editarReglas() {
        this.showEditarReglas = true;
    }

    cargarSolicitudes() {
        if (this.fechaDesde && this.fechaHasta) {
            (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).length = 0;
            this.skip = 0;
            this.scrollEnd = false;

            this.buscarSolicitudes();
        }
    }

    getParams() {
        let params = {
            solicitudDesde: this.fechaDesde,
            solicitudHasta: this.fechaHasta,
            ordenFechaDesc: true
        };
        if (this.estado) {

            if (this.estado.id === 'turnoDado') {
                params['tieneTurno'] = true;
            } else if (this.estado.id === 'registroHUDS') {
                params['tieneTurno'] = true;
                params['estados'] = ['validada'];
            } else {
                params['estados'] = [this.estado.id];
                if (this.estado.id === 'pendiente') {
                    params['tieneTurno'] = false;
                }
            }
        } else {
            params['estados'] = [
                'asignada',
                'auditoria',
                'pendiente',
                'rechazada',
                'validada',
                'asignada'
            ];
        }
        if (this.organizacion) {
            params['organizacionOrigen'] = this.organizacion.id;
        }
        if (this.prestacionDestino) {
            params['prestacionDestino'] = this.prestacionDestino.id;
        } else {
            params['estados'] = [this.estado.id];
            if (this.estado.id === 'pendiente') {
                params['tieneTurno'] = false;
            }
        }
        if (this.prestacionDestino) {
            params['prestacionDestino'] = this.prestacionDestino.id;
        } else {
            if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
                params['tipoPrestaciones'] = this.prestacionesPermisos;
            }
        }

        if (this.prioridad) {
            params['prioridad'] = this.prioridad.id;
        }

        if (this.tipoSolicitud === 'entrada') {
            params['organizacion'] = this.auth.organizacion.id;
        } else {
            params['organizacionOrigen'] = this.auth.organizacion.id;
        }

        if (this.paciente && this.paciente.length >= 3) {
            params['paciente'] = this.paciente;
        }

        params['skip'] = this.skip;
        params['limit'] = this.limit;
        return params;
    }

    @Unsubscribe()
    buscarSolicitudes() {
        return this.servicioPrestacion.getSolicitudes(this.getParams()).subscribe(resultado => {
            if (this.tipoSolicitud === 'entrada') {
                this.prestacionesEntrada = this.prestacionesEntrada.concat(resultado);
                this.skip = this.prestacionesEntrada.length;
            } else if (this.tipoSolicitud === 'salida') {
                this.prestacionesSalida = this.prestacionesSalida.concat(resultado);
                this.skip = this.prestacionesSalida.length;
            }

            this.setearArreglos();

            // si vienen menos solicitudes que la cantidad límite significa que ya se cargaron todas
            if (!resultado.length || resultado.length < this.limit) {
                this.scrollEnd = true;
            }

        });
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
                case 'asignada':
                    // Se puede visualizar?
                    this.visualizarEntrada[i] = true;
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

        if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length) {
            let patch: any = {
                op: 'estadoPush',
                estado: {
                    tipo: event.status === 1 ? 'pendiente' : (event.status === 2 ? 'asignada' : 'rechazada'),
                    observaciones: event.observaciones
                }
            };

            // DEPRECADO
            if (!event.status) {
                patch.motivoRechazo = event.observaciones;
            }
            if (event.prioridad) {
                patch.prioridad = event.prioridad;
            }
            if (event.profesional) {
                patch.profesional = event.profesional;
            }
            this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                respuesta => {
                    this.cargarSolicitudes();
                    this.plex.toast(event.status ? 'success' : 'danger', '', event.status ? 'Solicitud Aceptada' : 'Solicitud CONTRARREFERIDA');
                }
            );
        }
    }

    returnAnular(event) {
        this.showAnular = false;
        if (event.status === false) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'estadoPush',
                    estado: {
                        tipo: 'anulada',
                        motivoRechazo: event.motivo, // 'motivoRechazo' se reemplaza con 'observaciones'
                        observaciones: event.motivo
                    }
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

    onScroll() {
        if (!this.scrollEnd) {
            this.buscarSolicitudes();
        }
    }
}
