import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

import { OrganizacionService } from '../../services/organizacion.service';

// Services
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'consultaDiagnostico',
    templateUrl: 'consultaDiagnostico.html',

})

export class ConsultaDiagnosticoComponent implements OnInit {

    //@HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // private timeoutHandle: number;


    // Propiedades públicas
    public parametros;
    public horaInicio;
    public horaFin;
    public organizacion;
    public diagnosticos = [];
    public diagnostico;
    public seleccionada = [];
    public listaPacientes = false;


    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private router: Router,
        private server: Server,
        private agendaService: AgendaService,
        private auth: Auth,
        private servicioOrganizacion: OrganizacionService,

    ) {

    }

    public ngOnInit() {
        this.parametros = {
            horaInicio: ' ',
            horaFin: ' ',
            organizacion: ''
        };
        this.parametros = {
            fechaDesde: this.horaInicio,
            fechaHasta: this.horaFin,
            organizacion: this.auth.organizacion._id
        };


    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }


    }


    public imprimir() {
        if (this.parametros['horaInicio'] && this.parametros['horaFin'] && this.parametros['organizacion']) {
            this.agendaService.findConsultaDiagnosticos(this.parametros).subscribe((diagnosticos) => {
                this.diagnosticos = diagnosticos;
            });
        }
    }


    refreshSelection(value, tipo) {
        if (tipo === 'horaInicio') {
            let horaInicio = moment(this.horaInicio).startOf('day');
            if (horaInicio.isValid()) {
                this.parametros['horaInicio'] = horaInicio.isValid() ? horaInicio.toDate() : moment().format();
            }
        }
        if (tipo === 'horaFin') {
            let horaFin = moment(this.horaFin).endOf('day');
            if (horaFin.isValid()) {
                this.parametros['horaFin'] = horaFin.isValid() ? horaFin.toDate() : moment().format();
            }
        }
        if (tipo === 'organizacion') {
            if (value.value !== null) {
                this.parametros['organizacion'] = this.auth.organizacion._id;
            } else {
                this.parametros['organizacion'] = '';
            }
        }



    }
    datosPacientes(indice) {
        this.diagnostico = this.diagnosticos[indice];
        for (let i = 0; i < this.seleccionada.length; i++) {
            this.seleccionada[i] = false;
        }
        if (this.diagnostico.ficha !== null) {
            this.seleccionada[indice] = true;
            this.listaPacientes = true;
        } else {
            this.listaPacientes = false;
        }
    }


}
