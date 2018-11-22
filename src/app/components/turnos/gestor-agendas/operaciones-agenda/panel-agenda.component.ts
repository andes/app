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

    public espaciosList = [];

    constructor(
        public plex: Plex,
        public serviceAgenda: AgendaService,
        public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public organizacionService: OrganizacionService,
        public router: Router,
        public auth: Auth) {
    }

    ngOnInit() {
        this.editarEspacioFisicoEmit.emit(true);
        if (this.editaAgendaPanel.espacioFisico) {
            this.espaciosList = [this.editaAgendaPanel.espacioFisico];
            let query = {
                nombre: (this.editaAgendaPanel.espacioFisico ? this.editaAgendaPanel.espacioFisico.nombre : ''),
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
            if (this.agenda.profesionales && this.agenda.profesionales.length > 10) {
                this.plex.info('warning', 'Seleccione un profesional de la lista');
            } else {
                if (this.agenda.profesionales) {
                    profesional = this.agenda.profesionales;
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
                    // this.showEditarAgenda = false;
                    this.plex.toast('success', 'Información', 'La agenda se guardó correctamente ');
                    this.actualizarEstadoEmit.emit(true);
                });
            }
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
                // if (this.agenda.profesionales) {
                //     listaProfesionales = (resultado) ? [...resultado] : [...this.agenda.profesionales];
                // } else {
                //     listaProfesionales = [...resultado];
                // }
                event.callback(resultado);
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
        let query = {};
        let listaEspaciosFisicos = [];
        if (event.query) {
            query['nombre'] = event.query;
            query['organizacion'] = this.auth.organizacion.id;

            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                if (this.agenda.espacioFisico && this.agenda.espacioFisico.id) {
                    listaEspaciosFisicos = this.agenda.espacioFisico ? this.agenda.espacioFisico.concat(resultado) : resultado;
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

        let query: any = {
            limit: 20,
            activo: true,
            organizacion: this.auth.organizacion._id
        };

        if (agenda.espacioFisico) {
            let nombre = agenda.espacioFisico;
            query.nombre = nombre;
        }

        if (agenda.equipamiento && agenda.equipamiento.length > 0) {
            let equipamiento = agenda.equipamiento.map((item) => item.term);
            query.equipamiento = equipamiento;
        }

        if (!agenda.espacioFisico && !agenda.equipamiento) {
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
        this.validarSolapamientos('espacioFisico');
        if (this.alertas.length === 0) {

            this.agenda.espacioFisico = $data;
            this.guardarAgenda(this.agenda);

        }
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
                    let params = {
                        organizacion: this.auth.organizacion.id,
                        idProfesional: profesional.id,
                        rango: true,
                        desde: this.agenda.horaInicio,
                        hasta: this.agenda.horaFin,
                        estados: ['planificacion', 'disponible', 'publicada', 'pausada']
                    };
                    // this.serviceAgenda.get({ 'organizacion': this.auth.organizacion.id, 'idProfesional': profesional.id, 'rango': true, 'desde': this.agenda.horaInicio, 'hasta': this.agenda.horaFin }).subscribe(agendas => {
                    this.serviceAgenda.get(params).subscribe(agendas => {
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
                this.serviceAgenda.get({ 'espacioFisico': this.agenda.espacioFisico._id, 'rango': true, 'desde': this.agenda.horaInicio, 'hasta': this.agenda.horaFin }).subscribe(agendas => {
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
