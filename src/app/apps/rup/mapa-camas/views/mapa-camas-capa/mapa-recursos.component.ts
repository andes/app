import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { map, pluck } from 'rxjs/operators';
import { cache } from '@andes/shared';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { of, Subscription } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MapaCamaListadoColumns } from '../../interfaces/mapa-camas.internface';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { WebSocketService } from 'src/app/services/websocket.service';
function arrayToSet(array, key, itemFn) {
    const listado = [];
    array.forEach(elem => {
        const item = itemFn(elem);
        if (Array.isArray(item)) {
            item.forEach(inside => {
                const index = listado.findIndex(i => i[key] === inside[key]);
                if (index < 0) {
                    listado.push(inside);
                }
            });
        } else {
            const index = listado.findIndex(i => i[key] === item[key]);
            if (index < 0) {
                listado.push(item);
            }
        }
    });
    return listado;
}

@Component({
    selector: 'app-mapa-recursos',
    templateUrl: 'mapa-camas-recursos.component.html',
})

export class MapaRecursosComponent implements OnInit {
    public tModel: any;
    public opciones: any[];
    public opciones1: any[];
    public sectorList$: Observable<any[]>;
    public sec;
    public opciones2: any[];
    public modelo1 = { select: null };
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    // public prueba = '';
    public templateModel2: any;
    public modelo: any;

    public showModal = false;
    mapaSectores$: Observable<any[]>;
    organizacion$: Observable<any>;
    // public listadoPaciente: Paciente[];
    // pacientes$: Observable<Paciente[]>;
    foco = 'main';
    items = [];
    public prueba = '';
    public cambio = '';

    constructor(
        public auth: Auth,
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        private organizacionService: OrganizacionService
    ) {

    }

    ngOnInit() {
        this.mapaCamasService.setView('mapa-camas');
        this.mapaCamasService.setCapa('medica');
        this.mapaCamasService.setAmbito('internacion');

        this.organizacion$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
            cache()
        );
        // this.sectorList$ = this.mapaCamasService.snapshot$.pipe(
        //     map((camas) => arrayToSet(camas, 'nombre', (item) => item.sectores))
        // );
        this.mapaSectores$ = this.organizacion$.pipe(pluck('mapaSectores'));

        // plex-datetime
        this.tModel = {
            fechaHora: null,
            fecha: null,
            hora: null,
            horados: null,
            disabled: false,
            min: new Date(1970, 0, 1),
            minHora: moment().add(30, 'minutes'),
            maxHora: moment().add(180, 'minutes'),
            fechaDecounce: new Date(1970, 0, 1),
        };

        this.tModel = { valor: null };

        // plex-select
        this.opciones = [{
            id: 1,
            nombre: 'Quirófano 1',
            continente: '',
        },
        {
            id: 2,
            nombre: 'Quirófano 2',
            continente: '',
        },
        {
            id: 3,
            nombre: 'Quirófano 3',
            continente: '',
        }];

        this.opciones1 = [{
            id: 1,
            nombre: 'cuna',
            continente: '',
        },
        {
            id: 2,
            nombre: 'cama eléctrica',
            continente: '',
        },
        {
            id: 3,
            nombre: 'cama estándar',
            continente: '',
        },
        {
            id: 4,
            nombre: 'cama terapéutica',
            continente: '',
        },
        {
            id: 5,
            nombre: 'cama pediátrica',
            continente: '',
        },
        ];

        this.opciones2 = [{
            id: 1,
            nombre: 'Disponible',
            continente: '',
        },
        {
            id: 2,
            nombre: 'Ocupada',
            continente: '',
        },
        ];

        this.items = [
            { label: 'Censo diario' },
            { label: 'Censo mensual' },
        ];
        this.modelo1.select = this.modelo2.select = this.opciones[1];

        // plex-text
        this.templateModel2 = { nombre: null, min: 10, max: 15 };

        // plex-bool
        this.modelo = { checkbox: false, slide: false };
    }

}
