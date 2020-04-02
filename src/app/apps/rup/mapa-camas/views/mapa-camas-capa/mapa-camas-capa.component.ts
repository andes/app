import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { interval, Subscription, combineLatest } from 'rxjs';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit {
    capa$: Observable<string>;
    selectedCama$: Observable<ISnapshot>;
    selectedPaciente$: Observable<IPaciente>;
    organizacion: string;
    fecha = moment().toDate();
    ambito: string;
    private capa: string;
    camas: Observable<any[]>;
    snapshot: ISnapshot[];
    itemsDropdown = [
        { label: 'CENSO DIARIO', route: `/internacion/censo/diario` },
        { label: 'CENSO MENSUAL', route: `/internacion/censo/mensual` },
    ];
    estadoRelacion: any;
    estadosCama: any;
    estados: any;
    relaciones: any;
    maquinaEstados: IMaquinaEstados;
    opcionesCamas = [];
    accion = null;
    cambiarUO;
    camasDisponibles;

    public permisoIngreso = false;
    public permisoCenso = false;
    public permisoCrearCama = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Mapa de Camas'
        }]);

        this.capa$ = this.route.params.pipe(
            take(1),
            pluck('capa'),
            tap((capa) => {
                const permisosInternacion = this.auth.getPermissions('internacion:rol:?');
                if (permisosInternacion.length === 1 && permisosInternacion[0] === capa) {
                    this.capa = capa; // BORRAR
                    this.mapaCamasService.setAmbito('internacion');
                    this.mapaCamasService.setCapa(capa);
                } else {
                    this.router.navigate(['/inicio']);
                }
            })
        );
        this.capa$.subscribe();

        this.permisoIngreso = this.auth.check('internacion:ingreso');
        this.permisoCenso = this.auth.check('internacion:censo');
        this.permisoCrearCama = this.auth.check('internacion:cama:create');

        this.mapaCamasService.setView('mapa-camas');

        this.ambito = this.mapaCamasService.ambito;

        this.selectedCama$ = this.mapaCamasService.selectedCama;

        this.selectedPaciente$ = this.mapaCamasService.selectedPaciente;

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

    onEdit(accion) {
        this.accion = accion;
    }

    selectCama(cama, relacion) {
        this.mapaCamasService.select(cama);
        this.mapaCamasService.selectPaciente(cama.paciente);
        if (relacion) {
            this.estadoRelacion = relacion;
            this.accion = relacion.accion;
        }
    }

    accionDesocupar(accion) {
        if (!accion.egresar) {
            this.cambiarUO = accion.cambiarUO;
            this.accion = 'cambiarCama';
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
        this.accion = null;
        this.mapaCamasService.select(null);
    }

    volverADesocupar() {
        this.accion = 'desocuparCama';
    }

    verDetalle(cama: ISnapshot, selectedCama: ISnapshot) {
        if (!selectedCama.idCama || selectedCama.idCama !== cama.idCama) {
            this.mapaCamasService.select(cama);
            this.accion = 'verDetalle';
        } else {
            this.accion = null;
            this.mapaCamasService.select(null);
        }
    }

    gotoListaEspera() {
        this.router.navigate([`/internacion/${this.ambito}/${this.capa}/lista-espera`]);
    }
}
