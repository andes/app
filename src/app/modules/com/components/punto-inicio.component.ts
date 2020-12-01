import { PuntoInicioService } from './../services/punto-inicio.service';
import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { Auth } from '@andes/auth';
import { IDerivacion } from '../interfaces/IDerivacion.interface';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { DocumentosService } from 'src/app/services/documentos.service';
import { Unsubscribe } from '@andes/shared';
import { ReglasDerivacionService } from 'src/app/services/com/reglasDerivaciones.service';
import { Observable, combineLatest } from 'rxjs';

@Component({
    selector: 'com-punto-inicio',
    templateUrl: './punto-inicio.html',
    styleUrls: ['./punto-inicio.scss'],
    providers: [
        PuntoInicioService
    ]
})
export class ComPuntoInicioComponent implements OnInit {
    public derivaciones$: Observable<any[]>;
    public orgActual$: Observable<any>;
    public esCOM = false;
    public showSidebar = false;
    public showNuevaDerivacion = false;
    public showDetalle = false;
    public showEditarEstado = false;
    public verAyuda = false;
    public requestInProgress: boolean;
    private scrollEnd = false;
    private skip = 0;
    private limit = 15;
    public reglasDerivacion = [];
    public opcionesPrioridad = [
        { id: 'baja', label: 'verde' },
        { id: 'media', label: 'amarillo' },
        { id: 'alta', label: 'rojo' },
        { id: 'especial', label: 'negro' }
    ];
    derivacionSeleccionada: IDerivacion;
    public derivaciones: any[] = [];
    organizacionActual: any[];
    organizacionOrigen: IOrganizacion;
    organizacionDestino: IOrganizacion;
    paciente: any;
    estado: any;
    prioridad: any;
    tabIndex = 0;
    public loading = false;
    public estados = [
        { id: 'solicitada', nombre: 'SOLICITADA' },
        { id: 'habilitada', nombre: 'HABILITADA' },
        { id: 'inhabilitada', nombre: 'INHABILITADA' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'RECHAZADA' },
        { id: 'aceptada', nombre: 'ACEPTADA' },
        { id: 'finalizada', nombre: 'FINALIZADA' },
        { id: 'encomendada', nombre: 'ENCOMENDADA' }
    ];
    public sortBy = 'fecha';
    public sortOrder = 'asc';


    sortData$: Observable<any>;

    constructor(
        private derivacionesService: DerivacionesService,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        public router: Router,
        public plex: Plex,
        private reglasDerivacionService: ReglasDerivacionService,
        private documentosService: DocumentosService,
        private puntoInicioService: PuntoInicioService
    ) { }

