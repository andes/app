import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamaListadoColumns } from '../../interfaces/mapa-camas.internface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { LaboratorioService } from 'projects/portal/src/app/services/laboratorio.service';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit, OnDestroy {
    @ViewChild(CdkVirtualScrollViewport, { static: false })
    public viewPort: CdkVirtualScrollViewport;

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
    fecha$: Observable<Date>;
    organizacionv2; // true si la organizacion usa capas unificadas
    estado$: Observable<IMaquinaEstados>;

    mainView$ = this.mapaCamasService.mainView.pipe(
        map(view => {
            if (view.idProtocolo) {
                this.buscarArea(view);
                return {
                    data: view,
                    tipo: 'laboratorio'
                };
            }
            return view;
        })
    );
    public areasLaboratorio = [];
    registro;

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
    public fechaSelector;
    public fechaInput;
    public isValidDate = true;

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
        public ws: WebSocketService,
        public organizacionService: OrganizacionService,
        private laboratorioService: LaboratorioService,
        private servicioDocumentos: DocumentosService

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
        this.mainView$.subscribe(mainView => {
            this.registro = {
                data: mainView,
                tipo: 'laboratorio'
            };
        });


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

        this.columns = this.mapaCamasService.columnsMapa.getValue();
        this.organizacionService.usaCapasUnificadas(this.auth.organizacion.id).pipe(
            take(1),
            tap(resp => this.organizacionv2 = resp)
        ).subscribe();

        this.estado$ = this.mapaCamasService.maquinaDeEstado$.pipe(
            map(estado => estado)
        );

        this.getSnapshot();

        this.fecha$ = this.mapaCamasService.fecha2;

        this.fechaSelector = moment();
        this.fechaInput = moment().format('DD/MM/YYYY HH:mm');
    }
    buscarArea(viewProtocolo) {
        this.laboratorioService.getProtocoloById(viewProtocolo.idProtocolo).subscribe((resultados) => {

            if (resultados && Array.isArray(resultados) && resultados.length > 0) {
                this.areasLaboratorio = resultados;
            } else {
                this.areasLaboratorio = [];
            }
        });
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
        if (this.organizacionv2) { // Si el efector usa capas unificadas
            this.router.navigate([`/mapa-camas/listado-internacion-unificado/${this.route.snapshot.paramMap.get('capa')}`]);
        } else {
            this.router.navigate([`/mapa-camas/listado-internacion/${this.route.snapshot.paramMap.get('capa')}`]);
        }
    }

    verListadoInternacionMedico() {
        this.router.navigate(['/mapa-camas/listado-internacion-medico']);
    }
    verListadoMedicamentos() {
        this.router.navigate(['/mapa-camas/listado-medicamentos']);
    }


    onEdit(accion) {
        this.accion = accion;
    }

    selectCama(cama, relacion) {
        this.cambiarUO = null;
        this.mapaCamasService.resetView();
        this.mapaCamasService.select(cama);
        if (relacion) {
            this.estadoRelacion = relacion;
            this.accion = relacion.accion;
            if (relacion.accion === 'cambiarUO') {
                this.cambiarUO = true;
            }
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
        const cama = this.mapaCamasService.selectedCama.getValue();
        this.accion = cama.id ? 'verDetalle' : null;
        this.cambiarUO = null;
    }

    volverADesocupar() {
        this.accion = 'desocuparCama';
    }

    verDetalle(cama: ISnapshot, selectedCama: ISnapshot) {
        if (!selectedCama?.id || cama !== selectedCama) {
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
        if (data.selectedCama) {
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

    setFecha(fecha?: Date, $event?: any) {
        $event?.preventDefault();

        const format = 'DD/MM/YYYY HH:mm';
        const nuevaFecha = moment(fecha || new Date(), format);

        if (nuevaFecha.isValid()) {
            this.fechaSelector = nuevaFecha;
            this.fechaInput = nuevaFecha.format(format);
            this.mapaCamasService.setFecha(nuevaFecha.toDate());
        }
    }

    checkFecha(fecha?: Date) {
        const nuevaFecha = moment(fecha || new Date(), 'DD/MM/YYYY HH:mm');

        this.isValidDate = nuevaFecha.isValid();
    }

    closeDatetimeSelector() {
        if (!this.fechaInput || !this.isValidDate) {
            this.fechaInput = this.fechaSelector.format('DD/MM/YYYY HH:mm');
            this.isValidDate = true;
        }
    }

    descargarLab() {
        this.servicioDocumentos.descargarLaboratorio({
            protocolo: this.registro,
            usuario: this.auth.usuario.nombreCompleto
        }, 'Laboratorio').subscribe();
    }
}
