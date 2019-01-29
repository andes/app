import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { EstAgendasService } from '../../services/agenda.service';

@Component({
    templateUrl: 'citas.html',
    styleUrls: ['citas.scss']
})
export class CitasComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public organizacion;

    // Datos
    public data: any;

    public profesionalLabels = [];
    public profesionalData = [];

    public prestacionLabels = [];
    public prestacionData = [];

    public estadoLabels = [];
    public estadoData = [];


    public barOptions = {
        legend: { display: false },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: false
                }
            }]

        }
    };

    public params = {
        tipoDeFiltro: null
    };

    public filtros = {

    };
    copiaTipoDeFiltro: any;

    constructor(private plex: Plex, public auth: Auth, public estService: EstAgendasService) { }

    ngAfterViewInit() {
        // this.organizacion = this.auth.organizacion;
    }

    filter($event) {
        this.profesionalLabels = [];
        this.profesionalData = [];
        this.prestacionLabels = [];
        this.prestacionData = [];
        this.estadoLabels = [];
        this.estadoData = [];
        this.params = {
            organizacion: this.auth.organizacion.id,
            ...$event
        };
        // Le pegamos a la consulta de la api de turno..
        if ($event.tipoDeFiltro === 'turnos') {
            this.estService.post(this.params).subscribe((data) => {
                this.data = data[0];
                this.cargarLosFiltros();
            });
        } else {
            this.cargarLosFiltros();
            this.data = null;
            // Llamamos a la consulta de agendas
        }

    }


    cargarLosFiltros() {
        if (this.data.profesionales) {
            this.data.profesionales.forEach((item) => {
                this.profesionalLabels.push(item.apellido + ' ' + item.nombre);
                this.profesionalData.push(item.total);
            });
        }

        if (this.data.prestacion) {
            this.data.prestacion.forEach((item) => {
                this.prestacionLabels.push(item.nombre);
                this.prestacionData.push(item.total);
            });
        }

        if (this.data.estado_turno) {
            this.data.estado_turno.forEach((item) => {
                this.estadoLabels.push(item._id);
                this.estadoData.push(item.count);
            });
        }

        if (!(this.copiaTipoDeFiltro === this.params.tipoDeFiltro)) {
            this.setFilters();
        }
    }

    setFilters() {
        this.copiaTipoDeFiltro = this.params.tipoDeFiltro;
        if (this.data.prestacion) {
            this.filtros['prestacion'] = [];
            this.data.prestacion.forEach((item) => {
                this.filtros['prestacion'].push({
                    id: item._id,
                    nombre: item.nombre
                });
            });
        }
        if (this.data.profesionales) {
            this.filtros['profesional'] = [];
            this.data.profesionales.forEach((item) => {
                this.filtros['profesional'].push({
                    id: item._id,
                    nombre: item.apellido + ' ' + item.nombre
                });
            });
        }

        if (this.data.estado_turno) {
            this.filtros['estado_turno'] = [];
            this.data.estado_turno.forEach((item) => {
                this.filtros['estado_turno'].push({
                    id: item._id,
                    nombre: item._id
                });
            });
        }
    }

}
