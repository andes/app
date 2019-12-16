
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
import { SnomedService } from '../../../../services/term/snomed.service';
import { TurneroService } from '../../../../apps/turnero/services/turnero.service';
import { WebSocketService } from '../../../../services/websocket.service';
import { ISubscription } from 'rxjs/Subscription';



@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html',

    styleUrls: [`../core/_rup.scss`]
})
export class PuntoInicioComponent implements OnInit, OnDestroy {

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Lista de agendas filtradas por fecha, tipos de prestaciones permitidas, ...
    public agendas: IAgenda[] = [];
    // Agenda seleccionada
    public agendaSeleccionada;
    // Mostrar sólo mis agendas
    public filtroAgendas = {
        radio: 1
    };
    public opciones = [
        { id: 1, label: 'mías' },
        { id: 2, label: 'todas' },
        // { id: 3, label: 'fuera de agenda' },
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
    private lastRequest: Subscription;
    public mostrarReglas = false;
    fueraDeAgendaOrdenadas: any;
    fueraDeAgendaSeleccionada: any;
    indexFueraAgenda: any;

    // public dropdownPaciente: DropdownItem[] = [
    //     { label: 'Autocitación', icon: 'dna', handler: (() => this.crearPrestacion('autocitar')) },
    //     { label: 'Fuera de Agenda', icon: 'flag', handler: (() => this.crearPrestacion('fueraAgenda')) },
    //     { divider: true },
    //     { label: 'Item con handler', icon: 'wrench', handler: (() => this.verHuds()) }
    // ];

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
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
            if (!this.auth.profesional.id) {
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
     * Actualiza el listado de agendas y prestaciones
     */

    // tieneTurnosAsignados: true,
    actualizar() {
        this.cancelarDinamica();
        const idsPrestacionesPermitidas = this.tiposPrestacion.map(t => t.conceptId);
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }

        this.lastRequest = observableForkJoin(
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: moment(this.fecha).isValid() ? moment(this.fecha).startOf('day').toDate() : new Date(),
                fechaHasta: moment(this.fecha).isValid() ? moment(this.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id,
                estados: ['disponible', 'publicada', 'pendienteAsistencia', 'pendienteAuditoria', 'auditada'],
                tipoPrestaciones: this.auth.getPermissions('rup:tipoPrestacion:?')
            }),
            // Prestaciones
            this.servicioPrestacion.get({
                fechaDesde: this.fecha ? this.fecha : new Date(),
                fechaHasta: new Date(),
                organizacion: this.auth.organizacion.id,
                sinEstado: 'modificada',
                ambitoOrigen: 'ambulatorio',
                tipoPrestaciones: idsPrestacionesPermitidas
            }),
            // buscamos las prestaciones pendientes que este asociadas a un turno para ejecutarlas
            this.servicioPrestacion.get({
                solicitudHasta: moment(this.fecha).isValid() ? moment(this.fecha).endOf('day').toDate() : new Date(),
                organizacion: this.auth.organizacion.id,
                estado: 'pendiente',
                tieneTurno: true,
                ambitoOrigen: 'ambulatorio',
                tipoPrestaciones: idsPrestacionesPermitidas
            })
        ).subscribe(data => {
            this.agendas = data[0];
            this.prestaciones = data[1];
            if (data[2]) {
                this.prestaciones = [...this.prestaciones, ...data[2]];
            }

            if (this.agendas.length) {

                // loopeamos agendas y vinculamos el turno si existe con alguna de las prestaciones
                this.agendas.forEach(agenda => {
                    agenda['cantidadTurnos'] = 0;
                    // loopeamos los bloques de la agendas
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
                });
            }

            this.agendasOriginales = JSON.parse(JSON.stringify(this.agendas));
            // buscamos las que estan fuera de agenda para poder listarlas:
            // son prestaciones sin turno creadas en la fecha seleccionada en el filtro
            this.fueraDeAgenda = this.prestaciones.filter(p => (!p.solicitud.turno &&
                (p.ejecucion.fecha >= moment(this.fecha).startOf('day').toDate() &&
                    p.ejecucion.fecha <= moment(this.fecha).endOf('day').toDate())
                && p.estados[p.estados.length - 1].createdBy.username === this.auth.usuario.username
                && (p.estados[p.estados.length - 1].tipo === 'ejecucion' || p.estados[p.estados.length - 1].tipo === 'validada')));

            // agregamos el original de las prestaciones que estan fuera
            // de agenda para poder reestablecer los filtros
            this.prestacionesOriginales = JSON.parse(JSON.stringify(this.fueraDeAgenda));
            this.mostrarTurnoPendiente(this.fueraDeAgenda);
            // filtramos los resultados
            this.filtrar();

            if (this.agendas.length) {
                this.cargarTurnos(this.agendas[0]);
            }

            // recorremos agenda seleccionada para ver si tienen planes pendientes y mostrar en la vista..
            if (this.agendaSeleccionada) {
                this.agendaSeleccionada.bloques.forEach(element => {
                    element.turnos.forEach(turno => {
                        if (turno.prestacion) {
                            turno.prestacion = this.mostrarTurnoPendiente(turno.prestacion);
                        }
                    });
                });
            }
            this.fueraDeAgenda = this.mostrarTurnoPendiente(this.fueraDeAgenda);

        });
    }

