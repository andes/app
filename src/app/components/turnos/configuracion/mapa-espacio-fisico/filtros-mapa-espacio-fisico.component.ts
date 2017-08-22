import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';

import * as moment from 'moment';

@Component({
    selector: 'filtros-mapa-espacio-fisico',
    templateUrl: 'filtros-mapa-espacio-fisico.html'
})

export class FiltrosMapaEspacioFisicoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    @Output() onChange = new EventEmitter<any>();
    @Input() agendaSeleccionada: any = {};

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

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: TipoPrestacionService,
        public servicioProfesional: ProfesionalService, public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService, private router: Router,
        public auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;
    }

    nombreChange() {
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

    loadTipoPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe((data) => {
            let dataF = data.filter(x => {
                return this.auth.check('turnos:planificarAgenda:prestacion:' + x.id);
            });
            event.callback(dataF);
        });
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
        let listaEquipamiento = [];
        if (event.query) {
            let query = {
                equipamiento: event.query,
            };
            this.servicioEspacioFisico.get(query).subscribe(respuesta => {
                this.agenda.equipamiento = respuesta.map((ef) => {
                    return (typeof ef.equipamiento !== 'undefined' && ef.equipamiento.length > 0 ? ef.equipamiento : []);
                }).filter((elem, index, self) => {
                    return index === self.indexOf(elem);
                });

                if (this.agenda.equipamiento) {
                    listaEquipamiento = this.agenda.equipamiento;
                }
                event.callback(listaEquipamiento);
            });
        } else {
            event.callback(this.agenda.equipamiento || []);
        }
    }


}
