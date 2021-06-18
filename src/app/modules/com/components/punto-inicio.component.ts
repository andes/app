import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Unsubscribe } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ReglasDerivacionService } from 'src/app/services/com/reglasDerivaciones.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IDerivacion } from '../interfaces/IDerivacion.interface';
import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { PuntoInicioService } from './../services/punto-inicio.service';

@Component({
    selector: 'com-punto-inicio',
    templateUrl: './punto-inicio.html',
    styleUrls: ['./punto-inicio.scss']
})

export class ComPuntoInicioComponent implements OnInit {
    public derivaciones$: Observable<any[]>;
    public orgActual;
    public esCOM = false;
    public showSidebar = false;
    public showNuevaDerivacion = false;
    public showDetalle = false;
    public showEditarEstado = false;
    public verAyuda = false;
    public requestInProgress: boolean;
    public esTrasladoEspecial;
    private scrollEnd = false;
    private skip = 0;
    private limit = 30;
    public reglasDerivacion = [];
    public opcionesPrioridad = [
        { id: 'baja', label: 'Baja' },
        { id: 'media', label: 'Media' },
        { id: 'intermedia', label: 'Intermedia' },
        { id: 'alta', label: 'Alta' },
        { id: 'especial', label: 'Especial' }
    ];
    derivacionSeleccionada: IDerivacion;
    public derivaciones: any[] = [];
    organizacionActual: any[];
    organizacionOrigen: IOrganizacion;
    organizacionDestino: IOrganizacion;
    paciente: any;
    estado: any;
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
    public ordenarPorPrioridad = false;

    // Códigos de color de prioridades
    colores = [
        {
            border: '#b0cfa0',
            hover: '#80b266',
            background: '#e9f2e5',
            name: 'baja'
        },
        {
            border: '#d5c743',
            hover: '#C6B300',
            background: '#f8f5de',
            name: 'media'
        },
        {
            border: '#d1a67e',
            hover: '#e97204',
            background: '#f7e5ca',
            name: 'intermedia'
        },
        {
            border: '#e4a4a4',
            hover: '#B70B0B',
            background: '#f8e6e6',
            name: 'alta'
        },
        {
            border: '#7a6f93',
            hover: '#02111C',
            background: '#dddae3',
            name: 'especial'
        }
    ];

    constructor(
        private derivacionesService: DerivacionesService,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        public router: Router, public plex: Plex,
        private reglasDerivacionService: ReglasDerivacionService,
        private documentosService: DocumentosService,
        private puntoInicioService: PuntoInicioService) { }

    ngOnInit() {
        if (!(this.auth.getPermissions('com:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.reglasDerivacionService.search({}).subscribe(resultado => {
            this.reglasDerivacion = resultado;
        });
        this.organizacionActual = this.auth.organizacion as any;
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(org => {
            this.orgActual = org;
            if (org.esCOM) {
                this.esCOM = true;
            }
            this.esTrasladoEspecial = org.trasladosEspeciales && org.trasladosEspeciales.length;
            this.cargarDerivaciones();
        });
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.actualizarTabla();
        }
    }

    cargarDerivaciones() {
        if (!this.loading) {
            this.loading = true;
            this.skip = 0;
            this.scrollEnd = false;
            this.derivaciones = [];
            this.actualizarTabla();
        }
    }

    @Unsubscribe()
    actualizarTabla() {
        let query = this.getQuery();
        this.puntoInicioService.get(query).subscribe((data) => {
            this.derivaciones = this.derivaciones.concat(data);
            this.puntoInicioService.derivacionesFiltradas.next(this.derivaciones);
            this.skip = this.derivaciones.length;
            this.derivaciones$ = this.puntoInicioService.derivacionesOrdenadas$;
            if (!data.length || data.length < this.limit) {
                this.scrollEnd = true;
            }
            this.puntoInicioService.sortOrder.next(this.sortBy);
            this.puntoInicioService.sortOrder.next(this.sortOrder);
            this.loading = false;
        });
    }

    private getQuery() {
        let query: any = { cancelada: false, skip: this.skip, limit: this.limit };
        if (this.estado) {
            query.estado = this.estado.id;
        } else {
            query.estado = '~finalizada';
        }
        if (this.tabIndex === 0) {
            if (this.organizacionOrigen) {
                query.organizacionOrigen = this.organizacionOrigen.id;
            }
            if (this.esTrasladoEspecial) {
                query['tipoTraslado'] = true;
            } else {
                query.organizacionDestino = this.auth.organizacion.id;
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

        return query;
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
            this.tabIndex = index;
            this.ocultarSidebars();
            this.cargarDerivaciones();
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

    sortList(event: string) {
        if (event !== 'prioridad') {
            this.ordenarPorPrioridad = false;
        }
        if (this.sortBy === event) {
            this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc';
            this.puntoInicioService.sortOrder.next(this.sortOrder);
        } else {
            this.sortBy = event;
            this.sortOrder = 'asc';
            this.puntoInicioService.sortBy.next(event);
            this.puntoInicioService.sortOrder.next(this.sortOrder);
        }
    }

    ordenarPrioridad() {
        if (this.ordenarPorPrioridad) {
            this.sortList('prioridad');
        } else {
            this.sortList('fecha');
        }
    }

    imprimirComprobante(derivacion: any) {
        this.requestInProgress = true;
        this.documentosService.descargarComprobanteDerivacion(derivacion._id, derivacion.paciente.apellido).subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

    getColorPrioridad(prioridad) {
        if (prioridad && this.esCOM) {
            return this.colores.find(x => x.name === prioridad);
        } else {
            return false;
        }
    }
}