    ngOnInit() {
        if (!(this.auth.getPermissions('com:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.reglasDerivacionService.search({}).subscribe(resultado => {
            this.reglasDerivacion = resultado;
        });
        this.organizacionActual = this.auth.organizacion as any;
        this.orgActual$ = this.organizacionService.getById(this.auth.organizacion.id);

        this.derivaciones$ = this.puntoInicioService.getListado();
        this.sortData$ = this.puntoInicioService.getSortCriteria();

    }

    onScroll() {
        this.puntoInicioService.nextPage();
        // if (!this.scrollEnd) {
        //     this.actualizarTabla();
        // }
    }

    cargarDerivaciones() {
        const filtros = {
            paciente: this.paciente,
            estado: this.estado,
            organizacionOrigen: this.organizacionOrigen,
            organizacionDestino: this.organizacionDestino

        };

        this.puntoInicioService.setFiltros(filtros);


        // if (!this.loading) {
        //     this.loading = true;
        //     this.skip = 0;
        //     this.scrollEnd = false;
        //     this.derivaciones = [];
        //     this.actualizarTabla();
        // }
    }

    @Unsubscribe()
    actualizarTabla() {
        let query: any = { cancelada: false, skip: this.skip, limit: this.limit };
        if (this.estado) {
            query.estado = this.estado.id;
        } else {
            query.estado = '~finalizada';
        }
        if (this.prioridad) {
            query.prioridad = this.prioridad.id;
        }
        if (this.tabIndex === 0) {
            query.organizacionDestino = this.auth.organizacion.id;
            if (this.organizacionOrigen) {
                query.organizacionOrigen = this.organizacionOrigen.id;
            }
        } else {
            if (!this.esCOM) {
                query.organizacionOrigen = this.auth.organizacion.id;
            } else {
                query.organizacionDestino = `~${this.auth.organizacion.id}`;
            }
            if (this.organizacionDestino) {
                query.organizacionDestino = this.organizacionDestino.id;
            }
        }
        if (this.paciente) {
            query.paciente = `^${this.paciente}`;
        }
        // this.puntoInicioService.get(query).subscribe((data) => {
        //     this.derivaciones = this.derivaciones.concat(data);
        //     this.puntoInicioService.derivacionesFiltradas.next(this.derivaciones);
        //     this.skip = this.derivaciones.length;
        //     this.derivaciones$ = this.puntoInicioService.derivacionesOrdenadas$;
        //     if (!data.length || data.length < this.limit) {
        //         this.scrollEnd = true;
        //     }
        //     this.loading = false;
        // });
    }

    ocultarSidebars() {
        this.showSidebar = false;
        this.showDetalle = false;
        this.showNuevaDerivacion = false;
        this.showEditarEstado = false;
    }

    // acciones relacionadas a una nueva derivación
    nuevaDerivacion() {
        this.ocultarSidebars();
        this.showNuevaDerivacion = true;
        this.showSidebar = true;
    }

    returnBusqueda(event) {
        if (event.status) {
            this.router.navigate([`/com/${event.paciente}`]);
        } else {
            this.ocultarSidebars();
        }
    }

    // acciones relacionadas al detalle
    seleccionar(derivacion) {
        this.ocultarSidebars();
        this.derivacionSeleccionada = derivacion;
        this.showDetalle = true;
        this.showSidebar = true;
    }

    actualizarEstado(derivacion) {
        this.ocultarSidebars();
        this.derivacionSeleccionada = derivacion;
        this.showEditarEstado = true;
        this.showSidebar = true;
    }

    returnDetalle(actualizada) {
        this.ocultarSidebars();
        if (actualizada) {
            this.cargarDerivaciones();
        }
    }

    returnActualizar() {
        this.ocultarSidebars();
    }

    cambiarTab(index) {
        if (index !== this.tabIndex) {
            this.estado = null;
            this.organizacionOrigen = null;
            this.organizacionDestino = null;
            this.paciente = null;
            this.prioridad = null;

            this.tabIndex = index;

            const filtros = {
                skip: 0,
                tipo: index === 0 ? 'entrantes' : 'solicitadas'
            };

            this.puntoInicioService.setFiltros(filtros);


            this.ocultarSidebars();
            // this.cargarDerivaciones();
        }
    }

    cancelar(derivacion) {
        this.plex.confirm('¿Está seguro de querer cancelar la derivación?').then((resultado) => {
            if (resultado) {
                derivacion.cancelada = true;
                this.derivacionesService.update(derivacion._id, derivacion).subscribe(() => {
                    this.plex.toast('success', 'Derivación cancelada');
                    this.cargarDerivaciones();
                });
            }
            this.ocultarSidebars();
        });
    }

    cambiarVerAyuda(mostrar) {
        this.verAyuda = mostrar;
    }

    sortList(sortBy: string) {
        this.puntoInicioService.setOrder(sortBy);
        // if (this.sortBy === event) {
        //     this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc';
        //     this.puntoInicioService.sortOrder.next(this.sortOrder);
        // } else {
        //     this.sortBy = event;
        //     this.sortOrder = 'asc';
        //     this.puntoInicioService.sortBy.next(event);
        //     this.puntoInicioService.sortOrder.next(this.sortOrder);
        // }
    }

    imprimirComprobante(derivacion: any) {
        this.requestInProgress = true;
        this.documentosService.descargarComprobanteDerivacion(derivacion, derivacion.paciente.apellido).subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }
}


