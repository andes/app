import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { IInformeEstadistica } from '../../interfaces/informe-estadistica.interface';

@Component({
    selector: 'listado-internacion-huds',
    templateUrl: 'listado-internacion-huds.html'
})
export class ListadoInternacionHudsComponent implements OnInit, OnChanges {

    @Input() internaciones: IInformeEstadistica[];

    public internacione$: Observable<IInformeEstadistica[]>;

    public columns = [
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) => {
                const org1 = (a.organizacion?.nombre || '') as string;
                const org2 = (b.organizacion?.nombre || '') as string;
                return org1.localeCompare(org2);
            }
        },
        {
            key: 'unidad_organizativa',
            label: 'Servicio',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) => {
                const u1 = a.unidadOrganizativa?.term || '';
                const u2 = b.unidadOrganizativa?.term || '';
                return u1.localeCompare(u2);
            }
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) => {
                const fecha1 = moment(a.informeIngreso?.fechaIngreso);
                const fecha2 = moment(b.informeIngreso?.fechaIngreso);
                return fecha1.diff(fecha2);
            }
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) => {
                const fecha1 = a.informeEgreso?.fechaEgreso ? new Date(a.informeEgreso.fechaEgreso).getTime() : 0;
                const fecha2 = b.informeEgreso?.fechaEgreso ? new Date(b.informeEgreso.fechaEgreso).getTime() : 0;
                return fecha1 - fecha2;
            }
        },
        {
            key: 'razon_alta',
            label: 'razon alta',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) => {
                const r1 = a.informeEgreso?.tipoEgreso?.nombre || '';
                const r2 = b.informeEgreso?.tipoEgreso?.nombre || '';
                return r1.localeCompare(r2);
            }
        },
        {
            key: 'accion',
            label: 'accion',
            opcional: true
        }
    ];

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['internaciones'] && changes['internaciones'].currentValue) {
            this.internacione$ = of(this.internaciones);
        }
    }

    gotoExploracionVisual(idInternacion: string) {
        this.router.navigate([`/mapa-camas/internacion/estadistica/resumen/${idInternacion}`]);
    }
}