    groupBy(arr, property) {
        return arr.reduce((memo, x) => {
            if (!memo[x[property]]) {
                memo[x[property]] = [];
            }
            memo[x[property]].push(x);
            return memo;
        }, {});
    }


    /**
     * Filtra el listado de agendas y prestaciones
     */
    filtrar() {
        this.cancelarDinamica();
        // filtrar solo por las prestaciones que el profesional tenga disponibles
        this.agendaSeleccionada = null;
        this.agendas = JSON.parse(JSON.stringify(this.agendasOriginales));
        // this.agendas = this.agendasOriginales;
        this.fueraDeAgenda = this.prestacionesOriginales;

        let group = this.prestacionesOriginales.map(x => x.solicitud.tipoPrestacion);
        this.fueraDeAgendaOrdenadas = Object.values(this.groupBy(group, 'conceptId'));

        // filtramos por agendas propias o todas menos las propias
        if (this.filtroAgendas.radio === 1) {
            this.agendas = this.agendas.filter(agenda => {
                return (agenda.profesionales && agenda.profesionales.find(profesional => {
                    return (profesional.id === this.auth.profesional.id);
                }));
            });
        }

        // por tipo de prestación
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


        if (this.agendas.length) {
            this.agendaSeleccionada = this.agendas[0];
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
        this.router.navigate(['/rup/huds']);
    }

    registrarInasistencia(datos) {

        const paciente = datos[0];
        const agenda: IAgenda = datos[1];
        const turno = datos[2];
        const operacion = datos[3];

        let cambios;
        cambios = {
            op: operacion,
            turnos: [turno]
        };
        if (operacion === 'noAsistio') {
            this.plex.confirm(`¿Está seguro que desea registrar la inasistencia del paciente: <b> ${paciente.apellido} ${paciente.nombre} </b> ?`).then(confirmacion => {
                if (confirmacion) {
                    this.servicioAgenda.patch(agenda.id, cambios).subscribe(() => {
                        this.actualizar();
                    });
                } else {
                    return false;
                }
            });
        } else {
            this.plex.confirm(`¿Está seguro que quiere quitar la inasistencia?`).then(confirmacion => {
                if (confirmacion) {
                    this.servicioAgenda.patch(agenda.id, cambios).subscribe(() => {
                        this.actualizar();
                    });
                } else {
                    return false;
                }
            });
        }

    }


    tienePermisos(tipoPrestacion, prestacion) {
        let permisos = this.auth.getPermissions('rup:tipoPrestacion:?');
        let existe = permisos.find(permiso => (permiso === tipoPrestacion._id));
        // vamos a comprobar si el turno tiene una prestacion asociada y si ya esta en ejecucion
        // por otro profesional. En ese caso no debería poder entrar a ejecutar o validar la prestacion
        if (prestacion) {
            if (prestacion.estados[prestacion.estados.length - 1].tipo !== 'pendiente' && prestacion.estados[prestacion.estados.length - 1].createdBy.username !== this.auth.usuario.username) {
                return null;
            }
        }
        return existe;
    }

    cargarTurnos(agenda) {
        this.cancelarDinamica();
        this.agendaSeleccionada = agenda;
        this.indexFueraAgenda = null;
    }

    cargarFueraAgenda(index) {
        this.agendaSeleccionada = 'fueraAgenda';
        this.indexFueraAgenda = index;
        this.cancelarDinamica();
        this.fueraDeAgendaSeleccionada = this.fueraDeAgenda.filter(x => this.fueraDeAgendaOrdenadas[index].find(y => y.conceptId === x.solicitud.tipoPrestacion.conceptId));
    }

    // dada una prestación busca las prestaciones generadas (por planes) que esten pendientes y sin turno asignado.
    comprobarPrestacionesPendientes(unaPrestacion) {
        if (unaPrestacion.id && unaPrestacion.estados[unaPrestacion.estados.length - 1].tipo === 'validada') {
            let registropendiente = unaPrestacion.ejecucion.registros.filter(registro => registro.esSolicitud && registro.valor && registro.valor.autocitado);
            if (registropendiente && registropendiente.length > 0) {
                this.servicioPrestacion.get({ idPrestacionOrigen: unaPrestacion.id }).subscribe(prestacionesPaciente => {
                    prestacionesPaciente.forEach(elemento => {
                        if (elemento.estados[elemento.estados.length - 1].tipo === 'pendiente'
                            && !elemento.solicitud.turno) {
                            unaPrestacion.turnosPedientes = true;
                        }
                    });
                });
            }
        }
    }


    // Recibe un array o un objeto lo recorre y busca los planes que estan pendientes..
    mostrarTurnoPendiente(prestaciones) {
        if (prestaciones) {
            if (Array.isArray(prestaciones)) {
                let _prestaciones = prestaciones.filter(p => {
                    // filtramos todas las prestaciones que:
                    // 1) esten validadas
                    // 2) que sean planes y sean autocitados
                    let registropendiente = p.ejecucion.registros.filter(registro => registro.esSolicitud && registro.valor &&
                        registro.valor.autocitado
                    );
                    if (p.id && p.estados[p.estados.length - 1].tipo === 'validada' && registropendiente.length > 0
                    ) {
                        return p;
                    }
                });
                _prestaciones.forEach(unaPrestacion => {
                    this.comprobarPrestacionesPendientes(unaPrestacion);
                });
            } else { // ingresa cuando lo llamo con una prestacion
                this.comprobarPrestacionesPendientes(prestaciones);
            }
        }
        return prestaciones;
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


    // buscar paciente para asigar en las agendas dinamicas
    buscarPaciente() {
        this.buscandoPaciente = true;
    }

    cancelarDinamica() {
        this.buscandoPaciente = false;
    }



    verIniciarPrestacionPendiente(turno, agenda) {
        let condAsistencia = false;
        if (turno.asistencia && turno.asistencia === 'asistio') {
            if (turno.prestacion && turno.prestacion.estados[turno.prestacion.estados.length - 1].tipo === 'pendiente') {
                condAsistencia = true;
            }
        } else {
            if (turno.asistencia && turno.asistencia !== 'asistio') {
                condAsistencia = true;
            } else {
                if (!turno.asistencia) {
                    condAsistencia = true;
                }
            }
        }

        return (this.esFutura(agenda) && turno.paciente && turno.estado !== 'suspendido' && turno.prestacion &&
            turno.prestacion.estados[turno.prestacion.estados.length - 1].tipo === 'pendiente' &&
            this.tienePermisos(turno) && condAsistencia);
    }


    verIniciarPrestacion(turno, agenda) {
        let condAsistencia = false;
        if (turno.asistencia && turno.asistencia === 'asistio') {
            if (!turno.prestacion) {
                condAsistencia = true;
            }
        } else {
            if (turno.asistencia && turno.asistencia !== 'asistio') {
                condAsistencia = true;
            } else {
                if (!turno.asistencia) {
                    condAsistencia = true;
                }
            }
        }

        return (!this.esFutura(agenda) && turno.paciente && turno.estado !== 'suspendido' &&
            this.tienePermisos(turno) && condAsistencia);
    }

    /**
     * Se puede registrar inasistencia de un turno cuando se cumplen todas las validaciones:
     * la agenda: no es futura, no está auditada
     * turno: no está suspendido, ya pasó la hora de inicio, profesional no cargó prestación todavía y tiene paciente asignado
     * @param {*} turno
     * @returns {Boolean} si debe mostrarse o no el botón para registrar inasistencia
     * @memberof PuntoInicioComponent
     */
    esHabilitadoRegistrarInasistencia(turno): Boolean {
        let horaActual = moment(new Date()).format('LT');
        let horaTurno = moment(turno.horaInicio).format('LT');
        return !this.esFutura(this.agendaSeleccionada) && this.agendaSeleccionada.estado !== 'auditada' &&
            turno.estado !== 'suspendido' && (!turno.asistencia || (turno.asistencia && turno.asistencia === 'asistio')) &&
            turno.paciente && turno.diagnostico.codificaciones.length === 0;
    }
}
