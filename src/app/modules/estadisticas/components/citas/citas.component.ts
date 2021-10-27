import * as moment from 'moment';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { EstAgendasService } from '../../services/agenda.service';
import { getRefactorNombre } from '../../utils/comboLabelFiltro.component';

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

    public mensajeInicial = true;
    public profesionales;
    public prestaciones;
    public estadoTurno;
    public estadoAgenda;
    public tipoTurno;

    public params = {};

    constructor(private plex: Plex, public auth: Auth, public estService: EstAgendasService) { }


    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Citas' }
        ]);
    }

    displayChange($event) {
        this.esTabla = $event;
    }

    filter($event) {
        this.params = $event;
        this.estService.post(this.params).subscribe((data) => {
            this.mensajeInicial = false;
            this.data = data;
            this.tipoDeFiltro = $event.tipoDeFiltro === 'turnos' ? 'Turnos' : 'Agendas';
            this.cargarLosFiltros();
        });
        if ($event.tipoDeFiltro === 'turnos') {
            this.estService.postFiltroPorCiudad(this.params).subscribe((data) => {
                this.dataGeolocalizacion = data;
            });
        }
    }


    cargarLosFiltros() {
        this.profesionales = this.data.profesionales;
        this.prestaciones = this.data.prestacion;
        this.estadoTurno = getRefactorNombre(this.data.estado_turno);
        this.estadoAgenda = getRefactorNombre(this.data.estado_agenda);
        this.tipoTurno = getRefactorNombre(this.data.tipoTurno);
    }
}
