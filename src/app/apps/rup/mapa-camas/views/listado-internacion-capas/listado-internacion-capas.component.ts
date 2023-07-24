import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { ListadoInternacionCapasService } from './listado-internacion-capas.service';

@Component({
    selector: 'app-listado-internacion-capas',
    templateUrl: './listado-internacion-capas.component.html',
})

export class ListadoInternacionCapasComponent implements OnInit, OnDestroy {
    listaInternacion$: Observable<IResumenInternacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;

    idInternacionSelected: string = null;

    mainView$ = this.mapaCamasService.mainView;
    public columns = [
        {
            key: 'nombre',
            label: 'Nombre',
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
            label: 'Documento',
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
            sort: (a: any, b: any) => a.fechaEgreso.getTime() - b.fechaEgreso.getTime()
        }
    ];

    constructor(
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private location: Location,
        private permisosMapaCamasService: PermisosMapaCamasService
    ) { }

    ngOnInit() {
        this.mapaCamasService.setView('listado-internacion');
        this.mapaCamasService.setCapa('medica');
        this.mapaCamasService.setAmbito('internacion');
        this.permisosMapaCamasService.setAmbito('internacion');
        this.mapaCamasService.select({ id: ' ' } as any); // Pequeño HACK

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            route: '/mapa-camas/internacion',
            name: 'Mapa Cama',
        }, {
            name: 'Listado de Internacion Medica'
        }]);

        this.listaInternacion$ = this.listadoInternacionCapasService.listaInternacionFiltrada$.pipe(cache());
        this.mapaCamasService.selectedResumen.subscribe(resumen => {
            // para que al momento de deshacer una internacion (por ej) no quede el sidebar abierto
            if (!resumen?.id) {
                this.idInternacionSelected = null;
            }
        });
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

    volver() {
        this.location.back();
    }

}
