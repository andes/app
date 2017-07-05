import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import * as moment from 'moment';

@Component({
    selector: 'botones-agenda',
    templateUrl: 'botones-agenda.html'
})

export class BotonesAgendaComponent implements OnInit {

    @Output() clonarEmit = new EventEmitter<boolean>();
    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() listarTurnosEmit = new EventEmitter<IAgenda>();
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();
    @Output() agregarNotaAgendaEmit = new EventEmitter<boolean>();
    @Output() agregarSobreturnoEmit = new EventEmitter<boolean>();
    @Output() revisionAgendaEmit = new EventEmitter<boolean>();
    @Output() reasignarTurnosEmit = new EventEmitter<boolean>();


    private _agendasSeleccionadas: Array<any>;

    @Input('agendasSeleccionadas')
    set agendasSeleccionadas(value: any) {
        this._agendasSeleccionadas = value;
        this.cantSel = this._agendasSeleccionadas.length;
        this.actualizarBotones();
    }
    get agendasSeleccionadas(): any {
        return this._agendasSeleccionadas;
    }

    // Mantiene la combinación de condiciones para mostrar/ocultar botones
    vistaBotones: any = {};

    // Muestra/oculta este componente
    showBotonesAgenda: Boolean = true;
    showEditarAgenda: Boolean = false;
    showEditarAgendaPanel: Boolean = false;
    cantSel: number;

    constructor(public plex: Plex, public serviceAgenda: AgendaService) {
    }

    ngOnInit() {
        if (this.cantSel > 0) {
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
                    if (this.cantSel === 1) {

                        if (estado === 'prePausada' && agenda.prePausada === 'publicada') {
                            this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                                if (!confirmado) {
                                    return false;
                                }
                                this.plex.toast('success', 'Información', 'La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                                this.actualizarEstadoEmit.emit(true);
                            });
                        } else {
                            this.plex.toast('success', 'Información', 'La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                            this.actualizarEstadoEmit.emit(true);
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
                                    this.actualizarEstadoEmit.emit(true);
                                });
                            } else {
                                this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                                this.actualizarEstadoEmit.emit(true);
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

        if (estado === 'publicada') {
            this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                if (!confirmado) {
                    return false;
                } else {
                    this.confirmarEstado(estado);
                }
            });
        } else if (estado === 'suspendida') {
            this.plex.confirm('¿Suspender Agenda?').then((confirmado) => {
                if (!confirmado) {
                    return false;
                } else {
                    this.confirmarEstado(estado);
                }
            });
        } else {
            this.confirmarEstado(estado);
        }
    }

    // Muestra/oculta botones según una combinación de criterios
    actualizarBotones() {
        this.vistaBotones = {
            // Se puede editar sólo una agenda que esté en estado planificacion o disponible
            editarAgenda: (this.cantSel === 1) && this.puedoEditar(),
            // Se pueden suspender agendas que estén en estado disponible o publicada...
            suspenderAgenda: (this.cantSel > 0 && this.puedoSuspender()),
            // Se pueden pasar a disponible cualquier agenda en estado planificacion
            pasarDisponibleAgenda: (this.cantSel > 0 && this.puedoDisponer()),
            // Se pueden publicar todas las agendas que estén en estado planificacion, o si estado disponible y no tiene *sólo* turnos reservados
            publicarAgenda: (this.cantSel > 0 && this.puedoPublicar()) && this.haySoloTurnosReservados(),
            // Se pueden cambiar a estado pausada todas las agendas que no estén en estado planificacion
            pausarAgenda: (this.cantSel > 0 && this.puedoPausar()),
            // Se pueden reanudar las agendas en estado pausada
            reanudarAgenda: (this.cantSel > 0 && this.puedoReanudar()),
            // Se puede cerrar cualquier agenda [TODO: ver qué onda]
            cerrarAgenda: false,
            // Se pueden clonar todas las agendas, ya que sólo se usa como un blueprint
            clonarAgenda: (this.cantSel === 1),
            // Agregar una nota relacionada a la Agenda
            agregarNota: true,
            // Agregar un sobreturno
            agregarSobreturno: (this.cantSel === 1) && this.puedoAgregar(),
            // Revisión de agenda
            revisionAgenda: (this.cantSel === 1) && this.puedoRevisar(),
            // Reasignar turnos
            reasignarTurnos: (this.cantSel === 1) && this.puedoReasignar(),
        };
    }

    puedoReasignar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'suspendida';
        }).length;
    }

    puedoEditar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'pausada' || agenda.estado === 'suspendida';
        }).length <= 0;
    }

    puedoSuspender() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'disponible' && agenda.estado !== 'publicada';
        }).length <= 0;
    }

    puedoDisponer() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'planificacion';
        }).length <= 0;
    }

    puedoPublicar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'planificacion' && agenda.estado !== 'disponible';
        }).length <= 0;
    }

    puedoPausar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'planificacion' || agenda.estado === 'pausada' || agenda.estado === 'suspendida';
        }).length <= 0;
    }

    puedoReanudar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'pausada';
        }).length <= 0;
    }

    puedoAgregar() {
        let agenda = this.agendasSeleccionadas[0];
        return agenda.estado === 'disponible' || agenda.estado === 'publicada';
    }

    puedoRevisar() {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.agendasSeleccionadas.filter((agenda) => {
            return moment(agenda.horaInicio).format() <= moment(today).format();
        }).length > 0;
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

    cancelar() {
        this.showEditarAgenda = false;
        this.showBotonesAgenda = true;
    }

}
