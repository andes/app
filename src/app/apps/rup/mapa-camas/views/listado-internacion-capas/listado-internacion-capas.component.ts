import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { ListadoInternacionCapasService } from './listado-internacion-capas.service';

@Component({
    selector: 'app-listado-internacion-capas',
    templateUrl: './listado-internacion-capas.component.html',
})

export class ListadoInternacionCapasComponent implements OnInit {
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
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad organizativa',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                return a.unidadOrganizativa.term.localeCompare(b.unidadOrganizativa.term);
            }
        },
    ];

    constructor(
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private location: Location,
    ) { }

    ngOnInit() {
        this.mapaCamasService.setView('mapa-camas');
        this.mapaCamasService.setCapa('medica');
        this.mapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setFecha(new Date());

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
    }

    seleccionarPrestacion(resumen: IResumenInternacion) {
        if (!this.idInternacionSelected || resumen.id !== this.idInternacionSelected) {
            this.mapaCamasService.select({
                id: resumen.id,
                idCama: resumen.id,
                idInternacion: resumen.id,
                paciente: resumen.paciente,
                fecha: resumen.fechaIngreso,
                estado: 'ocupada'
            } as any);
            this.idInternacionSelected = resumen.id;
        } else {
            this.idInternacionSelected = null;
        }
    }

    volver() {
        this.location.back();
    }

}
