import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Router } from '@angular/router';
import { GestorAgendasService } from './../../services/turnos/gestor-agendas.service';

@Component({
    selector: 'panel-agenda',
    templateUrl: 'panel-agenda.html'
})

export class PanelAgendaComponent implements OnInit {

    showEditarAgenda: Boolean = false;

    private _editarAgendaPanel: any;
    @Input('editaAgendaPanel')
    set editaAgendaPanel(value: any) {
        this._editarAgendaPanel = value;
        this.modelo = value;
    }
    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() showVistaTurnos = new EventEmitter<Boolean>();

    showEditarAgendaPanel: Boolean = true;

    public modelo: any = {};

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router) {
    }

    ngOnInit() {
        // console.log('this.editaAgendaPanel: ', this.editaAgendaPanel);
        console.log('this.modelo: ', this.modelo);
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
            this.modelo = resultado;

            this.showEditarAgenda = false;

            // alert('La agenda se guardó correctamente ');
            this.plex.alert('La agenda se guardó correctamente ');
        });
    }


    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnos.emit(true);
    }


    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(event.callback);
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({}).subscribe(event.callback);
    }

}
