import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Router } from '@angular/router';
import { GestorAgendasService } from './../../services/turnos/gestor-agendas.service';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent implements OnInit, OnDestroy {

    showVistaAgendas: Boolean = true;
    showEditarAgenda: Boolean = false;
    showEditarAgendaPanel: Boolean = false;
    cantSel: number;
    // TODO: Eliminar input vistaAgenda
    @Input() vistaAgenda: any;
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

    public modelo: any = {};
    public vistaAux: any = {};
    public vistaBotones: any = {};


    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router) {
    }

    ngOnInit() {
        if (this.cantSel > 0) {
            this.actualizarBotones();
        }
    }

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }

    actualizarBotones() {
        // Muestra/oculta botones según una combinación de criterios
        // TODO: Pausada
        this.vistaBotones = {
            // Se puede editar sólo una agenda que esté en estado Planificacion o Disponible
            editarAgenda: (this.cantSel === 1) && this.puedoEditar(),
            // Se pueden suspender agendas que estén en estado Disponible o Publicada...
            suspenderAgenda: (this.cantSel > 0 && this.puedoSuspender()),
            // Se pueden pasar a Disponible cualquier agenda en estado Planificacion
            pasarDisponibleAgenda: (this.cantSel > 0 && this.puedoDisponer()),
            // Se pueden publicar todas las agendas que estén en estado Planificacion o Disponible 
            publicarAgenda: (this.cantSel > 0 && this.puedoPublicar()),
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
            return agenda.estado !== 'Planificacion' && agenda.estado !== 'Disponible';
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
            return agenda.estado === 'Planificacion' || agenda.estado === 'Pausada';
        }).length <= 0;
    }

    puedoReanudar() {
        return this.agendasSeleccionadas.filter((agenda) => {
            return agenda.estado !== 'Pausada';
        }).length <= 0;
    }

    // Botón editar agenda
    editarAgenda(agenda) {
        this.editarAgendaEmit.emit(this.agendasSeleccionadas[0]);
    }

    // Botones actualizar estado
    actualizarEstado(estado) {

        let alertCount = 0;
        this.agendasSeleccionadas.forEach((agenda, index) => {
            let patch = {
                'op': estado,
                'estado': estado
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                if (alertCount === 0) {
                    if (this.cantSel === 1) {
                        this.plex.alert('La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarEstadoEmit.emit(true);
                    } else {
                        this.plex.alert('Las agendas cambiaron el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarEstadoEmit.emit(true);
                    }
                    alertCount++;
                }
                this.vistaAux = resultado;
            });
        });

    }

    // Botón clonar
    clonarAgenda(agenda: IAgenda) {
        this.modelo = agenda;
        this.clonarEmit.emit(this.modelo);
    }

    cancelar() {
        this.showEditarAgenda = false;
        this.showVistaAgendas = true;
    }

}
