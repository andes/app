import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Plex } from '@andes/plex';
import { snomedIngreso, snomedEgreso } from '../../constantes-internacion';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListadoInternacionCapasService } from './listado-internacion-capas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';

@Component({
    selector: 'app-listado-internacion-capas',
    templateUrl: './listado-internacion-capas.component.html',
})

export class ListadoInternacionCapasComponent implements OnInit {
    listaInternacion$: Observable<IResumenInternacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;

    idInternacionSelected: string = null;

    // VARIABLES
    public listaInternacion;
    public listaInternacionAux;
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;

    mainView$ = this.mapaCamasService.mainView;


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

        this.listaInternacion$ = this.listadoInternacionCapasService.listaInternacionFiltrada$;
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
