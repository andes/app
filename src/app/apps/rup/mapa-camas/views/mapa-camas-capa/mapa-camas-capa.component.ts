import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MapaCamaListadoColumns } from '../../interfaces/mapa-camas.internface';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit, OnDestroy {
    @ViewChild(CdkVirtualScrollViewport, { static: false })
    public viewPort: CdkVirtualScrollViewport;

    ambito$: Observable<string>;
    capa$: Observable<string>;
    selectedCama$: Observable<ISnapshot>;
    organizacion: string;
    fecha = moment().toDate();
    camas: Observable<any[]>;
    snapshot: ISnapshot[];
    itemsCensoDropdown = [];
    estadoRelacion: any;
    estadosCama: any;
    maquinaEstados: IMaquinaEstados;
    opcionesCamas = [];
    accion = null;
    cambiarUO;
    listadoRecursos = false;
    camasDisponibles;

    puedeVerHistorial$: Observable<boolean>;

    mainView$ = this.mapaCamasService.mainView;

    public columns: MapaCamaListadoColumns = {
        fechaMovimiento: false,
        fechaIngreso: false,
        documento: false,
        sexo: false,
        sector: false,
        usuarioMovimiento: false,
        prioridad: false,
        guardia: false,
        diasEstada: false
    };

    public sortBy: string;
    public sortOrder = 'desc';

    itemsCrearDropdown = [];

    public get inverseOfTranslation(): string {
        if (!this.viewPort || !this.viewPort['_renderedContentOffset']) {
            return '-0px';
        }
        const offset = this.viewPort['_renderedContentOffset'];
        return `-${offset}px`;
    }

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        public elementoRUPService: ElementosRUPService,
        public ws: WebSocketService

    ) { }


    ngOnDestroy() {
        this.ws.disconnect();
    }

    ngOnInit() {
        this.ws.connect();
        this.mapaCamasService.resetView();
        const ambito = this.route.snapshot.paramMap.get('ambito');
        this.mapaCamasService.setAmbito(ambito);
        this.permisosMapaCamasService.setAmbito(ambito);
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Mapa de Camas'
        }, {
            name: ambito
        }]);

        this.itemsCensoDropdown.push(
            { label: 'CENSO DIARIO', route: `/mapa-camas/${ambito}/censo/diario` },
            { label: 'CENSO MENSUAL', route: `/mapa-camas/${ambito}/censo/mensual` },
        );

        if (this.permisosMapaCamasService.camaCreate) {
            this.itemsCrearDropdown.push(
                { label: 'CAMA', route: `/mapa-camas/${ambito}/cama` }
            );
        }

        if (this.permisosMapaCamasService.salaCreate) {
            this.itemsCrearDropdown.push(
                { label: 'SALA COMUN', route: `/mapa-camas/${ambito}/sala-comun` }
            );
        }

        const capa = this.route.snapshot.paramMap.get('capa');
        const permisosInternacion = this.auth.getPermissions(`${ambito}:rol:?`);
        if (permisosInternacion.length >= 1 && (permisosInternacion.indexOf(capa) !== -1 || permisosInternacion[0] === '*')) {
            this.mapaCamasService.setCapa(capa);
        } else {
            this.router.navigate(['/inicio']);
        }

        this.mapaCamasService.setView('mapa-camas');

        this.selectedCama$ = this.mapaCamasService.selectedCama.pipe(
            map((cama) => {
                if (cama.id && !this.accion) {
                    this.accion = 'verDetalle';
                }
                return cama;
            })
        );


        this.mapaCamasService.setFecha(new Date());
        this.mapaCamasService.setOrganizacion(this.auth.organizacion.id);
        this.mapaCamasService.select(null);

        this.organizacion = this.auth.organizacion.id;

        this.mapaCamasService.maquinaDeEstado$.pipe(take(1)).subscribe((estado) => {
            const columns = estado.columns;
            if (columns) {
                this.columns = columns;
                this.toggleColumns();
            }
        });

        this.puedeVerHistorial$ = this.mapaCamasService.maquinaDeEstado$.pipe(
            map(estado => estado.historialMedico)
        );

        this.getSnapshot();
    }

    getSnapshot(fecha = null) {
        if (!fecha) {
            fecha = this.fecha;
        }

        this.camas = this.mapaCamasService.snapshotOrdenado$.pipe(
            map(snapshots => {
                return snapshots.filter(snap => snap.estado !== 'inactiva');
            })
        );
    }
    verListadoRecursos() {
        this.listadoRecursos = this.listadoRecursos ? false : true;
    }
    verListadoInternacion() {
        this.router.navigate(['/mapa-camas/listado-internacion']);
    }

    verListadoInternacionMedico() {
        this.router.navigate(['/mapa-camas/listado-internacion-medico']);
    }

    onEdit(accion) {
        this.accion = accion;
    }

    selectCama(cama, relacion) {
        this.mapaCamasService.resetView();
        this.mapaCamasService.select(cama);
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
        const i = this.snapshot.findIndex((snap: ISnapshot) => snap.idCama === accion.cama._id);
        this.snapshot[i] = accion.cama;
        this.camas = of(this.snapshot);
        this.volverAResumen();
    }

    volverAResumen() {
        this.accion = null;
        this.mapaCamasService.select(null);
    }

    volverADetalle() {
        this.accion = 'verDetalle';
    }

    volverADesocupar() {
        this.accion = 'desocuparCama';
    }

    verDetalle(cama: ISnapshot, selectedCama: ISnapshot) {
        if (!selectedCama.id || cama !== selectedCama) {
            this.mapaCamasService.select(cama);
            this.accion = 'verDetalle';
        } else {
            this.accion = null;
            this.mapaCamasService.select(null);
        }
    }

    gotoListaEspera() {
        this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/${this.mapaCamasService.capa}/lista-espera`]);
    }

    trackByFn(item: ISnapshot) {
        return item.idCama;
    }

    accionListadoRecurso(data) {
        if (data.verDetalle) {
            this.verDetalle(data.cama, data.selectedCama);
        }
        if (data.selectCama) {
            this.selectCama(data.cama, data.relacion);
        }

    }

    sortTable(event: string) {
        if (this.sortBy === event) {
            this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc';
            this.mapaCamasService.sortOrder.next(this.sortOrder);
        } else {
            this.sortBy = event;
            this.mapaCamasService.sortBy.next(event);
            this.mapaCamasService.sortOrder.next('desc');
        }
    }

    toggleColumns() {
        this.mapaCamasService.columnsMapa.next(this.columns);
    }

    onVisualizar() {
        this.router.navigate(['visualizacion'], { relativeTo: this.route });
    }
}
