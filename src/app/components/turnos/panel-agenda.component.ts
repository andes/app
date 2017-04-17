import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Router } from '@angular/router';

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

    public alertas: any[] = [];

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router) {
    }

    ngOnInit() {
        // console.log('this.editaAgendaPanel: ', this.editaAgendaPanel);
        console.log('this.modelo: ', this.modelo);
    }

    guardarAgenda(agenda: IAgenda) {

        if (this.alertas.length === 0) {

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

                this.plex.alert('La agenda se guardó correctamente ');
            });
        }
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

    /**
     * Valida que no se solapen Profesionales y/o Espacios físicos
     */
    validarSolapamientos(tipo) {

        this.alertas = [];

        // Inicio y Fin de Agenda
        let iniAgenda, finAgenda;

        if (tipo === 'profesionales') {

            // Loop profesionales
            this.modelo.profesionales.forEach((profesional, index) => {

                this.serviceAgenda.get({ 'idProfesional': profesional.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                    subscribe(agendas => {

                        // Hay problemas de solapamiento?
                        let agendasConSolapamiento = agendas.filter(agenda => {
                            return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                        });

                        // Si encontramos una agenda que coincida con la búsqueda...
                        if (agendasConSolapamiento.length > 0) {
                            this.alertas = [... this.alertas, 'El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario'];
                        }
                    });
            });

        } else if (tipo === 'espacioFisico') {

            // Loop Espacios Físicos
            this.serviceAgenda.get({ 'idProfesional': this.modelo.espacioFisico.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                subscribe(agendas => {

                    // Hay problemas de solapamiento?
                    let agendasConSolapamiento = agendas.filter(agenda => {
                        return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                    });

                    // Si encontramos una agenda que coincida con la búsqueda...
                    if (agendasConSolapamiento.length > 0) {
                        this.alertas = [... this.alertas, 'El ' + this.modelo.espacioFisico.nombre + ' está asignado a otra agenda en ese horario'];
                    }
                });

        }
    }

}
