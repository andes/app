import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable, Subject } from 'rxjs';
import { IntegridadService } from './integridad.service';
import { IInconsistencia } from '../../interfaces/IInconsistencia';
import { MapaCamasService } from '../../services/mapa-camas.service';
import * as moment from 'moment';

@Component({
    selector: 'app-integridad-camas',
    templateUrl: 'integridad-camas.component.html',
    styleUrls: ['../mapa-camas-capa/mapa-camas-capa.component.scss']
})

export class IntegridadCamasComponent implements OnInit {
    public lista = new Subject();
    public listaInconsistencias$: Observable<any[]>;

    public ambito = 'internacion';
    public capa: string;
    public selectedInconsistencia$: Observable<IInconsistencia>;

    public accion = null;
    constructor(
        public auth: Auth,
        private router: Router,
        private plex: Plex,
        private integridadService: IntegridadService,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            route: '/internacion/mapa-camas',
            name: 'Internacion'
        }, {
            name: 'Integridad'
        }]);

        const capaArr = this.auth.getPermissions('internacion:rol:?');
        if (capaArr.length === 1) {
            this.capa = capaArr[0];
            this.integridadService.setAmbito(this.ambito);
            this.integridadService.setCapa(this.capa);
            this.listaInconsistencias$ = this.integridadService.listaInconsistenciasFiltrada$;
        } else {
            this.router.navigate(['/inicio']);
        }

        this.selectedInconsistencia$ = this.integridadService.selectedInconsistencia;
        this.mapaCamasService.setView('mapa-camas');
        this.mapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setCapa('estadistica');
    }

    selectInconsistencia(inconsistencia, selectedInconsistencia) {
        if (!selectedInconsistencia.source._id || selectedInconsistencia.source.idCama !== inconsistencia.source.idCama) {
            this.mapaCamasService.select(inconsistencia.source);
            this.mapaCamasService.setFecha(moment(inconsistencia.target.fecha).subtract(1, 'hour').toDate());
            this.integridadService.select(inconsistencia);
            this.accion = 'verDetalle';
        } else {
            this.accion = null;
            this.integridadService.select(null);
        }
    }

    unselectInconsistencia() {
        this.accion = null;
        this.integridadService.select(null);
    }
}
