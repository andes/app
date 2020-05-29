import { Unsubscribe } from '@andes/shared';

import { forkJoin as observableForkJoin } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { EstadosAgenda } from './../../../../components/turnos/enums';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { SnomedService } from '../../../../apps/mitos';
import { concat } from 'rxjs';
import { HUDSService } from '../../services/huds.service';
import { TurneroService } from '../../../../apps/turnero/services/turnero.service';
import { WebSocketService } from '../../../../services/websocket.service';

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
    private interval;

    public showModalMotivo = false;
    public motivoVerContinuarPrestacion = 'Continuidad del cuidado del paciente';
    public routeToParams = [];
    public accesoHudsPrestacion = null;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        private hudsService: HUDSService,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        public servicePaciente: PacienteService,
        public serviceTurno: TurnoService,
        public snomed: SnomedService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioTurnero: TurneroService,
        public ws: WebSocketService
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

            this.plex.updateTitle([{
                route: '/',
                name: 'ANDES'
            }, {
                name: 'RUP'
            }]);

            this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
                if (data && data.length <= 0) {
                    this.redirect('inicio');
                }
                this.tiposPrestacion = data;
                localStorage.removeItem('idAgenda');
                this.actualizar();
            });
        }

        this.ws.connect();
        this.servicioTurnero.get({ 'fields': 'espaciosFisicos.id' }).subscribe((pantallas) => {
            this.espaciosFisicosTurnero = pantallas.reduce((listado, p) => listado.concat(p.espaciosFisicos), []).map((espacio: any) => { return espacio.id; });
        });
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /**
     * Actualiza el listado de agendas y fuera de agenda
     */

    @Unsubscribe()
    actualizar() {
        this.cancelarDinamica();
        return observableForkJoin(
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: moment(this.fecha).isValid() ? moment(this.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.fecha).isValid() ? moment(this.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada', 'pendienteAsistencia', 'pendienteAuditoria', 'auditada'],
                tipoPrestaciones: this.auth.getPermissions('rup:tipoPrestacion:?')
            }),
            this.getPrestacionesFueraDeAgenda()
        ).subscribe(data => {
            // Actualiza la cantidad de turnos de cada agenda antes de asignarla a la lista, para asegurarme que se vea en pantalla
            data[0].forEach((a: any) => {
                a.cantidadTurnos = 0;
                a.bloques.forEach(b => a.cantidadTurnos += b.turnos.length);
            });
            this.agendas = data[0];
            this.fueraDeAgenda = data[1];
            this.agendasOriginales = JSON.parse(JSON.stringify(this.agendas));

            // agregamos el original de las prestaciones que estan fuera
            // de agenda para poder reestablecer los filtros
            this.prestacionesOriginales = JSON.parse(JSON.stringify(this.fueraDeAgenda));

            // filtramos los resultados
            this.filtrar();
        });
    }

    /**
     * Filtra el listado de agendas y fuera de agenda
     */
    filtrar() {
        this.stopAgendaRefresh();
        this.cancelarDinamica();
        // filtrar solo por las prestaciones que el profesional tenga disponibles
        this.agendas = JSON.parse(JSON.stringify(this.agendasOriginales));
        // this.agendas = this.agendasOriginales;
        this.fueraDeAgenda = this.prestacionesOriginales;

        this.filtrarPorProfesional();
        // por tipo de prestación
        this.filtrarPorTipoPrestacion();
        this.filtrarPorPaciente();
        // si existen resultados, se selecciona por defecto el primero
        this.seleccionarPorDefecto();
    }

    private filtrarPorProfesional() {
        // filtramos por agendas propias o todas menos las propias
        if (this.filtroAgendas.radio === 1) {
            this.agendas = this.agendas.filter(agenda => {
                return (agenda.profesionales && agenda.profesionales.find(profesional => {
                    return (profesional.id === this.auth.profesional);
                }));
            });
        }
    }

    private filtrarPorTipoPrestacion() {
        if (this.prestacionSeleccion) {
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
    }

    private filtrarPorPaciente() {
        if (typeof this.paciente !== 'undefined' && this.paciente) {
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
    }

    private seleccionarPorDefecto() {
        if (this.agendas.length) {
            this.cargarTurnos(this.agendas[0]);
            this.volverALlamar = false;
        } else {
            this.agendaSeleccionada = null;
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
        this.router.navigate(['/rup/huds']);
    }

    irASolicitudes() {
        this.router.navigate(['/asignadas']);
    }

    iniciarPrestacion(turno) {
        const paciente = turno.paciente;
        const snomedConcept = turno.tipoPrestacion;
        this.plex.confirm('Paciente: <b>' + paciente.apellido + ', ' + paciente.nombre + '.</b><br>Prestación: <b>' + snomedConcept.term + '</b>', '¿Crear Prestación?').then(confirmacion => {
            if (confirmacion) {
                const token = this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, snomedConcept.term, this.auth.profesional, turno.id, snomedConcept._id);
                const crear = this.servicioPrestacion.crearPrestacion(paciente, snomedConcept, 'ejecucion', turno.horaInicio, turno.id);
                const res = concat(token, crear);
                res.subscribe(input => {
                    if (input.token) {
                        // se obtuvo token y loguea el acceso a la huds del paciente
                        window.sessionStorage.setItem('huds-token', input.token);
                    } else {
                        if (input.error) {
                            this.plex.info('info', input.error, 'Aviso');
                        } else {
                            this.routeTo('ejecucion', input.id); // prestacion
                        }
                    }
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
                this.servicioPrestacion.crearPrestacion(null, snomedConcept, 'ejecucion', turno.horaInicio, turno).subscribe(prestacion => {
                    this.routeTo('ejecucion', prestacion.id);
                }, (err) => {
                    this.plex.info('warning', 'No fue posible crear la prestación', 'ERROR');
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
        let existe = this.auth.getPermissions('rup:tipoPrestacion:?').find(permiso => (permiso === turno.tipoPrestacion._id));
        if (turno.prestacion) {
            const estado = turno.prestacion.estados[turno.prestacion.estados.length - 1];
            if (estado.tipo !== 'pendiente' && estado.createdBy.username !== this.auth.usuario.username) {
                return false;
            }
        }
        return existe;
    }

    // Selecciona la agenda, realiza la carga de prestaciones de los turnos
    cargarTurnos(agenda) {
        this.cancelarDinamica();

        if (agenda) {
            this.cargarPrestacionesTurnos(agenda);
        } else {
            this.agendaSeleccionada = 'fueraAgenda';
            this.intervalAgendaRefresh();
        }
    }


    @Unsubscribe()
    reloadAgenda() {
        return this.agendaSeleccionada.id ? observableForkJoin(
            this.servicioAgenda.getById(this.agendaSeleccionada.id),
        ).subscribe(data => {
            this.cargarPrestacionesTurnos(data[0]);
            this.agendas[this.agendas.indexOf(this.agendaSeleccionada)] = this.agendaSeleccionada;
        }
        ) : null;
    }

    @Unsubscribe()
    getPrestaciones(idTurnos) {
        return this.servicioPrestacion.get({
            organizacion: this.auth.organizacion.id,
            turnos: idTurnos,
            sinEstado: 'modificada',
            ambitoOrigen: 'ambulatorio',
        });
    }

    @Unsubscribe()
    getPrestacionesFueraDeAgenda() {
        return this.servicioPrestacion.get({
            fechaDesde: this.fecha ? this.fecha : new Date(),
            fechaHasta: new Date(),
            organizacion: this.auth.organizacion.id,
            tieneTurno: false,
            sinEstado: 'modificada',
            ambitoOrigen: 'ambulatorio',
            idProfesional: this.auth.profesional
        });
    }


    @Unsubscribe()
    private cargarPrestacionesTurnos(agenda) {
        let turnos = [];
        agenda.bloques.forEach(b => b.turnos.forEach(e => turnos.push(e)));
        agenda.sobreturnos.forEach(e => turnos.push(e));
        return this.getPrestaciones(turnos.map(e => e.id)).subscribe(prestaciones => {
            // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
            prestaciones.forEach(prestacion => {
                turnos.find(turno => prestacion.solicitud.turno === turno.id).prestacion = prestacion;
            });
            turnos.forEach(t => {
                // filtra las carpetas del efector
                if (t.paciente && t.paciente.carpetaEfectores) {
                    (t.paciente.carpetaEfectores as any) = t.paciente.carpetaEfectores.filter((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                }
            });

            this.agendaSeleccionada = agenda;
            this.intervalAgendaRefresh();
        });
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
        if (this.agendaSeleccionada && this.agendaSeleccionada !== 'fueraAgenda') {
            let agenda = this.agendaSeleccionada ? this.agendaSeleccionada : null;
            localStorage.setItem('idAgenda', agenda.id);
        }
        if (id) {
            this.router.navigate(['rup/' + action + '/', id]);
        } else {
            this.router.navigate(['rup/' + action]);
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

    /**
       * Ejecutar una prestacion que esta en estado pendiente
    */
    ejecutarPrestacionPendiente(turno) {
        const prestacion = turno.prestacion;
        const paciente = turno.paciente;
        const snomedConcept = turno.tipoPrestacion;

        let params: any = {
            op: 'estadoPush',
            ejecucion: {
                fecha: turno.horaInicio,
                registros: [],
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            },
            estado: { tipo: 'ejecucion' }
        };

        this.plex.confirm('Paciente: <b>' + paciente.apellido + ', ' + paciente.nombre + '.</b><br>Prestación: <b>' + snomedConcept.term + '</b>', '¿Iniciar Prestación?').then(confirmacion => {
            if (confirmacion) {
                const token = this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, snomedConcept.term, this.auth.profesional, turno.id, prestacion.id);
                const patch = this.servicioPrestacion.patch(prestacion.id, params);
                const res = concat(token, patch);
                res.subscribe(input => {
                    if (input.token) {
                        // se obtuvo token y loguea el acceso a la huds del paciente
                        window.sessionStorage.setItem('huds-token', input.token);
                    } else {
                        // prestacion
                        this.router.navigate(['/rup/ejecucion', prestacion.id]);
                    }
                });
            }
        });
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
}
