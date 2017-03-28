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

    @Input() vistaAgenda: any;

    @Output() clonarEmit = new EventEmitter<boolean>();
    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();

    public modelo: any = {};
    public vistaAux: any = {};
    public vistaBotones: any = {};


    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router) {
    }

    ngOnInit() {

        if (this.vistaAgenda) {
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
            // Para editar una agenda, tiene que estar seleccionada sólo una, y en estado "Planificación"
            editarAgenda: (this.vistaAgenda) && (this.vistaAgenda.estado === 'Planificacion' || this.vistaAgenda.estado === 'Publicada' || this.vistaAgenda.estado === 'Disponible'),
            // Se pueden suspender agendas que estén en estado Disponible o Publicada...
            suspenderAgenda: (this.vistaAgenda) && (this.vistaAgenda.estado === 'Disponible' || this.vistaAgenda.estado === 'Publicada'),
            // Se pueden pasar a Disponible cualquier agenda en estado Planificacion
            pasarDisponibleAgenda: (this.vistaAgenda) && this.vistaAgenda.estado === 'Planificacion',
            // Se pueden publicar todas las agendas que estén en estado Planificacion o Disponible 
            publicarAgenda: (this.vistaAgenda) && (this.vistaAgenda.estado === 'Planificacion' || this.vistaAgenda.estado === 'Disponible'),
            // Se pueden cambiar a estado Pausada todas las agendas que no estén en estado Planificacion
            pausarAgenda: (this.vistaAgenda) && (this.vistaAgenda.estado !== 'Planificacion' && this.vistaAgenda.estado !== 'Pausada'),
            // Se puede cerrar cualquier agenda [TODO: ver qué onda]
            cerrarAgenda: false,

            // Se pueden clonar todas las agendas, ya que sólo se usa como un blueprint
            clonarAgenda: (this.vistaAgenda),
            // En pausa: no se puede hacer nada, debe volver al estado anterior una vez que se hace "play"
            // Se puede pausar más de una
        };

        console.log(this.vistaBotones);
    }

    // Botón editar agenda
    editarAgenda(agenda) {
        debugger;
        if (agenda.estado === 'Disponible' || agenda.estado === 'Publicada') {
            this.editarAgendaEmit.emit(this.vistaAgenda);
        } else if (agenda.estado === 'Planificacion') {
            this.editarAgendaEmit.emit(this.vistaAgenda);
        }
    }

    // Botones actualizar estado
    actualizarEstado(agenda: IAgenda, estado) {
        let patch = {
            'op': estado,
            'estado': estado
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.vistaAux = resultado;

            this.plex.alert('La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : this.vistaAux.prePausada));
            // alert('La agenda cambió el estado a ' + estado);
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
