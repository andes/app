import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Router } from '@angular/router';
import { InstitucionService } from '../../../../services/turnos/institucion.service';

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
        if (value.otroEspacioFisico) {
            this.espacioFisicoPropio = false;
        } else {
            this.espacioFisicoPropio = true;
        }
    }

    get editaAgendaPanel(): any {
        this.eliminarProfBaja();
        return this._editarAgendaPanel;
    }

    @Output() editarEspacioFisicoEmit = new EventEmitter<boolean>();

    // Usados en tag <panel-agenda> en gestor-agendas.html
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();
    @Output() showVistaTurnosEmit = new EventEmitter<Boolean>();

    showEditarAgendaPanel: Boolean = true;
    public showMapa = false;
    public agenda: any = {};
    public alertas: any[] = [];
    public espaciosList = [];
    textoEspacio = 'Espacios físicos de la organización';
    espacioFisicoPropio = true;

    constructor(
        public plex: Plex,
        public serviceAgenda: AgendaService,
        public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public organizacionService: OrganizacionService,
        public serviceInstitucion: InstitucionService,
        public router: Router,
        public auth: Auth) {
    }

    ngOnInit() {
        this.editarEspacioFisicoEmit.emit(true);
        if (this.editaAgendaPanel.espacioFisico) {
            this.espaciosList = [this.editaAgendaPanel.espacioFisico];
            const query = {
                nombre: (this.editaAgendaPanel.espacioFisico ? this.editaAgendaPanel.espacioFisico.nombre : ''),
                limit: 10
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                this.espaciosList = resultado;
            });
        }
    }

    eliminarProfBaja() {
        const profesionales = [];
        if (this.agenda.profesionales) {
            for (let i = 0; i < this.agenda.profesionales.length; i++) {
                this.servicioProfesional.get({ id: this.agenda.profesionales[i].id }).subscribe(resultado => {
                    if (resultado[0].habilitado) {
                        profesionales.push(this.agenda.profesionales[i]);
                    }
                });
            };
            this.agenda.profesionales = profesionales;
        }
    }

    guardarAgenda(agenda: IAgenda) {
        if (this.alertas.length === 0) {

            // Quitar cuando esté solucionado inconveniente de plex-select
            let profesional = [];
            if (this.agenda.profesionales && this.agenda.profesionales.length > 40) {
                this.plex.info('warning', 'Seleccione un profesional de la lista');
            } else {
                if (this.agenda.profesionales) {
                    profesional = this.agenda.profesionales;
                }
                let espacioFisico;
                let otroEspacioFisico;
                // Para asegurar que guarde una de las dos opciones, espacioFisico u otroEspaciofisico
                if (this.espacioFisicoPropio) {
                    espacioFisico = this.agenda.espacioFisico;
                    otroEspacioFisico = null;
                } else {
                    espacioFisico = null;
                    otroEspacioFisico = this.agenda.otroEspacioFisico;
                }

                const patch = {
                    'op': 'editarAgenda',
                    'profesional': profesional,
                    'espacioFisico': espacioFisico,
                    'otroEspacioFisico': otroEspacioFisico,
                    enviarSms: this.agenda.enviarSms
                };

                this.serviceAgenda.patch(agenda.id, patch).subscribe((resultado: any) => {
                    this.agenda = resultado;
                    this.plex.toast('success', 'La agenda se guardó correctamente', 'Información');
                    this.actualizarEstadoEmit.emit(true);
                }, err => {
                    if (err) {
                        this.plex.info('warning', 'Otro usuario ha modificado el estado de la agenda seleccionada, su gestor se ha actualizado', err);
                        this.actualizarEstadoEmit.emit(true);
                    }
                });
            }
        }
    }

    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnosEmit.emit(true);
        this.editarEspacioFisicoEmit.emit(false);
    }

    loadEdificios(event) {
        if (event.query) {
            const query = {
                edificio: event.query,
            };
            this.servicioEspacioFisico.get(query).subscribe(listaEdificios => {
                event.callback(listaEdificios);
            });
        } else {
            event.callback(this.agenda.edificios || []);
        }
    }

    loadEspacios(event) {
        const query = {};
        let listaEspaciosFisicos = [];
        if (event.query) {
            query['nombre'] = event.query;
            query['organizacion'] = this.auth.organizacion.id;
            query['activo'] = true;
            if (this.espacioFisicoPropio) {
                this.servicioEspacioFisico.get(query).subscribe(resultado => {
                    if (this.agenda.espacioFisico && this.agenda.espacioFisico.id) {
                        listaEspaciosFisicos = this.agenda.espacioFisico ? [this.agenda.espacioFisico].concat(resultado) : resultado;
                    } else {
                        listaEspaciosFisicos = resultado;
                    }
                    this.espaciosList = listaEspaciosFisicos;
                    event.callback(listaEspaciosFisicos);
                });
            } else {
                this.serviceInstitucion.get({ search: '^' + query['nombre'] }).subscribe(resultado => {
                    listaEspaciosFisicos = resultado;
                    event.callback(listaEspaciosFisicos);
                });
            }
        } else {
            if (this.agenda.espacio) {
                event.callback([this.agenda.espacioFisico]);

            } else {
                event.callback([]);
            }
        }
    }

    espaciosChange(agenda) {

        const query: any = {
            limit: 20,
            activo: true,
            organizacion: this.auth.organizacion.id
        };

        if (agenda.espacioFisico) {
            const nombre = agenda.espacioFisico;
            query.nombre = nombre;
        }

        if (agenda.otroEspacioFisico) {
            const nombre = agenda.otroEspacioFisico;
            query.nombre = nombre;
        }

        if (agenda.equipamiento && agenda.equipamiento.length > 0) {
            const equipamiento = agenda.equipamiento.map((item) => item.term);
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

        if (tipo === 'profesionales') {
            // Loop profesionales
            if (this.agenda.profesionales) {
                this.agenda.profesionales.forEach((profesional, index) => {
                    const params = {
                        organizacion: this.auth.organizacion.id,
                        idProfesional: profesional.id,
                        rango: true,
                        desde: this.agenda.horaInicio,
                        hasta: this.agenda.horaFin,
                        estados: ['planificacion', 'disponible', 'publicada', 'pausada']
                    };
                    this.serviceAgenda.get(params).subscribe(agendas => {
                        // Hay problemas de solapamiento?
                        const agendasConSolapamiento = agendas.filter(agenda => {
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
                const params = {
                    espacioFisico: this.agenda.espacioFisico._id,
                    rango: true,
                    desde: this.agenda.horaInicio,
                    hasta: this.agenda.horaFin,
                    estados: ['planificacion', 'disponible', 'publicada', 'pausada']
                };
                this.serviceAgenda.get(params).subscribe(agendas => {
                    // Hay problemas de solapamiento?
                    const agendasConSolapamiento = agendas.filter(agenda => {
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

    filtrarEspacioFisico() {
        if (!this.espacioFisicoPropio) {
            this.textoEspacio = 'Otros Espacios Físicos';
        } else {
            this.textoEspacio = 'Espacios físicos de la organización';
        }
    }
}
