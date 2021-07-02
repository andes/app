import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cacheStorage, Unsubscribe } from '@andes/shared';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin as observableForkJoin, Subscription } from 'rxjs';
import { ITurno } from 'src/app/interfaces/turnos/ITurno';
import { SnomedService } from '../../../../apps/mitos';
import { TurneroService } from '../../../../apps/turnero/services/turnero.service';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { WebSocketService } from '../../../../services/websocket.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { HUDSService } from '../../services/huds.service';
import { EstadosAgenda } from './../../../../components/turnos/enums';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { PrestacionesService } from './../../services/prestaciones.service';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})
export class PuntoInicioComponent implements OnInit, OnDestroy {
    public solicitudes = [];
    // Fecha seleccionada
    public fecha: Date = new Date();
    // Lista de agendas filtradas por fecha, tipos de prestaciones permitidas, ...
    public agendas = [];
    // Agenda seleccionada
    public agendaSeleccionada;
    // Mostrar sólo mis agendas
    public filtroAgendas = {
        radio: 1
    };
    public opciones = [
        { id: 1, label: 'Mias' },
        { id: 2, label: 'Todas' }
    ];
    // Lista de prestaciones filtradas por fecha, tipos de prestaciones permitidas, ...
    public prestaciones: any = [];

    public servicioIntermedio: any = [];

    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Prestaciones que están fuera de la agenda
    public fueraDeAgenda: any = [];
    // estados a utilizarse en la agenda
    public estadosAgenda = EstadosAgenda;
    // habilita la busqueda del paciente
    public buscandoPaciente = false;

    public llamandoTurno = false;
    public volverALlamar = false;

    // FILTROS
    private agendasOriginales: any = [];
    private prestacionesOriginales: any = [];
    public prestacionSeleccion: any;
    public paciente: any;
    public ultimoLlamado: any;

    public espaciosFisicosTurnero = [];
    // ultima request que se almacena con el subscribe
    private lastRequest: Subscription;
    private interval;

    public showModalMotivo = false;
    public motivoVerContinuarPrestacion = 'Continuidad del cuidado del paciente';
    public routeToParams = [];
    public accesoHudsPrestacion = null;
    public prestacionNominalizada;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;
    public tieneAccesoHUDS: Boolean;
    public matchPaciente: Boolean = true;
    public prestacionesValidacion = this.auth.getPermissions('rup:validacion:?');

    public permisoServicioIntermedio = this.auth.getPermissions('rup:servicio-intermedio:?');

    constructor(
        private router: Router,
        private plex: Plex,
        public auth: Auth,
        private hudsService: HUDSService,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        public servicePaciente: PacienteService,
        public serviceTurno: TurnoService,
        public snomed: SnomedService,
        public servicioTurnero: TurneroService,
        public ws: WebSocketService,
        private conceptosTurneablesService: ConceptosTurneablesService
    ) { }

    ngOnDestroy() {
        this.stopAgendaRefresh();
        this.ws.disconnect();
    }

    ngOnInit() {

        // Verificamos permisos globales para rup, si no posee realiza redirect al home
        if (!this.auth.getPermissions('rup:?').length) {
            this.redirect('inicio');
        }
        if (!this.auth.profesional) {
            this.redirect('inicio');
        } else {
            this.tieneAccesoHUDS = this.auth.check('huds:visualizacionHuds');
            this.plex.updateTitle([{
                route: '/',
                name: 'ANDES'
            }, {
                name: 'RUP'
            }]);
            this.conceptosTurneablesService.getByPermisos('rup:tipoPrestacion:?').subscribe(data => {
                if (data && data.length <= 0) {
                    this.redirect('inicio');
                }
                this.tiposPrestacion = data;
                this.actualizar();
            });
        }

        this.ws.connect();
        this.servicioPrestacion.notificaRuta({ nombre: 'Punto de Inicio', ruta: 'rup' });
        this.servicioTurnero.get({ 'fields': 'espaciosFisicos.id' }).pipe(
            cacheStorage({ key: 'punto-inicio-pantallas', until: this.auth.session(true) })
        ).subscribe((pantallas) => {
            this.espaciosFisicosTurnero = pantallas.reduce((listado, p) => listado.concat(p.espaciosFisicos), []).map((espacio: any) => { return espacio.id; });
        });
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /**
     * Actualiza el listado de agendas y prestaciones
     */

    // tieneTurnosAsignados: true,
    actualizar() {
        this.cancelarDinamica();

        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }

        const requests = [
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: moment(this.fecha).isValid() ? moment(this.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.fecha).isValid() ? moment(this.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada', 'pendienteAsistencia', 'pendienteAuditoria', 'auditada'],
                tipoPrestaciones: this.auth.getPermissions('rup:tipoPrestacion:?')
            }),
            // Prestaciones
            this.getPrestaciones(),
        ];
        if (this.permisoServicioIntermedio.length > 0) {
            requests.push(
                this.servicioPrestacion.getServicioIntermedios({
                    fecha: moment(this.fecha).format('YYYY-MM-DD')
                })
            );
        }

