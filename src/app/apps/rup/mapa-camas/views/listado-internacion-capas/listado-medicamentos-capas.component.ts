import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { Auth } from '@andes/auth';
import { MapaCamaListadoColumns } from '../../interfaces/mapa-camas.internface';
import { OrganizacionService } from 'src/app/services/organizacion.service';

@Component({
    selector: 'app-listado-medicamentos-capas',
    templateUrl: './listado-medicamentos-capas.component.html',
})

export class ListadoMedicamentosCapasComponent implements OnInit, OnDestroy {
    public fechaDesdeEntrada;
    public fechaHastaEntrada;
    listaInternacion$ = [];
    private listadoActual: any[];
    listaMedicamentos$: Observable<any[]>;
    selectedPrestacion$: Observable<IPrestacion>;
    idInternacionSelected: string = null;
    public fechaControl = new Date();
    public organizacion$: Observable<any>;

    public organizacion;
    public paciente;
    mainView$ = this.mapaCamasService.mainView;
    public sectorList$: Observable<any[]>;
    public sector: any = {};
    public columns2: MapaCamaListadoColumns = {
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
    public columns = [
        {
            key: 'sector',
            label: 'Sector',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.paciente.apellido} ${a.paciente.alias || a.paciente.nombre}`;
                const nameB = `${b.paciente.apellido} ${b.paciente.alias || b.paciente.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'organizacion',
            label: 'Unidad Organizativa',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.organizacion.nombre}`;
                const nameB = `${b.organizacion.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'nombre',
            label: 'Nombre Paciente',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.paciente.apellido} ${a.paciente.alias || a.paciente.nombre}`;
                const nameB = `${b.paciente.apellido} ${b.paciente.alias || b.paciente.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'documento',
            label: 'DNI Paciente',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const aDocumento = a.paciente.documento || a.paciente.numeroIdentificacion;
                const bDocumento = b.paciente.documento || b.paciente.numeroIdentificacion;
                return aDocumento.localeCompare(bDocumento);
            }
        },
        {
            key: 'diagnostico',
            label: 'Medicamento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = a.valor.medicamento?.term || a.valor.nombre || '';
                const nameB = b.valor.medicamento?.term || a.valor.nombre || '';
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: true
        },
        {
            key: 'fecha',
            label: 'Fecha Inicio',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaInicio.getTime() - b.fechaInicio.getTime()
        },
        {
            key: 'fechaEstado',
            label: 'Fecha Ultimo Estado',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.estadoActual.fecha.getTime() - b.estadoActual.fecha.getTime()
        },

    ];

    constructor(
        public auth: Auth,
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private location: Location,
        private planIndicacionesServices: PlanIndicacionesServices,
        private documentosService: DocumentosService,
        private organizacionService: OrganizacionService,
    ) { }


    ngOnInit() {
        this.sectorList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map(cama => this.arraySectores(cama))
        );
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            route: '/mapa-camas/internacion',
            name: 'Mapa Cama',
        }, {
            name: 'Listado de Medicamentos'
        }]);
        this.filtrar();
        this.listaMedicamentos$ = this.planIndicacionesServices.medicamentosFiltrados$.pipe(
            map(resp => this.listadoActual = resp)
        );
        this.planIndicacionesServices.fechaDesde.next(moment().startOf('day').toDate());
        this.getOrganizacion();
    }

    getOrganizacion() {
        if (this.organizacion) {
            this.organizacion$ = this.organizacionService.getById(this.organizacion.id).pipe(
                cache()
            );
            this.sectorList$ = this.organizacion$.pipe(
                map(organizacion => {
                    return this.organizacionService.getSectoresNombreCompleto(organizacion);
                })
            );
        } else {
            this.sectorList$ = null;
        }
    }
    onScroll() {
        this.planIndicacionesServices.lastResults.next(this.listadoActual);
    }

    filtrar() {
        this.getOrganizacion();
        this.planIndicacionesServices.sector.next(this.sector?.id);
        this.planIndicacionesServices.lastResults.next(null);
        this.planIndicacionesServices.paciente.next(this.paciente);
        this.planIndicacionesServices.organizacion.next(this.organizacion);
    }

    ngOnDestroy() {
        this.mapaCamasService.selectResumen(null);
    }

    onSelect(resumen: IResumenInternacion) {
        if (resumen?.id !== this.idInternacionSelected) {
            this.mapaCamasService.isLoading(true);
            this.mapaCamasService.selectResumen(resumen);
            this.mapaCamasService.setFecha(resumen.fechaIngreso);
            this.idInternacionSelected = resumen.id;
            this.mapaCamasService.camaSelectedSegunView$.pipe(
                take(1),
                map(cama => this.mapaCamasService.select(cama))
            ).subscribe();
        } else {
            this.idInternacionSelected = null;
        }
    }
    descargarListado() {
        const params = {
            fechaDesde: moment(this.fechaDesdeEntrada).startOf('days'),
            fechaHasta: moment(this.fechaHastaEntrada).endOf('days'),
            organizacionOrigen: this.organizacion?.id,
        };
        this.documentosService.descargarListadoMedicamentos(params, `perinatal ${moment().format('DD-MM-hh-mm-ss')}`).subscribe();

    }

    volver() {
        this.location.back();
    }

    cancelar() {
        this.mapaCamasService.selectResumen(null);
        this.mapaCamasService.selectPrestacion(null);
        this.idInternacionSelected = null;
    }
    // Función que nos devuelve un array de jerarquía de sectores que no estan repetidos
    arraySectores(camas) {
        const listado = [];
        camas.forEach(elem => {
            for (let i = 0; i < elem.jerarquiaSectores.length; i++) {
                const sect = { _id: elem.sectores[i]._id, nombre: elem.jerarquiaSectores[i] };
                const index = listado.findIndex(ind => ind._id === elem.sectores[i]._id);
                if (index < 0) {
                    listado.push(sect);
                }
            }
        });
        return listado;
    }
}
