import * as moment from 'moment';

import { Observable } from 'rxjs/Rx';
import { Component, AfterViewInit, HostBinding } from '@angular/core';

import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { EstAgendasService } from '../services/agenda.service';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public organizacion;

    // Datos
    public data: any;

    public sexoLabels = [];
    public sexoData = [];

    public edadLabels = [];
    public edadData = [];

    public profesionalLabels = [];
    public profesionalData = [];

    public administrativosLabels = [];
    public administrativosData = [];

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

    public filtros = {

    };

    constructor(private plex: Plex, public auth: Auth, public estService: EstAgendasService) { }

    ngAfterViewInit() {
        // this.organizacion = this.auth.organizacion;
    }

    filter ($event) {
        this.sexoLabels = [];
        this.sexoData = [];
        this.edadLabels = [];
        this.edadData = [];
        this.profesionalLabels = [];
        this.profesionalData = [];
        this.administrativosLabels = [];
        this.administrativosData = [];
        this.prestacionLabels = [];
        this.prestacionData = [];
        this.estadoLabels = [];
        this.estadoData = [];


        let params = {
            organizacion: this.auth.organizacion.id,
            ...$event
        };
        this.estService.get(params).subscribe((data) => {
            this.data = data[0];
            if (this.data.sexo) {
                this.data.sexo.forEach((item) => {
                    this.sexoLabels.push(item._id);
                    this.sexoData.push(item.total);
                });
            }

            if (this.data.edad) {
                this.data.edad.forEach((item) => {
                    this.edadLabels.push(item._id);
                    this.edadData.push(item.count);
                });
            }

            if (this.data.profesionales) {
                this.data.profesionales.forEach((item) => {
                    this.profesionalLabels.push(item.apellido + ' ' + item.nombre);
                    this.profesionalData.push(item.total);
                });
            }

            if (this.data.administrativo) {
                this.data.administrativo.forEach((item) => {
                    this.administrativosLabels.push(item.apellido + ' ' + item.nombre);
                    this.administrativosData.push(item.total);
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

            this.setFilters();

        });
    }

    setFilters () {
        if (this.data.sexo) {
            this.filtros['sexo'] = [{id: 0, nombre: 'masculino' }, {id: 1, nombre: 'femenino' }];
        }
        if (this.data.edad) {
            this.filtros['edad'] = [
                {id: '0-1', nombre: '0 Años' },
                {id: '1-2', nombre: '1 Años' },
                {id: '2-3', nombre: '2 Años' },
                {id: '3-4', nombre: '3 Años' },
                {id: '4-5', nombre: '4 Años' },
                {id: '5-6', nombre: '5 Años' },
                {id: '6-7', nombre: '6 Años' },
                {id: '7-8', nombre: '7 Años' },
                {id: '8-9', nombre: '8 Años' },
                {id: '9-10', nombre: '9 Años' },
                {id: '10-20', nombre: '10 a 20 Años' },
                {id: '20-30', nombre: '20 a 30 Años' },
                {id: '30-40', nombre: '30 a 40 Años' },
                {id: '40-50', nombre: '40 a 50 Años' },
                {id: '50-60', nombre: '50 a 60 Años' },
                {id: '60-70', nombre: '60 a 70 Años' },
                {id: '70-80', nombre: '70 a 80 Años' },
                {id: '80-90', nombre: '80 a 90 Años' },
                {id: '90-150', nombre: 'Más de 90 Años' },
            ];
        }
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
        if (this.data.administrativo) {
            this.filtros['administrativo'] = [];
            this.data.administrativo.forEach((item) => {
                this.filtros['administrativo'].push({
                    id: item._id,
                    nombre: item.nombre
                });
            });
        }
    }

}
