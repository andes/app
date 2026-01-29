import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-mapa-camas-resumen',
    templateUrl: 'mapa-camas-resumen.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasResumenComponent implements OnInit {

    @ViewChild(CdkVirtualScrollViewport, { static: false })
    public viewPort: CdkVirtualScrollViewport;

    @ViewChild('helpFecha', { read: ElementRef }) helpFechaRef: ElementRef;

    selectedCama$: Observable<ISnapshot>;
    organizacion: string;
    fecha = moment().toDate();
    camas$: Observable<any[]>;
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
    fecha$: Observable<Date>;
    organizacionv2; // true si la organizacion usa capas unificadas
    estado$: Observable<IMaquinaEstados>;
    capaActual: string;
    fechaBusqueda: Date;

    public sortBy: string;
    public sortOrder = 'desc';
    public fechaSelector;
    public fechaInput;
    public isValidDate = true;
    public dataOrganizacion;

    public columns = {
        fechaMovimiento: false,
        fechaIngreso: false,
        documento: false,
        sexo: false,
        sector: false,
        usuarioMovimiento: false,
        diasEstada: false
    };

    public equipos = {
        aporteOxigeno: false,
        respirador: false,
        monitorParamedico: false,
        usaRespirador: false
    };

    public estadoCama = {
        ocupada: { label: 'OCUPADA', type: 'warning' },
        bloqueada: { label: 'BLOQUEADA', type: 'default' },
        disponible: { label: 'DISPONIBLE', type: 'success' }
    };

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        public elementoRUPService: ElementosRUPService,
        public ws: WebSocketService,
        public organizacionService: OrganizacionService

    ) { }

    ngOnInit() {
        this.mapaCamasService.resetView();
        const ambito = this.route.snapshot.paramMap.get('ambito');
        const idOrganizacion = this.route.snapshot.paramMap.get('idOrganizacion') ? this.route.snapshot.paramMap.get('idOrganizacion') : this.auth.organizacion.id;
        const capa = this.route.snapshot.paramMap.get('capa');
        this.mapaCamasService.setAmbito(ambito);
        this.mapaCamasService.setOrganizacion(idOrganizacion);
        this.permisosMapaCamasService.setAmbito(ambito);
        this.mapaCamasService.setCapa(capa);
        this.capaActual = capa;
        this.fechaBusqueda = new Date();


        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Mapa de Camas'
        }, {
            name: ambito
        }]);

        this.mapaCamasService.setView('mapa-camas');
        this.mapaCamasService.setFecha(new Date());
        this.mapaCamasService.select(null);

        this.columns = this.mapaCamasService.columnsMapa.getValue();
        this.estado$ = this.mapaCamasService.maquinaDeEstado$.pipe(
            map(estado => estado)
        );

        this.organizacionService.getById(idOrganizacion).subscribe(organizacion => {
            this.dataOrganizacion = organizacion;
        });

        this.getSnapshot();

    }

    getSnapshot(fecha = null) {
        if (!fecha) {
            fecha = this.fecha;
        }
        this.camas$ = this.mapaCamasService.snapshotOrdenado$.pipe(
            map(snapshots => {
                return snapshots.filter(snap => snap.estado !== 'inactiva' && snap.esCensable);
            })
        );
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

    volver() {
        this.router.navigate([
            'com',
            'estados-cama-provincial'
        ]);
    }

}
