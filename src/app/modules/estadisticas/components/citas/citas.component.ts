import * as moment from 'moment';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { EstAgendasService } from '../../services/agenda.service';

@Component({
    templateUrl: 'citas.html',
    styleUrls: ['citas.scss']
})
export class CitasComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public organizacion;
    public tipoDeFiltro;

    // Datos
    public data: any;

    public profesionalLabels = [];
    public profesionalData = [];

    public prestacionLabels = [];
    public prestacionData = [];

    public estadoLabels = [];
    public estadoData = [];

    public estadoAgendaLabels = [];
    public estadoAgendaData = [];

    public tipoTurnoLabels = [];
    public tipoTurnoData = [];

    public barOptions = {
        legend: { display: false },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: false
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                }
            }],

        },
    };



    barColors: Array<any> = [{ backgroundColor: '#5bc0de' }];


    chartColors: Array<any> = [{
        backgroundColor: [
            '#f1930d',
            '#ff4a1a',
            '#f4a03b',
            '#92278e',
            '#0070cc',
            '#00bcb4',
            '#b9c512',
            '#111',
            '#b9c512',
            '#002738',
            '#660520',
            '#a0a0a0',
            '#8bc43f'
        ]
    }];

    public params = {

    };

    public filtros = {

    };


    constructor(private plex: Plex, public auth: Auth, public estService: EstAgendasService) { }


    ngOnInit() {
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            name: 'Estadísticas'
        },
        {
            name: 'Citas'
        }
        ]);
    }


    filter($event) {
        this.profesionalLabels = [];
        this.profesionalData = [];
        this.prestacionLabels = [];
        this.prestacionData = [];
        this.estadoLabels = [];
        this.estadoData = [];
        this.estadoAgendaLabels = [];
        this.estadoAgendaData = [];
        this.tipoTurnoLabels = [];
        this.tipoTurnoData = [];
        this.params = {
            organizacion: this.auth.organizacion.id,
            ...$event
        };
        this.estService.post(this.params).subscribe((data) => {
            this.data = data[0];
            this.tipoDeFiltro = data[1].tipoDeFiltro === 'turnos' ? 'Turnos' : 'Agendas';
            this.cargarLosFiltros();
        });

    }


    cargarLosFiltros() {
        if (this.data.profesionales) {
            let preDataProfesionales = {data: [], label: this.tipoDeFiltro};
            this.data.profesionales.forEach((item) => {
                this.profesionalLabels.push(item.apellido + ' ' + item.nombre);
                preDataProfesionales.data.push(item.total);
            });
            this.profesionalData.push(preDataProfesionales);
        }

        if (this.data.prestacion) {
            let preDataPrestaciones = {data: [], label: this.tipoDeFiltro};
            this.data.prestacion.forEach((item) => {
                this.prestacionLabels.push(item.nombre);
                preDataPrestaciones.data.push(item.total);
            });
            this.prestacionData.push(preDataPrestaciones);
        }

        if (this.data.estado_turno) {
            this.data.estado_turno.forEach((item) => {
                this.estadoLabels.push(item._id);
                this.estadoData.push(item.count);
            });
        }

        if (this.data.estado_agenda) {
            this.data.estado_agenda.forEach((item) => {
                this.estadoAgendaLabels.push(item._id);
                this.estadoAgendaData.push(item.total);
            });
        }

        if (this.data.tipoTurno) {
            this.data.tipoTurno.forEach((item) => {
                this.tipoTurnoLabels.push(item._id);
                this.tipoTurnoData.push(item.total);
            });
        }

    }
}
