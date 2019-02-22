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
    public organizacion;
    public tipoDeFiltro;
    public esTabla;
    public dataGeolocalizacion;

    // Datos
    public data: any;

    public profesionales;
    public prestaciones;
    public estadoTurno;
    public estadoAgenda;
    public tipoTurno;

    public params = {};

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

        // this.params = {
        //     organizacion: this.auth.organizacion.id,
        // };

        // this.servicioTOP.post(this.params).subscribe((data) => {
        //     console.log(data);
        // });
    }

    displayChange($event) {
        this.esTabla = $event;
    }

    filter($event) {
        this.params = {
            organizacion: this.auth.organizacion.id,
            ...$event
        };

        this.servicioTOP.post(this.params).subscribe((data) => {
            console.log(data);
        });
    }


    // cargarLosFiltros() {
    //     this.profesionales =  this.data.profesionales;
    //     this.prestaciones =  this.data.prestacion;
    //     this.estadoTurno =  this.data.estado_turno;
    //     this.estadoAgenda =  this.data.estado_agenda;
    //     this.tipoTurno =  this.data.tipoTurno;
    // }

    // loadPrestaciones(event) {
    //     this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
    //         let dataF;
    //         if (this.prestacionesPermisos[0] === '*') {
    //             dataF = data;
    //         } else {
    //             dataF = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
    //         }
    //         event.callback(dataF);
    //     });
    // }
}
