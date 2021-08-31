import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ProfesionalService } from './../../../../services/profesional.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';

@Component({
    selector: 'filtros-mapa-espacio-fisico',
    templateUrl: 'filtros-mapa-espacio-fisico.html'
})

export class FiltrosMapaEspacioFisicoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    @Output() onChange = new EventEmitter<any>();

    private timeoutId = null;
    public showListadoTurnos = false;
    public fechaDesde: any;
    public fechaHasta: any;
    public agendas: any = [];
    public agenda: any = {};
    public hoy = false;
    public autorizado = false;
    public mostrarMasOpciones = false;
    public espacioNombre = '';

    constructor(
        public plex: Plex,
        public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService,
        public auth: Auth
    ) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;
    }

    nombreChange($event) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.validarTodo();
        }, 300);
    }

    validarTodo() {
        this.onChange.emit(this.agenda);
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            const query = {
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
        if (event.query) {
            const query = {
                edificio: event.query
            };
            this.servicioEspacioFisico.get(query).subscribe(listaEdificios => {
                event.callback(listaEdificios);
            });
        } else {
            event.callback(this.agenda.edificios || []);
        }
    }

    loadEspacios(event) {
        let listaEspaciosFisicos = [];
        if (event.query) {
            const query = {
                nombre: event.query,
                activo: true
            };
            this.servicioEspacioFisico.get(query).subscribe(respuesta => {
                if (this.agenda.espacioFisico) {
                    listaEspaciosFisicos = respuesta ? this.agenda.espacioFisico.concat(respuesta) : this.agenda.espacioFisico;
                } else {
                    listaEspaciosFisicos = respuesta;
                }
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.agenda.espacioFisico || []);
        }

    }

    loadEquipamientos(event) {
        if (event.query) {
            const query = {
                equipamiento: event.query,
            };
            this.servicioEspacioFisico.get(query).subscribe(respuesta => {
                let resultado = respuesta.reduce((listado, ef) => {
                    return [...listado, ...(typeof ef.equipamiento !== 'undefined' && ef.equipamiento.length > 0 ? ef.equipamiento : [])];
                }, []).filter((elem, index, self) => {
                    return index === self.indexOf(elem);
                });
                if (this.agenda.equipamiento) {
                    resultado = [...this.agenda.equipamiento, ...resultado];
                }
                event.callback(resultado);
            });
        } else {
            event.callback(this.agenda.equipamiento || []);
        }
    }


}
