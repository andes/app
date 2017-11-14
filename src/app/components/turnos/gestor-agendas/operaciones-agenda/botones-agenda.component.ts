import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

@Component({
    selector: 'botones-agenda',
    templateUrl: 'botones-agenda.html'
})

export class BotonesAgendaComponent implements OnInit {

    // @Input() turnosSuspendidos: any[];

    @Output() clonarEmit = new EventEmitter<boolean>();
    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() listarTurnosEmit = new EventEmitter<IAgenda>();
    @Output() actualizarEstadoEmit = new EventEmitter<string>();
    @Output() agregarNotaAgendaEmit = new EventEmitter<boolean>();
    @Output() agregarSobreturnoEmit = new EventEmitter<boolean>();
    @Output() revisionAgendaEmit = new EventEmitter<boolean>();
    @Output() reasignarTurnosEmit = new EventEmitter<boolean>();


    private _agendasSeleccionadas: Array<any>;

    @Input('agendasSeleccionadas')
    set agendasSeleccionadas(value: any) {
        this._agendasSeleccionadas = value;
        this.cantidadSeleccionadas = this._agendasSeleccionadas.length;
        this.actualizarBotones();
    }
    get agendasSeleccionadas(): any {
        return this._agendasSeleccionadas;
    }

    private _turnosSuspendidos: Array<any>;

    @Input('turnosSuspendidos')
    set turnosSuspendidos(value: any) {
        this._turnosSuspendidos = value;
    }
    get turnosSuspendidos(): any {
        return this._turnosSuspendidos;
    }

    // Mantiene la combinación de condiciones para mostrar/ocultar botones
    vistaBotones: any = {};

