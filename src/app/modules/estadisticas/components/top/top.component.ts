import * as moment from 'moment';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { SolicitudesTopService } from '../../services/top.service';

@Component({
    templateUrl: 'top.html',
    styleUrls: ['top.scss']
})
export class TopComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    public prestacionesPermisos = [];
    public prestacionDestino;
    public permisosReglas;
    public permisoAnular = false;
    public estado;
    public estados = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'rechazada', nombre: 'RECHAZADA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public esTabla;

    // Datos
    public data: any;
    public dataEntrada: any = {
        organizaciones: undefined,
        estados: undefined,
        solicitudesDestino: undefined,
        solicitudesOrigen: undefined,
        profesionalesDestino: undefined,
        profesionalesOrigen: undefined
    };
    public dataSalida: any = {
        organizaciones: undefined,
        estados: undefined,
        solicitudesDestino: undefined,
        solicitudesOrigen: undefined,
        profesionalesDestino: undefined,
        profesionalesOrigen: undefined
    };

    public params = {};
    public panelIndex = 0;
    public activeTab = 0;

    constructor(
        private plex: Plex,
        public auth: Auth,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioTOP: SolicitudesTopService
    ) { }


    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Dashboard', route: '/dashboard' },
            { name: 'Top' }
        ]);
    }

    displayChange($event) {
        this.esTabla = $event;
    }

    filter($event) {
        this.params = {
            ...$event
        };

        this.servicioTOP.post($event).subscribe((data) => {
            this.dataEntrada = data.entrada;
            this.dataSalida = data.salida;
        });
    }

    cambio(activeTab) {
        this.activeTab = activeTab;
    }
}