        this.lastRequest = observableForkJoin(requests).subscribe(data => {
            this.agendas = data[0];
            this.prestaciones = data[1];
            this.servicioIntermedio = data[2] || [];

            if (this.agendas.length) {

                // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
                this.agendas.forEach(agenda => this.cargarPrestacionesTurnos(agenda));
            }

            this.agendasOriginales = JSON.parse(JSON.stringify(this.agendas));
            // buscamos las que estan fuera de agenda para poder listarlas:
            // son prestaciones sin turno creadas en la fecha seleccionada en el filtro
            this.fueraDeAgenda = this.prestaciones.filter(p => {
                const puedeValidar = this.prestacionesValidacion.some(tt => tt === p.solicitud.tipoPrestacion.id);
                const estadoActual = p.estadoActual;
                const creadaPorMi = estadoActual.createdBy.username === this.auth.usuario.username;
                const esHoy = moment(p.ejecucion.fecha).isBetween(this.fecha, this.fecha, 'day', '[]');

                return (!p.solicitud.turno && esHoy
                    && (creadaPorMi || puedeValidar)
                    && (estadoActual.tipo === 'ejecucion' || estadoActual.tipo === 'validada'));
            });

            // agregamos el original de las prestaciones que estan fuera
            // de agenda para poder reestablecer los filtros
            this.prestacionesOriginales = JSON.parse(JSON.stringify(this.fueraDeAgenda));
            // filtramos los resultados
            this.filtrar();

            if (this.agendas.length) {
                this.cargarTurnos(this.agendas[0]);
            }
        });
    }

    /**
     * Filtra el listado de agendas y prestaciones
     */
    filtrar() {
        this.stopAgendaRefresh();
        this.cancelarDinamica();
        // filtrar solo por las prestaciones que el profesional tenga disponibles
        this.agendaSeleccionada = null;
        this.agendas = JSON.parse(JSON.stringify(this.agendasOriginales));
        // this.agendas = this.agendasOriginales;
        this.fueraDeAgenda = this.prestacionesOriginales;

        // filtramos por agendas propias o todas menos las propias
        if (this.filtroAgendas.radio === 1) {
            this.agendas = this.agendas.filter(agenda => {
                return (agenda.profesionales && agenda.profesionales.find(profesional => {
                    return (profesional.id === this.auth.profesional);
                }));
            });
        }

        // por tipo de prestación
        if (this.prestacionSeleccion) {
            this.agendas = this.agendas.filter(agenda => (agenda.tipoPrestaciones.find(tipoPrestacion => tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId)));
            let agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    let lengthBloques = this.agendas[indexAgenda].bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

                        let _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
                            return (t.tipoPrestacion && t.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                        });

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    }
                }
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                let _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.solicitud.tipoPrestacion && p.solicitud.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                });

                this.fueraDeAgenda = _turnos;
            }
        }

        this.matchPaciente = true;
        if (typeof this.paciente !== 'undefined' && this.paciente) {
            this.matchPaciente = false;

            let search = this.paciente.toLowerCase();

            // buscamos el paciente en los turnos de la agenda
            let agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    let lengthBloques = this.agendas[indexAgenda].bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

                        let _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
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

                        this.matchPaciente = this.matchPaciente || _turnos.length;

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    }
                }
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                let _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.paciente &&
                        (p.paciente.nombre.toLowerCase().indexOf(search) >= 0 || p.paciente.apellido.toLowerCase().indexOf(search) >= 0
                            || p.paciente.documento.toLowerCase().indexOf(search) >= 0));
                });

                this.fueraDeAgenda = _turnos;
            }
        }


        if (this.agendas.length) {
            this.agendaSeleccionada = this.agendas[0];
            this.intervalAgendaRefresh();
            this.volverALlamar = false;
        }

    }

    /**
     * Navega para crear una nueva prestación
     */
    crearPrestacion(opcion: string): void {
        this.router.navigate(['/rup/crear', opcion]);
    }
    /**
    * Navega para ver seleccionar un paciente y ver la huds
    */
    verHuds() {
        this.router.navigate(['/huds']);
    }

    cargarSolicitudes() {
        let params = {
            ordenFechaDesc: true,
            estados: ['asignada'],
            idProfesional: this.auth.profesional
        };
        return this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
            this.solicitudes = resultado.filter((prest: any) => prest.solicitud.organizacion ? (this.auth.organizacion.id === prest.solicitud.organizacion.id) : false);
        }, err => {
            if (err) {
            }
        });
    }

    irASolicitudes() {
        this.router.navigate(['/solicitudes/asignadas']);
    }

    prestacionPendiente: IPrestacion;
    turno: ITurno;

    iniciarPrestacion(turno) {
        const paciente = turno.paciente;
        const snomedConcept = turno.tipoPrestacion;
        this.servicioPrestacion.get({
            organizacion: this.auth.organizacion.id,
            turnos: [turno.id],
            estado: 'pendiente',
            ambitoOrigen: 'ambulatorio'
        }).subscribe((pendientes) => {
            if (pendientes.length && pendientes[0].inicio === 'servicio-intermedio') {
                const pretacionPendiente = pendientes[0];
                this.prestacionPendiente = pretacionPendiente;
                this.turno = turno;
            } else {
                this.plex.confirm(
                    `Paciente: <b> ${paciente.apellido}, ${paciente.nombre}.</b><br>Prestación: <b>${snomedConcept.term}</b>`,
                    '¿Iniciar Prestación?'
                ).then(confirmacion => {
                    if (confirmacion) {
                        if (pendientes.length) {
                            const pretacionPendiente = pendientes[0];

                            this.ejecutarPrestacionPendiente(pretacionPendiente, turno).subscribe(() => {
                                if (this.tieneAccesoHUDS) {
                                    this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, snomedConcept.term, this.auth.profesional, turno.id, snomedConcept._id).subscribe((husdTokenRes) => {
                                        if (husdTokenRes.token) {
                                            window.sessionStorage.setItem('huds-token', husdTokenRes.token);
                                            this.routeTo('ejecucion', pretacionPendiente.id); // prestacion pendiente
                                        }
                                    });
                                } else {
                                    this.routeTo('ejecucion', pretacionPendiente.id); // prestacion pendiente
                                }
                            });

                        } else {
                            const fechaPrestacion = this.agendaSeleccionada.dinamica ? this.servicioPrestacion.getFechaPrestacionTurnoDinamico(turno.horaInicio) : turno.horaInicio;
                            this.servicioPrestacion.crearPrestacion(paciente, snomedConcept, 'ejecucion', fechaPrestacion, turno.id).subscribe(nuevaPrestacion => {
                                if (nuevaPrestacion.error) {
                                    this.plex.info('info', nuevaPrestacion.error, 'Aviso');
                                }
                                if (this.tieneAccesoHUDS) {
                                    this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, snomedConcept.term, this.auth.profesional, turno.id, snomedConcept._id).subscribe((husdTokenRes) => {
                                        if (husdTokenRes.token) {
                                            window.sessionStorage.setItem('huds-token', husdTokenRes.token);
                                            this.routeTo('ejecucion', nuevaPrestacion.id); // prestacion
                                        }
                                    });
                                } else {
                                    this.routeTo('ejecucion', nuevaPrestacion.id); // prestacion
                                }
                            }, (err) => {
                                if (err === 'ya_iniciada') {
                                    this.plex.info('info', 'La prestación ya fue iniciada por otro profesional', 'Aviso');
                                    this.actualizar();
                                } else {
                                    this.plex.info('warning', err, 'Error');
                                }
                            });
                        }
                    } else {
                        return false;
                    }
                });
            }
        });
    }

    invalidarPrestacion(prestacion, idTurno) {
        this.plex.confirm('¿Está seguro que desea invalidar esta prestación?').then(confirmacion => {
            if (confirmacion) {
                this.servicioPrestacion.invalidarPrestacion(prestacion).subscribe(() => this.actualizar());
            }
        });
    }

    registrarInasistencia(paciente, agenda: IAgenda = null, turno, operacion) {
        const msg = operacion === 'noAsistio' ?
            `¿Está seguro que desea registrar la inasistencia del paciente: <b> ${paciente.apellido} ${paciente.nombre} </b> ?` :
            `¿Está seguro que desea revertir los cambios?`;

        this.plex.confirm(msg).then(confirmacion =>
            confirmacion ? this.servicioAgenda.patch(agenda.id, { op: operacion, turnos: [turno] }).subscribe(this.actualizar.bind(this)) : false
        );
    }


    iniciarPrestacionNoNominalizada(snomedConcept, turno) {
        this.plex.confirm('</b><br>Prestación: <b>' + snomedConcept.term + '</b>', '¿Crear Prestación?').then(confirmacion => {
            if (confirmacion) {
                const fechaPrestacion = this.agendaSeleccionada.dinamica ? this.servicioPrestacion.getFechaPrestacionTurnoDinamico(turno.horaInicio) : turno.horaInicio;
                this.servicioPrestacion.crearPrestacion(null, snomedConcept, 'ejecucion', fechaPrestacion, turno).subscribe(prestacion => {
                    this.routeTo('ejecucion', prestacion.id);
                }, (err) => {
                    if (err === 'ya_iniciada') {
                        this.plex.info('info', 'La prestación ya fue iniciada por otro profesional', 'Aviso');
                    } else {
                        this.plex.info('warning', err, 'Error');
                    }
                });
            } else {
                return false;
            }
        });
    }

    /**
     * Recorremos los bloques y los turnos de una agenda
     * y verifica si hay algun paciente agregado
     */
    getCantidadPacientes(agenda) {
        let total = 0;

        let lengthBloques = agenda.bloques.length;
        for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

            let _turnos = agenda.bloques[indexBloque].turnos.filter(t => {
                total += (t.paciente && t.paciente.id) ? 1 : 0;
            });
        }
        if (agenda.sobreturnos && agenda.sobreturnos.length > 0) {
            total = total + agenda.sobreturnos.length;
        }


        return total;
    }

    /**
     * Comprueba si el turno tiene una prestacion asociada y si ya esta en ejecucion
     * por otro profesional. En ese caso no debería poder entrar a ejecutar o validar la prestacion
     *
     * @param {*} turno
     * @returns
     * @memberof PuntoInicioComponent
     */
    tienePermisos(turno) {
        const existe = this.auth.getPermissions('rup:tipoPrestacion:?').find(permiso => (permiso === turno.tipoPrestacion._id));
        if (turno.prestacion) {
            const permisoValidar = this.prestacionesValidacion.some(tt => tt === turno.prestacion.solicitud.tipoPrestacion.id);

            const estado = turno.prestacion.estados[turno.prestacion.estados.length - 1];
            if (estado.tipo !== 'pendiente' && !(estado.createdBy.username === this.auth.usuario.username || permisoValidar)) {
                return false;
            }
        }
        return existe;
    }

    checkPuedeValidar(prestacion) {
        const miPrestacion = prestacion.estadoActual.createdBy.username === this.auth.usuario.username;
        const permisoValidar = this.prestacionesValidacion.some(tt => tt === prestacion.solicitud.tipoPrestacion.id);
        return miPrestacion || permisoValidar;
    }

    cargarTurnos(agenda) {
        this.turno = null;
        this.prestacionPendiente = null;
        this.cancelarDinamica();
        this.agendaSeleccionada = agenda ? agenda : 'fueraAgenda';
        this.intervalAgendaRefresh();
    }

    @Unsubscribe()
    reloadAgenda() {
        return this.agendaSeleccionada.id ? observableForkJoin(
            this.servicioAgenda.getById(this.agendaSeleccionada.id),
        ).subscribe(data => {
            let agenda = data[0];
            this.cargarPrestacionesTurnos(agenda);
            this.agendas[this.agendas.indexOf(this.agendaSeleccionada)] = this.agendaSeleccionada = agenda;
        }
        ) : null;
    }

    getPrestaciones() {
        return this.servicioPrestacion.get({
            fechaDesde: this.fecha ? this.fecha : new Date(),
            fechaHasta: this.fecha,
            organizacion: this.auth.organizacion.id,
            sinEstado: ['modificada', 'anulada'],
            ambitoOrigen: 'ambulatorio',
            tipoPrestaciones: this.tiposPrestacion.map(t => t.conceptId)
        });
    }

    cargarPrestacionesTurnos(agenda) {
        // if (agenda) {
        // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
        agenda['cantidadTurnos'] = 0;
        agenda.bloques.forEach(bloques => {
            agenda['cantidadTurnos'] += bloques.turnos.length;
            // loopeamos los turnos dentro de los bloques
            bloques.turnos.forEach(turno => {
                let indexPrestacion = this.prestaciones.findIndex(prestacion => {
                    return (prestacion.solicitud.turno && prestacion.solicitud.turno === turno.id);
                });
                // asignamos la prestacion al turno
                turno['prestacion'] = this.prestaciones[indexPrestacion];
                if (turno.paciente && turno.paciente.carpetaEfectores) {
                    (turno.paciente.carpetaEfectores as any) = turno.paciente.carpetaEfectores.filter((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                }

            });
        });

        // busquemos si hay sobreturnos para vincularlos con la prestacion correspondiente
        if (agenda.sobreturnos) {
            agenda.sobreturnos.forEach(sobreturno => {
                let indexPrestacion = this.prestaciones.findIndex(prestacion => {
                    return (prestacion.solicitud.turno && prestacion.solicitud.turno === sobreturno.id);
                });
                // asignamos la prestacion al turno
                sobreturno['prestacion'] = this.prestaciones[indexPrestacion];
                if (sobreturno.paciente && sobreturno.paciente.carpetaEfectores) {
                    (sobreturno.paciente.carpetaEfectores as any) = sobreturno.paciente.carpetaEfectores.filter((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                }
            });
        }
        // }
    }

    intervalAgendaRefresh() {
        this.stopAgendaRefresh();
        if (this.agendaSeleccionada && this.agendaSeleccionada !== 'fueraAgenda' && moment(this.agendaSeleccionada.horaInicio).isSame(new Date(), 'day')) {
            const timeOut = 300000; // Lapso de tiempo en que se recargara la agenda seleccionada
            this.interval = setInterval(this.reloadAgenda.bind(this), timeOut);
        }
    }

    stopAgendaRefresh() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    mostrarBotonTurnero(agenda, turno) {
        return (agenda && agenda.espacioFisico && agenda.espacioFisico.id && (this.espaciosFisicosTurnero.findIndex((e) => e === agenda.espacioFisico.id) >= 0)) && turno.paciente && turno.paciente.id && this.verificarAsistencia(turno) && (turno.estado !== 'suspendido') && (!turno.prestacion || (turno.prestacion && turno.prestacion.estados[turno.prestacion.estados.length - 1].tipo === 'pendiente'));
    }

    routeTo(action, id) {
        if (action === 'paciente') {
            this.router.navigate(['huds', 'paciente', id]);
        } else {
            if (id) {
                this.router.navigate(['rup/' + action + '/', id]);
            } else {
                this.router.navigate(['rup/' + action]);
            }
        }
    }

    llamarTurnero(turno) {
        this.llamandoTurno = true;
        this.servicioTurnero.llamar(this.agendaSeleccionada, turno);

        setTimeout(() => {
            this.llamandoTurno = false;
        }, 2200);
    }

    // Detecta si una Agenda es futura
    esFutura(agenda: IAgenda = null) {
        let fechaAgenda = moment(agenda.horaInicio).startOf('day');
        let fechaActual = moment(new Date()).endOf('day');
        return fechaAgenda.isAfter(fechaActual);
    }

    // Detecta si "hoy" es el día de la Agenda
    diaAgenda(agenda: IAgenda) {
        return moment(agenda.horaInicio).fromNow();
    }


    // buscar paciente para asigar en las agendas dinamicas
    buscarPaciente() {
        this.buscandoPaciente = true;
    }

    cancelarDinamica() {
        this.buscandoPaciente = false;
    }


    ejecutarPrestacion2(prestacion) {
        this.prestacionPendiente = prestacion;
        this.turno = null;
    }

    ejecutarPrestacion(prestacion) {
        this.ejecutarPrestacionPendiente(prestacion).subscribe(() => {
            if (this.tieneAccesoHUDS) {
                this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, prestacion.paciente, prestacion.solicitud.tipoPrestacion.term, this.auth.profesional, null, prestacion.id).subscribe((husdTokenRes) => {
                    if (husdTokenRes.token) {
                        window.sessionStorage.setItem('huds-token', husdTokenRes.token);
                        this.routeTo('ejecucion', prestacion.id); // prestacion pendiente
                    }
                });
            } else {
                this.routeTo('ejecucion', prestacion.id); // prestacion pendiente
            }
        });
    }

    /**
       * Ejecutar una prestacion que esta en estado pendiente
    */
    ejecutarPrestacionPendiente(prestacion, turno?) {
        let params: any = {
            op: 'estadoPush',
            ejecucion: {
                fecha: turno?.horaInicio || new Date(),
                registros: [],
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            },
            estado: { tipo: 'ejecucion' }
        };

        return this.servicioPrestacion.patch(prestacion.id, params);
    }

    verificarAsistencia(turno) {
        if (!turno.asistencia) {
            return true;
        } else {
            if (turno.asistencia === 'asistio') {
                return true;
            }
        }
        return false;
    }


    setRouteToParams(params) {
        this.routeToParams = params;
    }

    preAccesoHuds(motivoAccesoHuds) {
        const doRoute = () => this.routeTo(this.routeToParams[0], (this.routeToParams[1]) ? this.routeToParams[1] : null);
        if ((this.tieneAccesoHUDS || this.motivoVerContinuarPrestacion === motivoAccesoHuds) && motivoAccesoHuds) {
            if (this.prestacionNominalizada) {
                this.accesoHudsPaciente = null;
            }
            if (!this.accesoHudsPaciente && !this.accesoHudsPrestacion && this.routeToParams && this.routeToParams[0] === 'huds') {
                // Se esta accediendo a 'HUDS DE UN PACIENTE'
                window.sessionStorage.setItem('motivoAccesoHuds', motivoAccesoHuds);
                doRoute();
            } else if (this.accesoHudsPaciente) {
                this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, this.accesoHudsPaciente, motivoAccesoHuds, this.auth.profesional, this.accesoHudsTurno, this.accesoHudsPrestacion).subscribe(hudsToken => {
                    // se obtiene token y loguea el acceso a la huds del paciente
                    window.sessionStorage.setItem('huds-token', hudsToken.token);
                    doRoute();
                    this.routeToParams = [];
                    this.accesoHudsPaciente = null;
                    this.accesoHudsTurno = null;
                    this.accesoHudsPrestacion = null;
                });
            } else {
                window.sessionStorage.setItem('huds-token', null);
                doRoute();
            }

        }
        this.showModalMotivo = false;
    }

    setAccesoHudsParams(paciente, turno, prestacion) {
        this.accesoHudsPaciente = paciente;
        this.accesoHudsTurno = turno;
        this.accesoHudsPrestacion = prestacion;
        this.showModalMotivo = true;
    }

    onVerResumenClick(estado, prestacion) {
        const esPrestacionNoNominalizada = prestacion.solicitud.tipoPrestacion.noNominalizada;
        if (!esPrestacionNoNominalizada) {
            this.setRouteToParams([estado, prestacion.id]);
            this.accesoHudsPaciente = prestacion.paciente;
            this.accesoHudsTurno = null;
            this.accesoHudsPrestacion = prestacion.solicitud.tipoPrestacion.id;
            this.preAccesoHuds(this.motivoVerContinuarPrestacion);
        } else {
            this.routeTo(estado, prestacion.id);
        }
    }


    onCancelPrestacion() {
        this.turno = null;
        this.prestacionPendiente = null;
    }
}