    // Muestra/oculta este componente
    showBotonesAgenda: Boolean = true;
    showEditarAgenda: Boolean = false;
    showEditarAgendaPanel: Boolean = false;
    cantidadSeleccionadas: number;

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public auth: Auth) { }

    ngOnInit() {
        if (this.cantidadSeleccionadas > 0) {
            this.actualizarBotones();
        }
    }

    confirmarEstado(estado) {
        let alertCount = 0;
        this.agendasSeleccionadas.forEach((agenda, index) => {
            let patch = {
                'op': estado,
                'estado': estado
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                // Si son múltiples, esperar a que todas se actualicen
                if (alertCount === 0) {
                    if (this.cantidadSeleccionadas === 1) {

                        if (estado === 'prePausada' && agenda.prePausada === 'publicada') {
                            this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                                if (!confirmado) {
                                    return false;
                                }
                                this.plex.toast('success', 'Información', 'La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                                this.actualizarEstadoEmit.emit(estado);
                            });
                        } else {
                            this.plex.toast('success', 'Información', 'La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                            this.actualizarEstadoEmit.emit(estado);
                        }


                    } else {
                        if (estado === 'prePausada') {
                            this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado');
                        } else {
                            if (estado === 'prePausada' && agenda.prePausada === 'publicada') {
                                this.plex.confirm('¿Publicar Agendas?').then((confirmado) => {
                                    if (!confirmado) {
                                        return false;
                                    }
                                    this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                                    this.actualizarEstadoEmit.emit(estado);
                                });
                            } else {
                                this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                                this.actualizarEstadoEmit.emit(estado);
                            }
                        }
                    }
                    alertCount++;
                }
            });
        });
    }

    // Actualiza estado de las Agendas seleccionadas
    actualizarEstado(estado) {

        switch (estado) {
            case 'publicada':
                this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                    if (!confirmado) {
                        return false;
                    } else {
                        this.confirmarEstado(estado);
                    }
                });
                break;
            case 'suspendida':
                // this.plex.confirm('¿Suspender Agenda?').then((confirmado) => {
                //     if (!confirmado) {
                //         return false;
                //     } else {
                //         this.confirmarEstado(estado);
                //     }
                // });
                this.actualizarEstadoEmit.emit(estado);
                break;
            case 'borrada':
                this.plex.confirm('¿Borrar Agenda?').then((confirmado) => {
                    if (!confirmado) {
                        return false;
                    } else {
                        this.confirmarEstado(estado);
                    }
                });
                break;
            default:
                this.confirmarEstado(estado);
                break;

        }

    }

    // Muestra/oculta botones según una combinación de criterios
    actualizarBotones() {
        let puedeEditar = this.auth.getPermissions('turnos:agenda:puedeEditar:').length > 0;
        let puedeSuspender = this.auth.getPermissions('turnos:agenda:puedeSuspender:').length > 0;
        let puedeHabilitar = this.auth.getPermissions('turnos:agenda:puedeHabilitar:').length > 0;
        let puedePublicar = this.auth.getPermissions('turnos:agenda:puedePublicar:').length > 0;
        let puedePausar = this.auth.getPermissions('turnos:agenda:puedePausar:').length > 0;
        let puedeReanudar = this.auth.getPermissions('turnos:agenda:puedeReanudar:').length > 0;
        let puedeClonar = this.auth.getPermissions('turnos:agenda:puedeClonar:').length > 0;
        let puedeDarSobreturno = this.auth.getPermissions('turnos:agenda:puedeDarSobreturno:').length > 0;
        let puedeImprimir = this.auth.getPermissions('turnos:agenda:puedeImprimir:').length > 0;
        let puedeReasignar = this.auth.getPermissions('turnos:agenda:puedeReasignar:').length > 0;
        let puedeBorrar = this.auth.getPermissions('turnos:agenda:puedeBorrar:').length > 0;

        this.vistaBotones = {
            // Se puede editar sólo una agenda que esté en estado planificacion o disponible
            editarAgenda: (this.cantidadSeleccionadas === 1) && this.puedoEditar() && puedeEditar,
            // Se pueden suspender agendas que estén en estado disponible o publicada...
            suspenderAgenda: (this.cantidadSeleccionadas > 0 && this.puedoSuspender() && puedeSuspender),
            // Se pueden pasar a disponible cualquier agenda en estado planificacion
            pasarDisponibleAgenda: (this.cantidadSeleccionadas > 0 && this.puedoDisponer() && puedeHabilitar),
            // Se pueden publicar todas las agendas que estén en estado planificacion, o si estado disponible y no tiene *sólo* turnos reservados
            publicarAgenda: (this.cantidadSeleccionadas > 0 && this.puedoPublicar()) && this.haySoloTurnosReservados() && puedeHabilitar,
            // Se pueden borrar cualquier agenda en estado de planificacion
            borrarAgenda: (this.cantidadSeleccionadas > 0 && this.puedoBorrar()) && puedeBorrar,
            // Se pueden cambiar a estado pausada todas las agendas que no estén en estado planificacion
            pausarAgenda: (this.cantidadSeleccionadas > 0 && this.puedoPausar()) && puedePausar,
            // Se pueden reanudar las agendas en estado pausada
            reanudarAgenda: (this.cantidadSeleccionadas > 0 && this.puedoReanudar()) && puedeReanudar,
            // Se puede cerrar cualquier agenda [TODO: ver qué onda]
            cerrarAgenda: false,
            // Se pueden clonar todas las agendas, ya que sólo se usa como un blueprint
            clonarAgenda: (this.cantidadSeleccionadas === 1) && puedeClonar,
            // Agregar una nota relacionada a la Agenda
            agregarNota: true,
            // Agregar un sobreturno
            agregarSobreturno: (this.cantidadSeleccionadas === 1) && this.puedoAgregar() && puedeDarSobreturno,
            // Revisión de agenda
            revisionAgenda: (this.cantidadSeleccionadas === 1) && this.puedoRevisar(),
            // Reasignar turnos
            reasignarTurnos: (this.cantidadSeleccionadas === 1) && (this.hayAgendasSuspendidas() || this.hayTurnosSuspendidos()) && puedeReasignar,
            // Imprimir pdf
            listarTurnos: (this.cantidadSeleccionadas === 1) && puedeImprimir,
        };
    }

    hayAgendasSuspendidas() {
        let reasginar = this.agendasSeleccionadas.filter((agenda) => {
            return (agenda.nominalizada && agenda.estado === 'suspendida');
        }).length > 0;
        return reasginar;
    }

    // Comprueba que haya algún turno con paciente, en estado suspendido
    hayTurnosSuspendidos() {
        for (let x = 0; x < this.agendasSeleccionadas.length; x++) {
            for (let y = 0; y < this.agendasSeleccionadas[x].bloques.length; y++) {
                if (this.agendasSeleccionadas[x].bloques[y].turnos) {
                    for (let z = 0; z < this.agendasSeleccionadas[x].bloques[y].turnos.length; z++) {
                        if (this.agendasSeleccionadas[x].bloques[y].turnos[z].estado === 'suspendido' && this.agendasSeleccionadas[x].bloques[y].turnos[z].paciente && this.agendasSeleccionadas[x].bloques[y].turnos[z].paciente.id) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    puedoEditar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'asistenciaCerrada' || agenda.estado === 'codificada' || agenda.estado === 'pausada' || agenda.estado === 'suspendida';
        }).length <= 0;
    }

    puedoSuspender() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'disponible' && agenda.estado !== 'publicada';
        }).length <= 0;
    }

    puedoDisponer() {
        let disponer = this.agendasSeleccionadas.filter((agenda) => {
            return (agenda.estado !== 'planificacion' || !agenda.nominalizada);
        }).length <= 0;
        return disponer;
    }

    puedoPublicar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'planificacion' && agenda.estado !== 'disponible';
        }).length <= 0;
    }

    puedoBorrar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'planificacion';
        }).length <= 0;
    }

    puedoPausar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'planificacion' || agenda.estado === 'pausada' || agenda.estado === 'suspendida' || agenda.estado === 'codificada' || agenda.estado === 'asistenciaCerrada';
        }).length <= 0;
    }

    puedoReanudar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'pausada';
        }).length <= 0;
    }

    puedoAgregar() {
        let agenda = this.agendasSeleccionadas[0];
        return (agenda.nominalizada && (agenda.estado === 'disponible' || agenda.estado === 'publicada'));
    }

    puedoRevisar() {
        let agenda = this.agendasSeleccionadas[0];
        return ((agenda.estado === 'planificacion' || agenda.estado !== 'suspendida') && moment(agenda.horaInicio).isBefore(moment(new Date), 'day'));
    }

    // TODO: Verificar que las agendas seleccionadas tengan al menos un turno asignado
    haySoloTurnosReservados() {
        for (let x = 0; x < this.agendasSeleccionadas.length; x++) {
            for (let y = 0; y < this.agendasSeleccionadas[x].bloques.length; y++) {
                if (this.agendasSeleccionadas[x].bloques[y].reservadoProfesional > 0 && this.agendasSeleccionadas[x].bloques[y].reservadoGestion > 0) {
                    if (this.agendasSeleccionadas[x].bloques[y].accesoDirectoProgramado === 0 && this.agendasSeleccionadas[x].bloques[y].accesoDirectoDelDia === 0) {
                        // No se puede Publicar
                        return false;
                    }
                }
            }
        }
        if (this.agendasSeleccionadas.length > 0) {
            return true;
        } else {
            return false;
        }
    }


    // Botón editar agenda
    editarAgenda() {
        this.editarAgendaEmit.emit(this.agendasSeleccionadas[0]);
    }

    // Botón clonar, emite que se va a clonar la agenda
    clonarAgenda(agenda: any) {
        this.clonarEmit.emit(agenda);
    }

    // Botón agregar nota a la agenda, emite que se va a agregar la nota
    agregarNotaAgenda() {
        this.agregarNotaAgendaEmit.emit(this.agendasSeleccionadas);
    }

    // Boton agregar sobreturno, emite que se va a agregar un sobreturno
    agregarSobreturno() {
        this.agregarSobreturnoEmit.emit(this.agendasSeleccionadas[0]);
    }

    // Botón de revisión de Agenda
    revisionAgenda() {
        this.revisionAgendaEmit.emit(this.agendasSeleccionadas[0]);
    }

    reasignarTurnos() {
        this.reasignarTurnosEmit.emit(this.agendasSeleccionadas[0]);
    }

    listarTurnos() {
        this.listarTurnosEmit.emit(this.agendasSeleccionadas[0]);
    }

    cancelar() {
        this.showEditarAgenda = false;
        this.showBotonesAgenda = true;
    }

}
