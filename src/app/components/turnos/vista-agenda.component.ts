import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Router } from '@angular/router';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent {

    showVistaAgendas: boolean = true;
    showDatosAgenda: boolean = true;
    showEditarAgenda: boolean = false;

    @Input() vistaAgenda: IAgenda;

    @Output() clonar = new EventEmitter<boolean>();

    public modelo: any = {};

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router) { }

    suspenderAgenda(agenda) {
        let patch: any = {};
        debugger;

        let pacientes = {};

        for (let i = 0; i < agenda.bloques.length; i++) {
            let turnos = agenda.bloques[i];
            for (let j = 0; j < turnos.turnos.length; j++) {
                pacientes = turnos.turnos[j].paciente;
            }
        }

        if (pacientes) {
        patch = {
            'op': 'suspenderAgenda',
            'estado': 'Suspendida'
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            agenda.estado = resultado.estado;

            this.plex.alert('La agenda paso a Estado: ' + resultado.estado);
        });
        } else {
            this.plex.alert('La agenda no se puede suspender porque tiene pacientes');
        }
    }

    editarAgenda(agenda) {
        this.modelo.profesionales = agenda.profesionales;
        this.modelo.espacioFisico = agenda.espacioFisico;

        this.showDatosAgenda = false;
        this.showEditarAgenda = true;
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

            this.showDatosAgenda = true;
            this.showEditarAgenda = false;

            this.plex.alert('La agenda se guardó correctamente ');
        });
    }

    cancelar() {
        this.showDatosAgenda = true;
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

        this.clonar.emit(this.modelo);
    }

    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(event.callback);
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({}).subscribe(event.callback);
    }
}
