import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { ListadoInternacionCapasService } from './listado-internacion-capas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

@Component({
    selector: 'app-listado-internacion-unificado',
    templateUrl: './listado-internacion-unificado.component.html',
})

export class ListadoInternacionUnificadoComponent implements OnInit {
    listaInternacion$: Observable<IResumenInternacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;

    idInternacionSelected: string = null;

    // VARIABLES
    public listaInternacion;
    public listaInternacionAux;
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;
    public accion;

    mainView$ = this.mapaCamasService.mainView;

    public columnsVisibles = { // para inicializar solo con ciertas columnas visibles
        'nombre': true,
        'documento': true,
        'fechaIngreso': true,
        'fechaEgreso': true,
        'informe': true
    };
    public columns = [
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.paciente.apellido} ${a.paciente.nombre}`;
                const nameB = `${b.paciente.apellido} ${b.paciente.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.paciente.documento.localeCompare(b.paciente.documento)
        },
        {
            key: 'diagnostico',
            label: 'Motivo Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = a.diagnostico?.term || '';
                const nameB = b.diagnostico?.term || '';
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaIngreso.getTime() - b.fechaIngreso.getTime()
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaEgreso?.getTime() - b.fechaEgreso?.getTime()
        },
        {
            key: 'obraSocial',
            label: 'Obra social',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                const p1 = a.paciente.obraSocial?.nombre || '';
                const p2 = b.paciente.obraSocial?.nombre || '';
                return p1.localeCompare(p2);
            }
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad organizativa',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                return a.idPrestacion?.unidadOrganizativa.term.localeCompare(b.idPrestacion?.unidadOrganizativa.term);
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                return a.idPrestacion?.estadoActual.tipo.localeCompare(b.idPrestacion?.estadoActual.tipo);
            }
        },
        {
            key: 'informe',
            label: 'Informe',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                const nameA = a.idPrestacion ? 'a' : '';
                const nameB = b.idPrestacion ? 'b' : '';
                return nameA.localeCompare(nameB);
            }
        }
    ];

    constructor(
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private permisosMapaCamasService: PermisosMapaCamasService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private location: Location,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            if (!organizacion.usaEstadisticaV2) {
                this.router.navigate(['inicio']);
            }
        });

        // verificamos permisos
        const capa = this.route.snapshot.paramMap.get('capa');
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?');
        if (permisosInternacion.length >= 1 && (permisosInternacion.indexOf(capa) !== -1 || permisosInternacion[0] === '*')) {
            this.mapaCamasService.setCapa(capa);
        } else {
            this.router.navigate(['/inicio']);
        }
        this.mapaCamasService.setView('listado-internacion');
        this.mapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setFecha(new Date());
        this.mapaCamasService.select({ id: ' ' } as any);
        this.permisosMapaCamasService.setAmbito('internacion');

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            route: '/mapa-camas/listado-internacion-unificado',
            name: 'Mapa Cama',
        }, {
            name: 'Listado de Internacion unificado'
        }]);

        if (this.mapaCamasService.capa !== 'estadistica-v2') {
            const index = this.columns.findIndex(col => col.key === 'estado');
            if (index >= 0) {
                this.columns.splice(index, 1);
            }
        }
        this.listaInternacion$ = this.listadoInternacionCapasService.listaInternacionFiltrada$;
    }

    seleccionarInternacion(resumen: IResumenInternacion) {
        if (!this.idInternacionSelected || resumen.id !== this.idInternacionSelected) {
            this.mapaCamasService.selectResumen(resumen);
            this.idInternacionSelected = resumen.id;
            const prestacion = resumen.idPrestacion as any; // prestacion populada
            this.mapaCamasService.selectPrestacion(prestacion);
        } else {
            this.idInternacionSelected = null;
        }
        this.accion = this.idInternacionSelected ? 'verDetalle' : null;
    }

    onAccion(value) {
        if (value) {
            this.accion = value.accion;
        } else {
            this.accion = this.idInternacionSelected ? 'verDetalle' : null;
        }
    }

    volver() {
        this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/${this.mapaCamasService.capa}`]);
    }

    cancelar() {
        this.mapaCamasService.selectResumen(null);
        this.mapaCamasService.selectPrestacion(null);
        this.idInternacionSelected = null;
    }

}