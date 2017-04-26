import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent implements OnInit {

    @Output() clonarEmit = new EventEmitter<boolean>();
    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();

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
    showVistaAgendas: Boolean = true;
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
                        this.plex.alert('La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarEstadoEmit.emit(true);
                    } else {
                        if (estado === 'prePausada') {
                            this.plex.alert('Las agendas cambiaron de estado');
                        } else {
                            this.plex.alert('Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        }
                        this.actualizarEstadoEmit.emit(true);
                    }
                    alertCount++;
                }
            });
        });
    }

    // Actualiza estado de las Agendas seleccionadas
    actualizarEstado(estado) {

        if (estado === 'Publicada') {
            this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                if (!confirmado) {
                    return false;
                } else {
                    this.confirmarEstado(estado);
                }
            });
        } else if (estado === 'Suspendida') {
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
            // Se puede editar sólo una agenda que esté en estado Planificacion o Disponible
            editarAgenda: (this.cantSel === 1) && this.puedoEditar(),
            // Se pueden suspender agendas que estén en estado Disponible o Publicada...
            suspenderAgenda: (this.cantSel > 0 && this.puedoSuspender()),
            // Se pueden pasar a Disponible cualquier agenda en estado Planificacion
            pasarDisponibleAgenda: (this.cantSel > 0 && this.puedoDisponer()),
            // Se pueden publicar todas las agendas que estén en estado Planificacion, o si estado Disponible y no tiene *sólo* turnos reservados
            publicarAgenda: (this.cantSel > 0 && this.puedoPublicar()) && this.haySoloTurnosReservados(),
            // Se pueden cambiar a estado Pausada todas las agendas que no estén en estado Planificacion
            pausarAgenda: (this.cantSel > 0 && this.puedoPausar()),
            // Se pueden reanudar las agendas en estado Pausada
            reanudarAgenda: (this.cantSel > 0 && this.puedoReanudar()),
            // Se puede cerrar cualquier agenda [TODO: ver qué onda]
            cerrarAgenda: false,
            // Se pueden clonar todas las agendas, ya que sólo se usa como un blueprint
            clonarAgenda: (this.cantSel === 1),
            // En pausa: no se puede hacer nada, debe volver al estado anterior una vez que se hace "play"
        };
    }

    puedoEditar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'Pausada' || agenda.estado === 'Suspendida';
        }).length <= 0;
    }

    puedoSuspender() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'Disponible' && agenda.estado !== 'Publicada';
        }).length <= 0;
    }

    puedoDisponer() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'Planificacion';
        }).length <= 0;
    }

    puedoPublicar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'Planificacion' && agenda.estado !== 'Disponible';
        }).length <= 0;
    }

    puedoPausar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado === 'Planificacion' || agenda.estado === 'Pausada' || agenda.estado === 'Suspendida';
        }).length <= 0;
    }

    puedoReanudar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'Pausada';
        }).length <= 0;
    }

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

    // Botón clonar
    clonarAgenda(agenda: any) {
        this.clonarEmit.emit(agenda);
    }

    cancelar() {
        this.showEditarAgenda = false;
        this.showVistaAgendas = true;
    }

}
