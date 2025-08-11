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

    showEditarAgenda = false;

    private subscriptionID = null;
    private _editarAgendaPanel: any;

    @Input()
    set editaAgendaPanel(value: any) {
        this._editarAgendaPanel = value;
        if (value.otroEspacioFisico) {
            this.espacioFisicoPropio = false;
        } else {
            this.espacioFisicoPropio = true;
        }
    }

    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarEspacioFisicoEmit = new EventEmitter<boolean>();

    // Usados en tag <panel-agenda> en gestor-agendas.html
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();
    @Output() showVistaTurnosEmit = new EventEmitter<boolean>();

    showEditarAgendaPanel = true;
    public showMapa = false;
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

    guardarAgenda(agenda: IAgenda) {

        if (this.alertas.length === 0) {
            // Quitar cuando esté solucionado inconveniente de plex-select
            let profesional = [];
            if (this.editaAgendaPanel.profesionales?.length > 40) {
                this.plex.info('warning', 'Seleccione un profesional de la lista');
            } else {
                if (this.editaAgendaPanel.profesionales) {
                    profesional = this.editaAgendaPanel.profesionales;
                }
                let espacioFisico;
                let otroEspacioFisico;
                // Para asegurar que guarde una de las dos opciones, espacioFisico u otroEspaciofisico
                if (this.espacioFisicoPropio) {
                    espacioFisico = this.editaAgendaPanel.espacioFisico;
                    otroEspacioFisico = null;
                } else {
                    espacioFisico = null;
                    otroEspacioFisico = this.editaAgendaPanel.otroEspacioFisico;
                }

                const patch = {
                    'agendaId': agenda.id,
                    'op': 'editarAgenda',
                    'profesional': profesional,
                    'espacioFisico': espacioFisico,
                    'otroEspacioFisico': otroEspacioFisico,
                    'prestaciones': agenda.tipoPrestaciones,
                    'organizacion': this.auth.organizacion.id,
                    enviarSms: this.editaAgendaPanel.enviarSms
                };

                this.serviceAgenda.patch(agenda.id, patch).subscribe({
                    next: (resultado: any) => {
                        this.editaAgendaPanel = resultado;
                        this.plex.toast('success', 'La agenda se guardó correctamente', 'Información');
                        this.actualizarEstadoEmit.emit(true);
                    },
                    error: (err: any) => {
                        if (typeof err === 'string') { // profesional/es sin permiso para alguna prestacion
                            this.plex.info('warning', err, 'Atención');
                        } else {
                            this.plex.info('warning', 'Otro usuario ha modificado el estado de la agenda seleccionada, su gestor se ha actualizado', err);
                            this.actualizarEstadoEmit.emit(true);
                        }
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
            event.callback(this.editaAgendaPanel.edificios || []);
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
                    if (this.editaAgendaPanel.espacioFisico?.id) {
                        listaEspaciosFisicos = this.editaAgendaPanel.espacioFisico ? [this.editaAgendaPanel.espacioFisico].concat(resultado) : resultado;
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
            if (this.editaAgendaPanel.espacio) {
                event.callback([this.editaAgendaPanel.espacioFisico]);

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
            this.editaAgendaPanel.espacioFisico = $data;
            this.guardarAgenda(this.editaAgendaPanel);
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
            if (this.editaAgendaPanel.profesionales) {
                this.editaAgendaPanel.profesionales.forEach((profesional) => {
                    const params = {
                        idProfesional: profesional.id,
                        rango: true,
                        desde: this.editaAgendaPanel.horaInicio,
                        hasta: this.editaAgendaPanel.horaFin,
                        estados: ['planificacion', 'disponible', 'publicada', 'pausada']
                    };
                    this.serviceAgenda.get(params).subscribe(agendas => {
                        // Hay problemas de solapamiento?
                        const agendasConSolapamiento = agendas.filter(agenda => {
                            return agenda.id !== this.editaAgendaPanel.id || !this.editaAgendaPanel.id; // Ignorar agenda actual
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
            if (this.editaAgendaPanel.espacioFisico) {
                const params = {
                    espacioFisico: this.editaAgendaPanel.espacioFisico._id,
                    rango: true,
                    desde: this.editaAgendaPanel.horaInicio,
                    hasta: this.editaAgendaPanel.horaFin,
                    estados: ['planificacion', 'disponible', 'publicada', 'pausada']
                };
                this.serviceAgenda.get(params).subscribe(agendas => {
                    // Hay problemas de solapamiento?
                    const agendasConSolapamiento = agendas.filter(agenda => {
                        return agenda.id !== this.editaAgendaPanel.id || !this.editaAgendaPanel.id; // Ignorar agenda actual
                    });

                    // Si encontramos una agenda que coincida con la búsqueda...
                    if (agendasConSolapamiento.length > 0) {
                        this.alertas = [... this.alertas, 'El ' + this.editaAgendaPanel.espacioFisico.nombre + ' está asignado a otra agenda en ese horario'];
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
