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
        this.modelo = value;
    }
    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() showVistaTurnos = new EventEmitter<Boolean>();
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();

    showEditarAgendaPanel: Boolean = true;

    public modelo: any = {};

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
            if (this.modelo.profesionales) {
                profesional = this.modelo.profesionales.map((prof) => {
                    delete prof.$order;
                    return prof;
                });
            }

            let espacioFisico = this.modelo.espacioFisico;
            if (this.modelo.espacioFisico) {
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
                this.modelo = resultado;
                this.showEditarAgenda = false;
                this.plex.toast('success', 'Información', 'La agenda se guardó correctamente ');
                this.actualizarEstadoEmit.emit(true);
            });
        }
    }


    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnos.emit(true);
    }


    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.profesionales.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.profesionales || []);
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
            event.callback(this.modelo.edificios || []);
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
                if (this.modelo.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.modelo.espacioFisico.concat(resultado) : this.modelo.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                this.espaciosList = listaEspaciosFisicos;
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.modelo.espacioFisico || []);
        }

    }

    espaciosChange(modelo) {
        if (modelo.espacioFisico || modelo.servicio) {
            let nombre = modelo.espacioFisico;
            let servicio = modelo.servicio;
            let query = {
                nombre,
                servicio,
                limit: 20
            };
            if (this.subscriptionID) {
                this.subscriptionID.unsubscribe();
            }
            this.subscriptionID = this.servicioEspacioFisico.get(query).subscribe(resultado => {
                this.espaciosList = resultado;
            });
        } else {
            this.espaciosList = [];
        }
    }

    selectEspacio($data) {
        this.modelo.espacioFisico = $data;
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
            if (this.modelo.profesionales) {
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
            }
        } else if (tipo === 'espacioFisico') {
            // Loop Espacios Físicos
            if (this.modelo.espacioFisico) {
                this.serviceAgenda.get({ 'espacioFisico': this.modelo.espacioFisico._id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
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
}
