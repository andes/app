import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs/Observable';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { take, pluck, tap, map, distinctUntilChanged } from 'rxjs/operators';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { timer, Subscription } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MapaCamaListadoColumns } from '../../interfaces/mapa-camas.internface';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit, OnDestroy {
    @ViewChild(CdkVirtualScrollViewport, { static: false })
    public viewPort: CdkVirtualScrollViewport;

    capa$: Observable<string>;
    selectedCama$: Observable<ISnapshot>;
    organizacion: string;
    fecha = moment().toDate();
    ambito: string;
    capa: string;
    camas: Observable<any[]>;
    snapshot: ISnapshot[];
    itemsDropdown = [
        { label: 'CENSO DIARIO', route: `/internacion/censo/diario` },
        { label: 'CENSO MENSUAL', route: `/internacion/censo/mensual` },
    ];
    estadoRelacion: any;
    estadosCama: any;
    maquinaEstados: IMaquinaEstados;
    opcionesCamas = [];
    accion = null;
    cambiarUO;
    camasDisponibles;

    mainView;
    subscription: Subscription;

    public columns: MapaCamaListadoColumns = {
        fechaMovimiento: false,
        documento: false,
        sexo: false,
        sector: false,
        usuarioMovimiento: false,
    };

    public sortBy: string;
    public sortOrder = 'desc';

    public permisoIngreso = false;
    public permisoBloqueo = false;
    public permisoCenso = false;
    public permisoCrearCama = this.auth.check('internacion:cama:create');
    public permisoCrearSala = this.auth.check('internacion:sala:create');

    itemsCrearDropdown = [];

    public get inverseOfTranslation(): string {
        if (!this.viewPort || !this.viewPort['_renderedContentOffset']) {
            return '-0px';
        }
        let offset = this.viewPort['_renderedContentOffset'];
        return `-${offset}px`;
    }

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        public mapaCamasService: MapaCamasService,
    ) { }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.mapaCamasService.resetView();
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Mapa de Camas'
        }]);

        // CROTADA: si uso ngIf en el layout se rompen los tooltips
        // tengo que averiguar
        this.subscription = this.mapaCamasService.mainView.subscribe((v) => {
            this.mainView = v;
        });
        ////////////////////////////////////////////////////////////////////

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
        this.permisoBloqueo = this.auth.check('internacion:bloqueo');
        this.permisoCenso = this.auth.check('internacion:censo');

        if (this.permisoCrearCama) {
            this.itemsCrearDropdown.push(
                { label: 'CAMA', route: `/internacion/cama` }
            );
        }

        if (this.permisoCrearSala) {
            this.itemsCrearDropdown.push(
                { label: 'SALA COMUN', route: `/internacion/sala-comun` }
            );
        }

        this.mapaCamasService.setView('mapa-camas');

        this.ambito = this.mapaCamasService.ambito;

        this.selectedCama$ = this.mapaCamasService.selectedCama.map((cama) => {
            if (cama.id && !this.accion) {
                this.accion = 'verDetalle';
            }
            return cama;
        });


        this.mapaCamasService.setFecha(new Date());
        this.mapaCamasService.setOrganizacion(this.auth.organizacion.id);

        this.organizacion = this.auth.organizacion.id;

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
        debugger;
        this.mapaCamasService.resetView();
        this.mapaCamasService.select(cama);
        if (relacion) {
            this.router.navigate([relacion.accion], { relativeTo: this.route });
            // this.estadoRelacion = relacion;
            // this.accion = relacion.accion;
        } else {
            this.router.navigate(['verDetalle'], { relativeTo: this.route });
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
            this.router.navigate(['verDetalle'], { relativeTo: this.route });
        } else {
            this.mapaCamasService.select(null);
            this.router.navigate(['..'], { relativeTo: this.route });

        }
    }

    gotoFiltros() {
        this.router.navigate(['filtros'], { relativeTo: this.route });
    }

    gotoListaEspera() {
        this.router.navigate([`/internacion/${this.ambito}/${this.capa}/lista-espera`]);
    }

    trackByFn(item: ISnapshot) {
        return item.idCama;
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
}
