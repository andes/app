import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { Unsubscribe } from '@andes/shared';
import { HUDSService } from '../../../modules/rup/services/huds.service';
import { ObraSocialCacheService } from '../../../services/obraSocialCache.service';
import { concat } from 'rxjs';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
    styleUrls: ['./solicitudes.scss']
})

export class SolicitudesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    paciente: any;
    fecha: any;
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
    public prestaciones = [];
    public showIniciarPrestacion = false;
    public fechaDesde: Date = moment().startOf('day').toDate();
    public fechaHasta: Date = moment().startOf('day').toDate();
    public darTurnoArraySalida = [];
    public darTurnoArrayEntrada = [];
    public auditarArraySalida = [];
    public auditarArrayEntrada = [];
    public visualizarSalida = [];
    public visualizarEntrada = [];
    public tipoSolicitud = 'entrada';
    public prestacionesSalida = [];
    public prestacionesEntrada = [];
    public salidaCache: any;
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
    public showCitar = false;
    public showDetalle = false;
    public prestacionDestino;
    public estado;
    public estadoEntrada;
    public estadoSalida;
    public asignadas = false;
    public estadosEntrada = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'registroHUDS', nombre: 'REGISTRO EN HUDS' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];
    public estadosSalida = [
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
    public showModalMotivo = false;
    public motivoVerContinuarPrestacion = 'Continuidad del cuidado del paciente';
    public routeToParams = [];
    public accesoHudsPrestacion = null;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioTurnos: TurnoService,
        public servicioOrganizacion: OrganizacionService,
        public router: Router, private route: ActivatedRoute,
        private hudsService: HUDSService,
        private osService: ObraSocialCacheService,
    ) { }

    ngOnInit() {

        if (!this.auth.getPermissions('solicitudes:?').length) {
            this.router.navigate(['inicio']);
        } else {
            if (this.auth.getPermissions('solicitudes:?').length === 1 && this.auth.getPermissions('solicitudes:reglas:?')[0] !== '*' && this.auth.getPermissions('solicitudes:asignadas:?').length) {
                this.router.navigate(['asignadas']);
            }
        }
        this.permisosReglas = this.auth.getPermissions('solicitudes:reglas:?').length > 0 ? this.auth.getPermissions('solicitudes:reglas:?')[0] === '*' : false;
        this.prestacionesPermisos = this.auth.getPermissions('solicitudes:tipoPrestacion:?');
        this.permisoAnular = this.auth.check('solicitudes:anular');
        this.showCargarSolicitud = false;
        let currentUrl = this.router.url;
        if (currentUrl === '/asignadas') {
            this.asignadas = true;
            this.estadosEntrada = [
                { id: 'asignada', nombre: 'ASIGNADA' }
            ];
            this.fechaDesde = null;
            this.fechaHasta = null;
            this.estadoEntrada = { id: 'asignada', nombre: 'ASIGNADA' };
        }
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

    cambio(activeTab) {
        this.activeTab = activeTab;
        this.showSidebar = false;
        this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
        this.cargarSolicitudes();
    }

    cerrar() {
        this.showDetalle = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
        this.showSidebar = false;
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
            this.servicioTurnos.getTurnos({ id: prestacion.solicitud.turno }).subscribe(turnos => {
                this.turnoSeleccionado = turnos[0].bloques[0].turnos[0];
                this.setShowDetallesFlags();
            });
        } else {
            this.turnoSeleccionado = null;
            this.setShowDetallesFlags();
        }
    }

    private setShowDetallesFlags() {
        this.showDetalle = true;
        this.showSidebar = true;
        this.showAnular = false;
        this.showAuditar = false;
        this.showIniciarPrestacion = false;
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
                this.servicioPrestacion.patch(prestacionSolicitud.id, cambioEstado).subscribe(prestacion => this.plex.toast('info', 'Prestación cancelada'), (err) => this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación'));
            }
        });
    }

    anular(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        this.showAnular = true;
        this.showSidebar = true;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
    }

    citar(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        this.showCitar = true;
        this.showSidebar = true;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showIniciarPrestacion = false;
    }

    iniciarPrestacion(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.pacienteSolicitud = prestacion.paciente;
        this.showIniciarPrestacion = true;
        this.showSidebar = true;
        this.showCitar = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
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
        this.showSidebar = true;
        this.showAnular = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
    }

    editarReglas() {
        this.showEditarReglas = true;
    }

    cargarSolicitudes() {
        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).length = 0;
        this.skip = 0;
        this.scrollEnd = false;

        this.buscarSolicitudes();
    }

    getParams() {
        let params: any = {
            solicitudDesde: this.fechaDesde,
            solicitudHasta: this.fechaHasta,
            ordenFechaDesc: true,
            estados: [
                'auditoria',
                'pendiente',
                'rechazada',
                'validada',
                'asignada'
            ]
        };
        if (this.tipoSolicitud === 'entrada') {
            params.referidas = true;

            if (this.asignadas) {
                params['idProfesional'] = this.auth.profesional;
            }

            if (this.estadoEntrada) {

                if (this.estadoEntrada.id === 'turnoDado') {
                    params['tieneTurno'] = true;
                    params.estados = params.estados.filter(e => e !== 'validada');
                } else if (this.estadoEntrada.id === 'registroHUDS') {
                    params['tieneTurno'] = true;
                    params['estados'] = ['validada'];
                } else {
                    params['estados'] = [this.estadoEntrada.id];
                    if (this.estadoEntrada.id === 'pendiente') {
                        params['tieneTurno'] = false;
                    }
                }
                if (this.prestacionDestino) {
                    params['prestacionDestino'] = this.prestacionDestino.id;
                }
            }
        }
        if (this.tipoSolicitud === 'salida') {
            if (this.asignadas) {
                params['idProfesionalOrigen'] = this.auth.profesional;
            }
            if (this.estadoSalida) {

                if (this.estadoSalida.id === 'turnoDado') {
                    params['tieneTurno'] = true;
                    params.estados = params.estados.filter(e => e !== 'validada');
                } else if (this.estadoSalida.id === 'registroHUDS') {
                    params['tieneTurno'] = true;
                    params['estados'] = ['validada'];
                } else {
                    params['estados'] = [this.estadoSalida.id];
                    if (this.estadoSalida.id === 'pendiente') {
                        params['tieneTurno'] = false;
                    }
                }
                if (this.prestacionDestino) {
                    params['prestacionDestino'] = this.prestacionDestino.id;
                }
            }
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
                case 'rechazada':

                        // Se puede dar turno?
                        this.darTurnoArrayEntrada[i] = false;

                        // Se puede visualizar?
                        this.visualizarEntrada[i] = true;

                        // Se puede auditar?
                        this.auditarArrayEntrada[i] = true;
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


    formularioSolicitud() {
        this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
        this.router.navigate([`/solicitudes/${this.tipoSolicitud}`]);
    }

    afterDetalleSolicitud(event) {
        this.showSidebar = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
    }

    returnAuditoria(event) {
        this.showAuditar = false;
        this.showSidebar = false;
        const statuses = ['pendiente', 'asignada', 'rechazada', 'referida'];
        if (event.status !== this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length) {
            let patch: any;

            if (event.status !== 3) {
                patch = {
                    op: 'estadoPush',
                    estado: { tipo: statuses[event.status], observaciones: event.observaciones }
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

            } else {
                patch = {
                    op: 'referir',
                    estado: event.estado,
                    observaciones: event.observaciones,
                    organizacion: event.organizacion,
                    profesional: event.profesional,
                    tipoPrestacion: event.prestacion
                };
            }

            this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                respuesta => this.cargarSolicitudes()
            );
        }
    }

    returnAnular(event) {
        this.showAnular = false;
        this.showSidebar = false;
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
                    respuesta => this.cargarSolicitudes()
                );
            }
        }
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.buscarSolicitudes();
        }
    }
    returnCitar(event) {
        this.showCitar = false;
        this.showSidebar = false;
        if (event.status === false) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'citar',
                    estado: {
                        tipo: 'pendiente',
                        observaciones: event.motivo
                    }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => this.cargarSolicitudes()
                );
            }
        }
    }

    routeTo(action, id) {
        if (id) {
            this.router.navigate(['rup/' + action + '/', id]);
        } else {
            this.router.navigate(['rup/' + action]);
        }
    }

    setRouteToParams(params) {
        this.routeToParams = params;
    }

    preAccesoHuds(motivoAccesoHuds) {
        if (motivoAccesoHuds) {
            if (!this.accesoHudsPaciente && !this.accesoHudsPrestacion && this.routeToParams && this.routeToParams[0] === 'huds') {
                // Se esta accediendo a 'HUDS DE UN PACIENTE'
                window.sessionStorage.setItem('motivoAccesoHuds', motivoAccesoHuds);
            } else {
                if (this.accesoHudsPaciente) {
                    this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, this.accesoHudsPaciente, motivoAccesoHuds, this.auth.profesional, this.accesoHudsTurno, this.accesoHudsPrestacion).subscribe(hudsToken => {
                        // se obtiene token y loguea el acceso a la huds del paciente
                        window.sessionStorage.setItem('huds-token', hudsToken.token);
                        this.routeToParams = [];
                        this.accesoHudsPaciente = null;
                        this.accesoHudsTurno = null;
                        this.accesoHudsPrestacion = null;
                    });
                }

            }
            this.routeTo(this.routeToParams[0], (this.routeToParams[1]) ? this.routeToParams[1] : null);

        }
        this.showModalMotivo = false;
    }

    setAccesoHudsParams(paciente, turno, prestacion) {
        this.accesoHudsPaciente = paciente;
        this.accesoHudsTurno = turno;
        this.accesoHudsPrestacion = prestacion;
        this.showModalMotivo = true;
    }

    returnPrestacion(event) {
        this.showIniciarPrestacion = false;
        this.showSidebar = false;
        if (event.status === false) {
            let solicitud = event.prestacionSeleccionada;
            this.plex.confirm('Paciente: <b>' + solicitud.paciente.apellido + ', ' + solicitud.paciente.nombre + '.</b><br>Prestación: <b>' + solicitud.solicitud.tipoPrestacion.term + '</b>', '¿Está seguro de querer iniciar una pestación?').then(confirmacion => {
                if (confirmacion) {
                    let obraSocialPaciente;
                    this.osService.getFinanciadorPacienteCache().subscribe((financiador) => obraSocialPaciente = financiador);
                    if (solicitud.solicitud.tipoPrestacion) {
                        let conceptoSnomed = solicitud.solicitud.tipoPrestacion;
                        let nuevaPrestacion;
                        nuevaPrestacion = {
                            paciente: solicitud.paciente,
                            solicitud: {
                                fecha: event.fecha,
                                tipoPrestacion: conceptoSnomed,
                                // profesional logueado
                                profesional:
                                {
                                    id: this.auth.profesional, nombre: this.auth.usuario.nombre,
                                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                                },
                                // organizacion desde la que se solicita la prestacion
                                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                            },
                            ejecucion: {
                                fecha: event.fecha,
                                registros: [],
                                // organizacion desde la que se solicita la prestación
                                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
                            },
                            estados: {
                                fecha: new Date(),
                                tipo: 'ejecucion'
                            }
                        };
                        if (solicitud.paciente) {
                            nuevaPrestacion.paciente['_id'] = solicitud.paciente.id;
                            const token = this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, solicitud.paciente, 'Fuera de agenda', this.auth.profesional, null, solicitud.solicitud.tipoPrestacion.id);
                            const nuevaPrest = this.servicioPrestacion.post(nuevaPrestacion);
                            const res = concat(token, nuevaPrest);

                            res.subscribe(input => {
                                if (input.token) {
                                    // se obtuvo token y loguea el acceso a la huds del paciente
                                    window.sessionStorage.setItem('huds-token', input.token);
                                } else {
                                    if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                                        let patch = {
                                            op: 'estadoPush',
                                            estado: {
                                                tipo: 'validada',
                                                observaciones: event.motivo
                                            }
                                        };
                                        this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                                            () => this.router.navigate(['/rup/ejecucion', input.id])
                                        );
                                    }
                                }
                            }, (err) => this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err));
                        } else {
                            this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                                if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                                    let patch = {
                                        op: 'estadoPush',
                                        estado: {
                                            tipo: 'validada',
                                            observaciones: event.motivo
                                        }
                                    };
                                    this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                                        () => this.router.navigate(['/rup/ejecucion', prestacion.id])
                                    );
                                }
                            }, (err) => this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err));
                        }
                    }
                } else {
                    return false;
                }
            });
        }
    }

}
