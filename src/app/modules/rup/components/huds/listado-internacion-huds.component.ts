import moment from 'moment';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { IInformeEstadistica } from '../../interfaces/informe-estadistica.interface';

@Component({
    selector: 'listado-internacion-huds',
    templateUrl: 'listado-internacion-huds.html'
})

export class ListadoInternacionHudsComponent implements OnChanges {

    @Input() internaciones: IInformeEstadistica[] = [];

    public internacione$: Observable<IInformeEstadistica[]>;


    public columns = [
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: true,
            sort: (a: IInformeEstadistica, b: IInformeEstadistica) =>
                (a.organizacion?.nombre || '').localeCompare(b.organizacion?.nombre || '')
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
                const fecha1 = a.informeEgreso?.fechaEgreso ? moment(a.informeEgreso.fechaEgreso).valueOf() : 0;
                const fecha2 = b.informeEgreso?.fechaEgreso ? moment(b.informeEgreso.fechaEgreso).valueOf() : 0;
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
    constructor(private router: Router) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['internaciones']) {
            const informes = this.internaciones || [];
            this.internacione$ = of([...informes].sort((a, b) => {
                const fecha1 = moment(a.informeIngreso?.fechaIngreso);
                const fecha2 = moment(b.informeIngreso?.fechaIngreso);
                return fecha2.diff(fecha1);
            }));
        }
    }

    gotoExploracionVisual(idInternacion: string) {
        this.router.navigate([`/mapa-camas/internacion/estadistica/resumen/${idInternacion}`]);
    }
}
