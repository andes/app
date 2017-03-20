import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Router } from '@angular/router';
import { GestorAgendasService } from './../../services/turnos/gestor-agendas.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent implements OnInit {

    showVistaAgendas: Boolean = true;
    showEditarAgenda: Boolean = false;

    @Input() vistaAgenda: any;

    @Output() clonarEmit = new EventEmitter<boolean>();
    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();

    public modelo: any = {};

    subscription: Subscription;

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router, private gestorAgendasService: GestorAgendasService) {

        this.subscription = gestorAgendasService.agendas$.subscribe(
            agendas => {
                this.actualizarBotones(this.vistaAgenda);
                this.vistaAgenda = agendas;
            });
    }

    ngOnInit() {
        if (this.vistaAgenda) {
            this.actualizarBotones(this.vistaAgenda);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    actualizarBotones(vistaAgenda: any) {
        debugger;

        vistaAgenda.botones = {
            editarAgenda: (vistaAgenda.agendasSeleccionadas.length === 1) && (vistaAgenda.estado !== 'Suspendida'),
            suspenderAgenda: (vistaAgenda.agendasSeleccionadas.length > 0) && (vistaAgenda.estado !== 'Suspendida'),
            cerrarAgenda: vistaAgenda.agendasSeleccionadas === 1,
            publicarAgenda: (vistaAgenda.agendasSeleccionadas.length > 0) && (vistaAgenda.estado !== 'Suspendida'),
            clonarAgenda: (vistaAgenda.agendasSeleccionadas === 1) && (vistaAgenda.estado !== 'Suspendida'),
        };
    }

    suspenderAgenda(agenda) {

        let patch = {
            'op': 'suspenderAgenda',
            'estado': 'Suspendida'
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            agenda.estado = resultado.estado;

            this.plex.alert('La agenda paso a Estado: ' + resultado.estado);
        });
    }

    editarAgenda(agenda) {
        debugger;
        if (agenda.estado === 'Disponible') {
            this.modelo.profesionales = agenda.profesionales;
            this.modelo.espacioFisico = agenda.espacioFisico;

            this.showEditarAgenda = true;
        } else if (agenda.estado === 'Planificacion') {
            this.editarAgendaEmit.emit(agenda);
        }
    }

    guardarAgenda(agenda: IAgenda) {
        let profesional = this.modelo.profesionales;
        let espacioFisico = this.modelo.espacioFisico;

        let patch = {
            'op': 'editarAgenda',
            'profesional': profesional,
            'espacioFisico': espacioFisico
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.vistaAgenda = resultado;
            this.modelo = resultado;

            this.showEditarAgenda = false;

            this.plex.alert('La agenda se guardó correctamente ');
        });
    }

    cancelar() {
        this.showEditarAgenda = false;
    }

    publicarAgenda(agenda: IAgenda) {
        let patch = {
            'op': 'publicarAgenda',
            'estado': 'Publicada'
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.vistaAgenda = resultado;

            this.plex.alert('La agenda se publicó correctamente ');
        });
    }

    clonarAgenda(agenda: IAgenda) {
        this.modelo = agenda;

        this.clonarEmit.emit(this.modelo);
    }

    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(event.callback);
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({}).subscribe(event.callback);
    }
}
