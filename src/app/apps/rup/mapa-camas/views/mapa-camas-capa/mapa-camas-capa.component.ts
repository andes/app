import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs/Observable';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { take, map, pluck, tap, timeInterval, delay } from 'rxjs/operators';
import { interval } from 'rxjs';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit {
    capa$: Observable<string>;



    organizacion: string;
    fecha = moment().toDate();
    ambito: string;
    capa: string;
    camas: Observable<any[]>;
    snapshot: ISnapshot[];
    auxSnapshot: ISnapshot[];
    unidadesOrganizativas = [];
    sectores = [];
    tiposCama = [];
    camasXEstado: any;
    itemsDropdown = [
        { label: 'CENSO DIARIO', route: `/internacion/censo/diario` },
        { label: 'CENSO MENSUAL', route: `/internacion/censo/mensual` },
    ];
    estadosCama: any;
    estados: any;
    relaciones: any;
    maquinaEstados: IMaquinaEstados;

    selectedCama: any;
    estadoDestino: any;

    opcionesCamas = [];
    accion = null;

    cambiarUO;
    camasDisponibles;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;

        this.capa$ = this.route.params.pipe(
            take(1),
            pluck('capa'),
            // [TODO] chequear permisos
            tap((capa) => {
                this.capa = capa; // BORRAR
                this.mapaCamasService.setAmbito('internacion');
                this.mapaCamasService.setCapa(capa);
            })
        );
        this.capa$.subscribe();

        this.mapaCamasService.setFecha(new Date());

        this.mapaCamasService.setOrganizacion(this.auth.organizacion.id);

        this.organizacion = this.auth.organizacion.id;
        this.getSnapshot();
    }

    getSnapshot(fecha = null) {
        if (!fecha) {
            fecha = this.fecha;
        }

        this.camas = this.mapaCamasService.snapshotFiltrado$;
    }

    agregarCama() {
        this.router.navigate([`/internacion/cama`]);
    }

    verListadoInternacion() {
        this.router.navigate([`/internacion/listado-internacion`]);
    }

    selectCama(cama, relacion) {
        this.selectedCama = cama;
        if (relacion) {
            this.estadoDestino = relacion.destino;
            this.accion = relacion.accion;
            let relacionesConDestino = this.relaciones.filter(rel => rel.destino === relacion.destino);
            relacionesConDestino.map(rel => {
                this.opcionesCamas.push(...this.snapshot.filter(snap => snap.estado === rel.origen));
            });
        }
    }

    accionDesocupar(accion) {
        if (!accion.egresar) {
            this.accion = 'cambiarCama';
            this.cambiarUO = accion.cambiarUO;
            this.camasDisponibles = accion.camasDisponibles;
        } else {
            this.accion = accion.egresar;
        }
    }

    refresh(accion) {
        let i = this.snapshot.findIndex((snap: ISnapshot) => snap.idCama === accion.cama._id);
        this.snapshot[i] = accion.cama;
        this.camas = Observable.of(this.snapshot);
        this.volverAResumen();
    }

    volverAResumen() {
        this.selectedCama = null;
        this.estadoDestino = null;
        this.accion = null;
    }

    cambiarCama(selectedCama) {
        this.selectedCama = selectedCama;
    }

    verDetalle(cama) {
        if (!this.estadoDestino) {
            if (this.selectedCama && cama.idCama === this.selectedCama.idCama) {
                this.volverAResumen();
            } else {
                this.selectedCama = cama;
                this.estadoDestino = null;
                this.accion = 'verDetalle';
            }
        }
    }

    volver() {
        this.location.back();
    }

    gotoListaEspera() {
        this.router.navigate([`/internacion/${this.ambito}/${this.capa}/lista-espera`]);
    }
}
