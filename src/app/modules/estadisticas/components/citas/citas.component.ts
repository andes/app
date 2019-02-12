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
    public esTabla;
    public dataGeolocalizacion;

    // Datos
    public data: any;

    public graficoTablaProfesional;
    public graficoTablaPrestacion;
    public graficoEstadoTurno;
    public graficoEstadoAgenda;
    public graficoTipoTurno;

    public params = {};

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

    tablaGrafico($event) {
        this.esTabla = $event;
    }

    filter($event) {
        this.params = {
            organizacion: this.auth.organizacion.id,
            ...$event
        };
        this.estService.post(this.params).subscribe((data) => {
            this.dataGeolocalizacion = data[2];
            this.data = data[0];
            this.tipoDeFiltro = data[1].tipoDeFiltro === 'turnos' ? 'Turnos' : 'Agendas';
            this.cargarLosFiltros();
        });
    }


    cargarLosFiltros() {
        if (this.data.profesionales && this.data.profesionales.length) {
            this.graficoTablaProfesional = {data: this.data.profesionales, tipoDeFiltro: this.tipoDeFiltro, titulo: 'Profesionales', tipoGrafico: 'bar'};
        }

        if (this.data.prestacion && this.data.prestacion.length) {
            this.graficoTablaPrestacion = {data: this.data.prestacion, tipoDeFiltro: this.tipoDeFiltro, titulo: 'Prestaciones', tipoGrafico: 'bar'};
        }

        if (this.data.estado_turno) {
            this.graficoEstadoTurno = {data: this.data.estado_turno, tipoDeFiltro: this.tipoDeFiltro, titulo: 'Estado', tipoGrafico: 'pie'};
        }

        if (this.data.estado_agenda) {
            this.graficoEstadoAgenda = {data: this.data.estado_agenda, tipoDeFiltro: this.tipoDeFiltro, titulo: 'Estado', tipoGrafico: 'pie'};
        }

        if (this.data.tipoTurno) {
            this.graficoTipoTurno = {data: this.data.tipoTurno, tipoDeFiltro: this.tipoDeFiltro, titulo: 'Tipo', tipoGrafico: 'pie'};
        }
    }
}
