import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Router } from '@angular/router';
@Component({
    selector: 'panel-agenda',
    templateUrl: 'panel-agenda.html'
})

export class PanelAgendaComponent implements OnInit {

    showEditarAgenda: Boolean = false;

    private subscriptionID = null;
    private _editarAgendaPanel: any;
    @Input('editaAgendaPanel')
    set editaAgendaPanel(value: any) {
        this._editarAgendaPanel = value;
        this.agenda = value;
    }
    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarEspacioFisicoEmit = new EventEmitter<boolean>();

    // Usados en tag <panel-agenda> en gestor-agendas.html
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();
    @Output() showVistaTurnosEmit = new EventEmitter<Boolean>();

    showEditarAgendaPanel: Boolean = true;

    public agenda: any = {};

    public alertas: any[] = [];

    private espaciosList = [];

    constructor(
        public plex: Plex,
        public serviceAgenda: AgendaService,
        public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public OrganizacionService: OrganizacionService,
        public router: Router,
        public auth: Auth) {
    }

    ngOnInit() {
        this.editarEspacioFisicoEmit.emit(true);
        if (this.editaAgendaPanel.espacioFisico) {
            this.espaciosList = [this.editaAgendaPanel.espacioFisico];
            let query = {
                nombre: this.editaAgendaPanel.espacioFisico.servicio.nombre,
                limit: 10
                // organizacion: this.auth.organizacion._id
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                this.espaciosList = resultado;
            });
        }
    }

    guardarAgenda(agenda: IAgenda) {
        if (this.alertas.length === 0) {

            // Quitar cuando esté solucionado inconveniente de plex-select
            let profesional = [];
            if (this.agenda.profesionales) {
                profesional = this.agenda.profesionales.map((prof) => {
                    delete prof.$order;
                    return prof;
                });
            }

            let espacioFisico = this.agenda.espacioFisico;
            if (this.agenda.espacioFisico) {
                delete espacioFisico.$order;
            } else {
                espacioFisico = null;
            }


            let patch = {
                'op': 'editarAgenda',
                'profesional': profesional,
                'espacioFisico': espacioFisico
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                this.agenda = resultado;
                this.showEditarAgenda = false;
                this.plex.toast('success', 'Información', 'La agenda se guardó correctamente ');
                this.actualizarEstadoEmit.emit(true);
            });
        }
    }


    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnosEmit.emit(true);
        this.editarEspacioFisicoEmit.emit(false);
    }


    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.agenda.profesionales) {
                    listaProfesionales = (resultado) ? this.agenda.profesionales.concat(resultado) : this.agenda.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.agenda.profesionales || []);
        }
    }


    loadEdificios(event) {
        // this.OrganizacionService.getById(this.auth.organizacion._id).subscribe(respuesta => {
        //     event.callback(respuesta.edificio);
        // });
        if (event.query) {
            let query = {
                edificio: event.query,
                // organizacion: this.auth.organizacion._id
            };
            this.servicioEspacioFisico.get(query).subscribe(listaEdificios => {
                event.callback(listaEdificios);
            });
        } else {
            event.callback(this.agenda.edificios || []);
        }
    }

    loadEspacios(event) {
        // this.servicioEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
        // this.servicioEspacioFisico.get({}).subscribe(event.callback);

        let listaEspaciosFisicos = [];
        if (event.query) {
            let query = {
                nombre: event.query,
                // organizacion: this.auth.organizacion._id
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                if (this.agenda.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.agenda.espacioFisico.concat(resultado) : this.agenda.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                this.espaciosList = listaEspaciosFisicos;
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.agenda.espacioFisico || []);
        }

    }

    espaciosChange(agenda) {
        let query = {};
        if (agenda.espacioFisico) {
            let nombre = agenda.espacioFisico;
            query = {
                nombre,
                limit: 20
            };
        } else if (agenda.equipamiento && agenda.equipamiento.length > 0) {

            let equipamiento = agenda.equipamiento;
            query = {
                equipamiento,
                limit: 20
            };
        } else {
            this.espaciosList = [];
            return;
        }

        if (this.subscriptionID) {
            this.subscriptionID.unsubscribe();
        }
        this.subscriptionID = this.servicioEspacioFisico.get(query).subscribe(resultado => {
            this.espaciosList = resultado;
        });
    }

    selectEspacio($data) {
        this.agenda.espacioFisico = $data;
        this.validarSolapamientos('espacioFisico');
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
            if (this.agenda.profesionales) {
                this.agenda.profesionales.forEach((profesional, index) => {
                    this.serviceAgenda.get({ 'idProfesional': profesional.id, 'rango': true, 'desde': this.agenda.horaInicio, 'hasta': this.agenda.horaFin }).
                        subscribe(agendas => {

                            // Hay problemas de solapamiento?
                            let agendasConSolapamiento = agendas.filter(agenda => {
                                return agenda.id !== this.agenda.id || !this.agenda.id; // Ignorar agenda actual
                            });

                            // Si encontramos una agenda que coincida con la búsqueda...
                            if (agendasConSolapamiento.length > 0) {
                                this.alertas = [... this.alertas, 'El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario'];
                            }
                        });
                });
            }
        } else if (tipo === 'espacioFisico') {
            // Loop Espacios Físicos
            if (this.agenda.espacioFisico) {
                this.serviceAgenda.get({ 'espacioFisico': this.agenda.espacioFisico._id, 'rango': true, 'desde': this.agenda.horaInicio, 'hasta': this.agenda.horaFin }).
                    subscribe(agendas => {
                        // Hay problemas de solapamiento?
                        let agendasConSolapamiento = agendas.filter(agenda => {
                            return agenda.id !== this.agenda.id || !this.agenda.id; // Ignorar agenda actual
                        });

                        // Si encontramos una agenda que coincida con la búsqueda...
                        if (agendasConSolapamiento.length > 0) {
                            this.alertas = [... this.alertas, 'El ' + this.agenda.espacioFisico.nombre + ' está asignado a otra agenda en ese horario'];
                        }
                    });
            }
        }
    }
}
