import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cacheStorage, Unsubscribe } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin as observableForkJoin, Subscription, switchMap } from 'rxjs';
import { ITurno } from 'src/app/interfaces/turnos/ITurno';
import { SnomedService } from '../../../../apps/mitos';
import { TurneroService } from '../../../../apps/turnero/services/turnero.service';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { WebSocketService } from '../../../../services/websocket.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { HUDSService } from '../../services/huds.service';
import { ServicioIntermedioService } from '../../services/servicio-intermedio.service';
import { EstadosAgenda } from './../../../../components/turnos/enums';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
import { IMotivoAcceso } from '../../interfaces/IMotivoAcceso';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html',
    styleUrls: [
        'puntoInicio.scss',
    ],
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

    public servicioSelected: any;
    public servicioIntermedio: any[] = [];
    public servicioIntermedioListado: any[] = [];
    public servicioIntermedioItems: any[] = [];
    public servicioIntermedioItemsFiltrados: any[] = [];

    // Tipos de prestacion que el usuario tiene permiso
    private tiposPrestacion: any = [];
    // Prestaciones que están fuera de la agenda
    public fueraDeAgenda: any = [];
    // estados a utilizarse en la agenda
    public estadosAgenda = EstadosAgenda;
    // habilita la busqueda del paciente
    public buscandoPaciente = false;

    public llamandoTurno = false;
    public volverALlamar = false;
    public verFueraAgenda = false;
    public tipoPrestacion;

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
    public motivoVerContinuarPrestacion = 'continuidad';
    public routeToParams = [];
    public accesoHudsPrestacion = null;
    public prestacionNominalizada;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;
    public puedeDarSobreturno: Boolean;
    public tieneAccesoHUDS: Boolean;
    public matchPaciente: Boolean = true;
    public prestacionesValidacion = this.auth.getPermissions('rup:validacion:?');
    public permisoServicioIntermedio = this.auth.getPermissions('rup:servicio-intermedio:?');
    public showSidebar = false;

    prestacionPendiente: IPrestacion;
    turno: ITurno;

    constructor(
        private router: Router,
        private plex: Plex,
        public auth: Auth,
        private hudsService: HUDSService,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        public serviceTurno: TurnoService,
        public snomed: SnomedService,
        public servicioTurnero: TurneroService,
        public ws: WebSocketService,
        private conceptosTurneablesService: ConceptosTurneablesService,
        private servicioIntermedioService: ServicioIntermedioService,
        private location: Location,
        public motivosHudsService: MotivosHudsService

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
                this.servicioIntermedioService.getAll().subscribe(servicios => {
                    this.servicioIntermedio = servicios;
                    this.actualizar();
                });
            });
        }

        this.ws.connect();
        this.servicioPrestacion.notificaRuta({ nombre: 'Punto de Inicio', ruta: 'rup' });
        this.servicioTurnero.get({ 'fields': 'espaciosFisicos.id' }).pipe(
            cacheStorage({ key: 'punto-inicio-pantallas', until: this.auth.session(true) })
        ).subscribe((pantallas) => {
            this.espaciosFisicosTurnero = pantallas.reduce((listado, p) => listado.concat(p.espaciosFisicos), []).map((espacio: any) => {
                return espacio.id;
            });
        });
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    toogleSidebar(value: boolean) {
        this.showSidebar = value;
        this.tipoPrestacion = null;
        this.verFueraAgenda = false;
    }

    actualizareleccionada(id: number) {
        this.agendaSeleccionada = this.agendas.find(agenda => agenda.id === id);
    }

    /**
     * Actualiza el listado de agendas y prestaciones
     */

    // tieneTurnosAsignados: true,
    actualizar() {
        this.cancelarDacionTurno();

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
                tipoPrestaciones: this.tiposPrestacion.map(t => t.id)
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

        this.lastRequest = observableForkJoin(requests).subscribe((data: any[]) => {
            this.agendas = data[0];
            this.prestaciones = data[1];
            this.servicioIntermedioItems = data[2] || [];

            if (this.agendas.length) {

                // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
                this.agendas.forEach(agenda => {
                    this.cargarPrestacionesTurnos(agenda);
                    this.getCantidadPacientes(agenda);
                });

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
                this.actualizareleccionada(this.agendaSeleccionada?.id);
            }

            this.servicioIntermedioListado = this.servicioIntermedioItems.reduce((acc, curr) => {
                const serId = curr.servicioIntermedioId;
                const servicioDefinition = this.servicioIntermedio.find(s => s.id === serId);
                const servicioItem = acc.find(s => s.id === serId);
                if (servicioItem) {
                    servicioItem.total += 1;
                } else {
                    acc.push({
                        id: servicioDefinition.id,
                        nombre: servicioDefinition.nombre,
                        total: 1
                    });
                }
                return acc;
            }, []);
        });
    }

    chequearMultiprestacion(id) {
        const prestacion = this.tiposPrestacion.find(p => p.id === id);
        if (prestacion?.multiprestacion?.length >= 1) {
            const prestacionHijo = this.tiposPrestacion.find(p => prestacion.multiprestacion.find(concepto => concepto.conceptId === p.conceptId));
            if (prestacionHijo) {
                prestacionHijo['esMultiprestacion'] = true;
            }
            return prestacionHijo;
        }
        return prestacion;
    }
    /**
     * Filtra el listado de agendas y prestaciones
     */
    filtrar() {
        this.stopAgendaRefresh();
        this.cancelarDacionTurno();
        // filtrar solo por las prestaciones que el profesional tenga disponibles
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
            const agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    const lengthBloques = this.agendas[indexAgenda]?.bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

                        const _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
                            return (t.tipoPrestacion && t.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                        });

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    }
                }
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                const _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.solicitud.tipoPrestacion && p.solicitud.tipoPrestacion.conceptId === this.prestacionSeleccion.conceptId);
                });

                this.fueraDeAgenda = _turnos;
            }
        }

        this.matchPaciente = true;
        if (typeof this.paciente !== 'undefined' && this.paciente) {
            this.matchPaciente = false;

            const search = this.paciente.toLowerCase();

            const filtroAgendas = [];
            // buscamos el paciente en los turnos de la agenda
            const agendasLength = this.agendas.length;
            if (agendasLength) {

                for (let indexAgenda = 0; indexAgenda < agendasLength; indexAgenda++) {

                    const lengthBloques = this.agendas[indexAgenda]?.bloques.length;
                    for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {
                        const _turnos = [...this.agendas[indexAgenda].bloques[indexBloque].turnos, ...this.agendas[indexAgenda]?.sobreturnos];

                        const _filtros = _turnos.filter(t => {
                            let nombreCompleto = '';
                            if (t.paciente && t.paciente.id) {
                                nombreCompleto = t.paciente.apellido + ' ' + t.paciente.nombre;
                                if (!t.paciente.documento) {
                                    t.paciente.documento = '';
                                }
                            }
                            return (t.paciente && t.paciente.id &&
                                (nombreCompleto.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.nombre.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                                    || t.paciente.documento.toLowerCase().indexOf(search) >= 0)
                            );
                        });

                        this.matchPaciente = this.matchPaciente || _filtros.length > 0;

                        if (_filtros.length) {
                            filtroAgendas.push(this.agendas[indexAgenda]);
                        }

                        this.agendas[indexAgenda].bloques[indexBloque].turnos = _filtros;
                    }
                }

                this.agendas = filtroAgendas;
            }

            // buscamos el paciente en los turnos fuera de agenda
            if (this.fueraDeAgenda) {
                const _turnos = this.fueraDeAgenda.filter(p => {
                    return (p.paciente &&
                        (p.paciente.nombre.toLowerCase().indexOf(search) >= 0 || p.paciente.apellido.toLowerCase().indexOf(search) >= 0
                            || p.paciente.documento.toLowerCase().indexOf(search) >= 0));
                });

                this.fueraDeAgenda = _turnos;
            }
        }


        if (this.agendas.length) {
            this.cargarTurnos(this.agendas[0]);
            this.intervalAgendaRefresh();
            this.volverALlamar = false;
        }

    }

    /**
     * Navega para crear una nueva prestación
     */
    crearPrestacion(opcion: string): void {
        this.showSidebar = true;
        this.tipoPrestacion = opcion;
        this.verFueraAgenda = true;
    }

    ocultarCrearPrestacion() {
        this.showSidebar = this.agendas.length > 0;
        this.tipoPrestacion = null;
        this.verFueraAgenda = false;
    }

    /**
    * Navega para ver seleccionar un paciente y ver la huds
    */
    verHuds() {
        this.router.navigate(['/huds']);
    }

    volver() {
        this.location.back();
    }

    cargarSolicitudes() {
        const params = {
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

    iniciarPrestacion(turno) {
        const paciente = turno.paciente;
        const snomedConcept = this.chequearMultiprestacion(turno.tipoPrestacion.id); // llamar a metodo y recorrer prestaciones;
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
                    `Paciente: <b> ${paciente.apellido}, ${paciente.alias || paciente.nombre}.</b><br>Prestación: <b>${snomedConcept.term}</b>`,
                    '¿Iniciar Prestación?'
                ).then(confirmacion => {
                    if (confirmacion) {
                        if (pendientes.length) {
                            const pretacionPendiente = pendientes[0];
                            this.ejecutarPrestacionPendiente(pretacionPendiente, turno).subscribe(() => {
                                if (this.tieneAccesoHUDS) {
                                    const token = this.motivosHudsService.getMotivo('rup-inicio-prestacion').pipe(
                                        switchMap(motivoH => {
                                            const paramsToken = {
                                                usuario: this.auth.usuario,
                                                organizacion: this.auth.organizacion,
                                                paciente: paciente,
                                                motivo: motivoH[0].key,
                                                profesional: this.auth.profesional,
                                                idTurno: turno.id,
                                                idPrestacion: snomedConcept._id
                                            };
                                            return this.hudsService.generateHudsToken(paramsToken);
                                        }));
                                    token.subscribe((husdTokenRes) => {
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
                                    const token = this.motivosHudsService.getMotivo('rup-inicio-prestacion').pipe(
                                        switchMap(motivoH => {
                                            const paramsToken = {
                                                usuario: this.auth.usuario,
                                                organizacion: this.auth.organizacion,
                                                paciente: paciente,
                                                motivo: motivoH[0].key,
                                                profesional: this.auth.profesional,
                                                idTurno: turno.id,
                                                idPrestacion: snomedConcept._id
                                            };
                                            return this.hudsService.generateHudsToken(paramsToken);
                                        }));

                                    token.subscribe((husdTokenRes) => {
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

    invalidarPrestacion(prestacion, tipo) {
        const data = {
            idAgenda: this.agendaSeleccionada.id,
            idTurno: prestacion.solicitud.turno,
            tipoTurno: tipo
        };
        this.plex.confirm('¿Está seguro que desea invalidar esta prestación?').then(confirmacion => {
            if (confirmacion) {
                this.servicioPrestacion.invalidarPrestacion(prestacion, data).subscribe(() => this.actualizar());
            }
        });
    }

    registrarInasistencia(paciente, agenda: IAgenda = null, turno, operacion) {
        const msg = operacion === 'noAsistio' ?
            `¿Está seguro que desea registrar la inasistencia del paciente: <b> ${paciente.apellido} ${paciente.alias || paciente.nombre} </b> ?` :
            '¿Está seguro que desea revertir los cambios?';

        this.plex.confirm(msg).then(confirmacion =>
            confirmacion ? this.servicioAgenda.patch(agenda.id, { op: operacion, turnos: [turno] }).subscribe(() => {
                this.actualizar();
            }) : false
        );
    }


    iniciarPrestacionNoNominalizada(snomedConcept, turno) {
        this.plex.confirm('</b><br>Prestación: <b>' + snomedConcept.term + '</b>', '¿Crear Prestación?').then(confirmacion => {
            if (confirmacion) {
                const fechaPrestacion = this.agendaSeleccionada.dinamica ? this.servicioPrestacion.getFechaPrestacionTurnoDinamico(turno.horaInicio) : turno.horaInicio;
                this.servicioPrestacion.crearPrestacion(null, snomedConcept, 'ejecucion', fechaPrestacion, turno.id).subscribe(prestacion => {
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

        const lengthBloques = agenda.bloques.length;
        for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {

            agenda.bloques[indexBloque].turnos.filter(t => {
                total += (t.paciente && t.paciente.id) ? 1 : 0;
            });
        }
        if (agenda.sobreturnos && agenda.sobreturnos.length > 0) {
            total = total + agenda.sobreturnos.length;
        }

        agenda['cantidadPacientes'] = total;

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
        const existe = this.tiposPrestacion.find(tp => tp.id === turno.tipoPrestacion?.id);
        if (turno.prestaciones[0]) {
            const permisoValidar = this.prestacionesValidacion.some(tt => tt === turno.prestaciones[0].solicitud.tipoPrestacion.id);
            const estado = turno.prestaciones[0].estados[turno.prestaciones[0].estados.length - 1];
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

    selectAgenda(agenda: any) {
        this.agendaSeleccionada = agenda;
    }

    cargarTurnos(agenda, servicio = null) {
        this.reloadPuedeDarSobreturno(agenda);
        this.turno = null;
        this.prestacionPendiente = null;
        this.cancelarDacionTurno();
        this.intervalAgendaRefresh();
        if (agenda === 'servicio-intermedio') {
            this.servicioSelected = servicio;
            this.servicioIntermedioItemsFiltrados = this.servicioIntermedioItems.filter(prestacion => prestacion.servicioIntermedioId === servicio.id);
        } else {
            this.servicioSelected = null;
        }
    }

    reloadPuedeDarSobreturno(agenda) {
        const esDeHoy = moment().isSame(agenda.horaInicio, 'day');
        const esNominalizadaNoDinamica = !agenda.dinamica && agenda.nominalizada;
        const esDelUsuario = agenda?.profesionales?.some(p => p.id === this.auth.profesional);
        this.puedeDarSobreturno = esDeHoy && esNominalizadaNoDinamica && esDelUsuario;
    }

    @Unsubscribe()
    reloadAgenda() {
        return this.agendaSeleccionada.id ? observableForkJoin([
            this.servicioAgenda.getById(this.agendaSeleccionada.id),
        ]).subscribe(data => {
            const agenda = data[0];
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
            tipoPrestaciones: this.cargarTiposPrestacion()
        });
    }

    getDuracionAgenda(agenda) {
        const inicio = moment(agenda.horaInicio);
        const fin = moment(agenda.horaFin);
        const duracion = moment.duration(inicio.diff(fin));

        return -duracion.hours() + ' hs. ' + -duracion.minutes() + ' min.';
    }

    cargarTiposPrestacion() {
        const tiposPrestaciones: string[] = this.tiposPrestacion.map(t => t.conceptId);
        const prestacionMultiple = this.tiposPrestacion.filter(tipo => tipo.multiprestacion?.length > 0);
        return tiposPrestaciones.concat(
            ...prestacionMultiple.map(t => t.multiprestacion.map(c => c.conceptId))
        );
    }

    chequearPrestacion(turno) {
        const prestacion = this.tiposPrestacion.find(tipoPrestacion => tipoPrestacion.conceptId === turno.tipoPrestacion?.conceptId);

        if (prestacion && prestacion.multiprestacion) {
            const prestacionHijo = this.chequearMultiprestacion(turno.tipoPrestacion.id);
            if (!prestacionHijo) {
                return false;
            }
            if (!(turno.prestaciones?.length === prestacion.multiprestacion?.length)) {
                return turno.prestaciones?.find(p => p.solicitud.tipoPrestacion.conceptId === prestacionHijo.conceptId);
            }
            return turno.prestaciones.find(p => p.solicitud.tipoPrestacion.conceptId === prestacionHijo.conceptId);
        }
        return turno.prestaciones ? turno.prestaciones[0] : null;
    }

    chequearEstados(turno, estado) {
        const prestacion = this.chequearPrestacion(turno);
        if (prestacion) {
            return prestacion.estados[prestacion.estados.length - 1].tipo === estado;
        }
    }

    cargarPrestacionesTurnos(agenda) {
        // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
        agenda['cantidadTurnos'] = 0;
        agenda.bloques.forEach(bloques => {
            agenda['cantidadTurnos'] += bloques.turnos.length;
            // loopeamos los turnos dentro de los bloques
            bloques.turnos.forEach(turno => {
                const prestaciones = this.prestaciones.filter(prestacion => {
                    return (prestacion.solicitud.turno && prestacion.solicitud.turno === turno.id);
                });
                // asignamos la prestaciones al turno
                turno['prestaciones'] = prestaciones;
                if (turno.paciente && turno.paciente.carpetaEfectores) {
                    (turno.paciente.carpetaEfectores as any) = turno.paciente.carpetaEfectores.filter((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                }

                if (turno.estado === 'asignado' || turno.estado === 'suspendido' || agenda.tipoPrestaciones[0].noNominalizada) {

                    turno.botonera = {
                        huds: turno.paciente?.id && this.tieneAccesoHUDS,
                        iniciar: !this.esFutura(agenda) && agenda.estado !== 'auditada' && turno.estado !== 'suspendido' && (turno.paciente || agenda.tipoPrestaciones[0].noNominalizada) && !this.chequearPrestacion(turno) && this.tienePermisos(turno) && this.verificarAsistencia(turno),
                        iniciarDisabled: this.esFutura(agenda) && agenda.estado !== 'auditada' && turno.estado !== 'suspendido' && (turno.paciente || agenda.tipoPrestaciones[0].noNominalizada) && !this.chequearPrestacion(turno) && this.verificarAsistencia(turno),
                        continuar: (turno.paciente || agenda.tipoPrestaciones[0].noNominalizada) && turno.estado !== 'suspendido' && this.chequearPrestacion(turno) && this.chequearEstados(turno, 'ejecucion') && this.tienePermisos(turno) && this.verificarAsistencia(turno),
                        resumen: (turno.paciente || agenda.tipoPrestaciones[0].noNominalizada) && turno.estado !== 'suspendido' && this.chequearPrestacion(turno) && this.chequearEstados(turno, 'validada') && this.tienePermisos(turno),
                        inasistencia: !turno.asistencia && !this.esFutura(agenda) && agenda.estado !== 'auditada' && turno.estado !== 'suspendido' && turno.paciente && (!this.chequearPrestacion(turno) || this.chequearEstados(turno, 'ejecucion')),
                        anular: turno.paciente && turno.estado !== 'suspendido' && this.chequearPrestacion(turno) && this.chequearEstados(turno, 'ejecucion') && this.tienePermisos(turno) && this.verificarAsistencia(turno)
                    };
                }
            });
        });

        // busquemos si hay sobreturnos para vincularlos con la prestacion correspondiente
        agenda.sobreturnos = agenda.sobreturnos.filter(s => s.paciente);
        if (agenda.sobreturnos) {
            agenda.sobreturnos.forEach(sobreturno => {
                const prestaciones = this.prestaciones.filter(prestacion => {
                    return (prestacion.solicitud.turno && prestacion.solicitud.turno === sobreturno.id);
                });
                // asignamos la prestacion al turno
                sobreturno['prestaciones'] = prestaciones;
                if (sobreturno.paciente && sobreturno.paciente.carpetaEfectores) {
                    (sobreturno.paciente.carpetaEfectores as any) = sobreturno.paciente.carpetaEfectores.filter((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                }

                sobreturno.botonera = {
                    huds: sobreturno.paciente.id && this.tieneAccesoHUDS,
                    iniciar: !this.esFutura(agenda) && agenda.estado !== 'auditada' && sobreturno.estado !== 'suspendido' && sobreturno.paciente && !this.chequearPrestacion(sobreturno) && this.tienePermisos(sobreturno) && this.verificarAsistencia(sobreturno),
                    iniciarDisabled: this.esFutura(agenda) && agenda.estado !== 'auditada' && sobreturno.estado !== 'suspendido' && sobreturno.paciente && !this.chequearPrestacion(sobreturno) && this.verificarAsistencia(sobreturno),
                    continuar: sobreturno.paciente && sobreturno.estado !== 'suspendido' && this.chequearPrestacion(sobreturno) && this.chequearEstados(sobreturno, 'ejecucion') && this.tienePermisos(sobreturno) && this.verificarAsistencia(sobreturno),
                    resumen: sobreturno.paciente && sobreturno.estado !== 'suspendido' && this.chequearPrestacion(sobreturno) && this.chequearEstados(sobreturno, 'validada') && this.tienePermisos(sobreturno),
                    inasistencia: !sobreturno.asistencia && !this.esFutura(agenda) && agenda.estado !== 'auditada' && sobreturno.estado !== 'suspendido' && sobreturno.paciente && (!this.chequearPrestacion(sobreturno) || this.chequearEstados(sobreturno, 'ejecucion')),
                    anular: sobreturno.paciente && sobreturno.estado !== 'suspendido' && this.chequearPrestacion(sobreturno) && this.chequearEstados(sobreturno, 'ejecucion') && this.tienePermisos(sobreturno) && this.verificarAsistencia(sobreturno)
                };
            });
        }
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
        const existeEFisico = agenda && agenda.espacioFisico && agenda.espacioFisico.id && (this.espaciosFisicosTurnero.findIndex((e) => e === agenda.espacioFisico.id) >= 0);
        const validaTurno = turno.paciente && turno.paciente.id && this.verificarAsistencia(turno) && (turno.estado !== 'suspendido');
        const validaPrestacion = (!turno.prestaciones || (turno.prestaciones.length && turno.prestaciones[0].estadoActual.tipo === 'pendiente'));
        return existeEFisico && validaTurno && validaPrestacion;
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
        const fechaAgenda = moment(agenda.horaInicio).startOf('day');
        const fechaActual = moment().endOf('day');
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

    esHoy() {
        const fechaAgenda = moment(this.agendaSeleccionada?.horaInicio).format('YYYY-MM-DD');
        return ((this.agendaSeleccionada?.dinamica && moment(moment().format('YYYY-MM-DD')).isSame(fechaAgenda, 'day')) && (this.agendaSeleccionada.cupo && this.agendaSeleccionada.cupo !== 0));
    }
    verificarBloque() {
        return (this.agendaSeleccionada && this.agendaSeleccionada !== 'fueraAgenda' && this.agendaSeleccionada !== 'servicio-intermedio' && (!this.paciente || (!this.agendaSeleccionada.tipoPrestaciones[0].noNominalizada && this.getCantidadPacientes(this.agendaSeleccionada))));
    }

    verificarTurno(turno) {
        return turno?.paciente && turno.asistencia && turno.estado !== 'suspendido';
    }

    verTipoPrestacion(turno) {
        return turno?.paciente?.id && turno.tipoPrestacion && this.agendaSeleccionada?.tipoPrestaciones?.length > 1;
    }

    cancelarDacionTurno() {
        this.buscandoPaciente = false;
    }

    ejecutarPrestacion2(prestacion) {
        this.prestacionPendiente = prestacion;
        this.turno = null;
    }

    ejecutarPrestacion(prestacion) {
        this.ejecutarPrestacionPendiente(prestacion).subscribe(() => {
            if (this.tieneAccesoHUDS) {
                const token = this.motivosHudsService.getMotivo('rup-ejecucion').pipe(
                    switchMap(motivoH => {
                        const paramsToken = {
                            usuario: this.auth.usuario,
                            organizacion: this.auth.organizacion,
                            paciente: prestacion.paciente,
                            motivo: motivoH[0].key,
                            profesional: this.auth.profesional,
                            idTurno: null,
                            idPrestacion: prestacion.id
                        };
                        return this.hudsService.generateHudsToken(paramsToken);
                    }));

                token.subscribe((husdTokenRes) => {
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
        const params: any = {
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

    preAccesoHuds(motivoAccesoHuds: IMotivoAcceso | string) {
        const motivo = (typeof motivoAccesoHuds !== 'string') ? motivoAccesoHuds?.motivo : motivoAccesoHuds;

        const doRoute = () => this.routeTo(this.routeToParams[0], (this.routeToParams[1]) ? this.routeToParams[1] : null);
        if ((this.tieneAccesoHUDS || this.motivoVerContinuarPrestacion === motivo) && motivo) {
            if (!this.tieneAccesoHUDS && (this.agendaSeleccionada?.nominalizada || this.agendaSeleccionada === 'fueraAgenda')) {
                this.accesoHudsPaciente = null;
            }
            if (!this.accesoHudsPaciente && !this.accesoHudsPrestacion && this.routeToParams && this.routeToParams[0] === 'huds') {
                // Se esta accediendo a 'HUDS DE UN PACIENTE'
                window.sessionStorage.setItem('motivoAccesoHuds', motivo);
                doRoute();
            } else if (this.accesoHudsPaciente) {
                const paramsToken = {
                    usuario: this.auth.usuario,
                    organizacion: this.auth.organizacion,
                    paciente: this.accesoHudsPaciente,
                    motivo,
                    profesional: this.auth.profesional,
                    idTurno: this.accesoHudsTurno,
                    idPrestacion: this.accesoHudsPrestacion,
                    detalleMotivo: (typeof motivoAccesoHuds !== 'string') ? motivoAccesoHuds.textoObservacion : null
                };
                this.hudsService.generateHudsToken(paramsToken).subscribe(hudsToken => {
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
            this.tieneAccesoHUDS ? this.accesoHudsPaciente = prestacion.paciente : this.accesoHudsPaciente = null;
            this.accesoHudsTurno = null;
            this.accesoHudsPrestacion = prestacion.solicitud.tipoPrestacion.id;
            this.motivosHudsService.getMotivo('continuidad').subscribe(motivoH => {
                this.preAccesoHuds(motivoH[0].key);
            });
        } else {
            this.routeTo(estado, prestacion.id);
        }
    }

    linkVideollamada(link) {
        window.open(link);
    }


    onCancelPrestacion() {
        this.turno = null;
        this.prestacionPendiente = null;
    }
}
