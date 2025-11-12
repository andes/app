import moment from 'moment';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { Auth } from '@andes/auth';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-listado-medicamentos-capas',
    templateUrl: './listado-medicamentos-capas.component.html',
})

export class ListadoMedicamentosCapasComponent implements OnInit, OnDestroy {

    public listadoActual: any[];
    public listaMedicamentos$: Observable<any[]>;
    unidadesOrganizativas$: Observable<any[]>;
    idInternacionSelected: string = null;
    public organizacion$: Observable<any>;
    public organizacion;
    public paciente = null;
    public sectorList$: Observable<any[]>;
    public sector: any = {};
    public unidadOrg: any = {};
    public filtrosVacios = true;
    public medicamentosHoy = false;
    public columns = [
        {
            key: 'paciente',
            label: 'Paciente',
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
            label: 'DOCUMENTO',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const aDocumento = a.paciente.documento || a.paciente.numeroIdentificacion;
                const bDocumento = b.paciente.documento || b.paciente.numeroIdentificacion;
                return aDocumento.localeCompare(bDocumento);
            }
        },
        {
            key: 'medicamento',
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
            key: 'unidadOrganizativa',
            label: 'Unidad Organizativa',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.organizacion.nombre}`;
                const nameB = `${b.organizacion.nombre}`;
                return nameA.localeCompare(nameB);
            }
        }
    ];
    constructor(
        public auth: Auth,
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private location: Location,
        private planIndicacionesServices: PlanIndicacionesServices,
        private documentosService: DocumentosService,
        private organizacionService: OrganizacionService,
        private router: Router,
        private route: ActivatedRoute,

    ) { }


    ngOnInit() {
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?');
        if (permisosInternacion.length >= 1 && (permisosInternacion.indexOf('farmaceutica') !== -1 || permisosInternacion[0] === '*')) {
            this.mapaCamasService.setCapa('farmaceutica');
        } else {
            this.router.navigate(['/inicio']);
        }
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
        this.listaMedicamentos$ = this.planIndicacionesServices.medicamentosFiltrados$.pipe(
            map(resp => {
                this.listadoActual = resp;
                return this.listadoActual;
            })
        );
        this.filtrar();
        this.listaMedicamentos$.pipe(first()).subscribe(lista => { this.medicamentosHoy = lista.length !== 0; });

        this.getOrganizacion();
        this.unidadesOrganizativas$ = this.organizacionService.unidadesOrganizativas(this.auth.organizacion.id);
        this.planIndicacionesServices.organizacion.next(this.auth.organizacion.id);
    }

    getOrganizacion() {
        this.organizacion$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
            cache()
        );
        this.sectorList$ = this.organizacion$.pipe(
            map(organizacion => {
                return this.organizacionService.getSectoresNombreCompleto(organizacion);
            })
        );

    }
    onScroll() {
        this.planIndicacionesServices.lastResults.next(this.listadoActual);
    }

    filtrar() {
        this.filtrosVacios = this.unidadOrg?.length === 0 && this.sector?.length === 0 && (this.paciente === '' || this.paciente === null);
        this.planIndicacionesServices.lastResults.next(null);
        this.getOrganizacion();
        this.planIndicacionesServices.unidadO.next(this.unidadOrg?.id);
        this.planIndicacionesServices.sector.next(this.sector?.id);
        this.planIndicacionesServices.paciente.next(this.paciente);
        this.planIndicacionesServices.organizacion.next(this.organizacion);
    }

    ngOnDestroy() {
        this.mapaCamasService.selectResumen(null);
    }

    descargarListado() {
        const params = {
            fechaDesde: moment().startOf('days'),
            fechaHasta: moment().endOf('days'),
            organizacionOrigen: this.auth.organizacion.id,
            paciente: this.paciente,
            unidadOrganizativa: this.unidadOrg?.fsn,
            sector: this.sector?.nombre
        };
        this.documentosService.descargarListadoMedicamentos(params, `listado-medicamentos ${moment().format('DD-MM-hh-mm-ss')}`).subscribe();

    }

    volver() {
        this.location.back();
    }

    cancelar() {
        this.mapaCamasService.selectResumen(null);
        this.mapaCamasService.selectPrestacion(null);
        this.idInternacionSelected = null;
    }
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
