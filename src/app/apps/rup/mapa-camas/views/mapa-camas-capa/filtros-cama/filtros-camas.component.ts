import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
    selector: 'app-filtros-camas',
    templateUrl: './filtros-camas.component.html',
})

export class FiltrosCamasComponent implements OnInit {

    public unidadOrganizativaList$: Observable<any[]>;
    public sectorList$: Observable<any[]>;
    public tipoCamaList$: Observable<any[]>;
    public equipamientoList$: Observable<any[]>;
    public estadoList$: Observable<any[]>;

    filtro: any = {};
    censables = [
        { id: 0, nombre: 'No censable' },
        { id: 1, nombre: 'Censable' }
    ];

    constructor(
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.unidadOrganizativaList$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', (item) => item.unidadOrganizativa))
        );

        this.sectorList$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'nombre', (item) => item.sectores[0]))
        );

        this.tipoCamaList$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', (item) => item.tipoCama))
        );

        this.equipamientoList$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', ((item) => item.equipamiento ? item.equipamiento : []))),
        );

        this.estadoList$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'estado', (item) => item)),
            map(estados => estados.map(e => ({ estado: e.estado })))
        );


        this.clearFiltros();
    }

    private clearFiltros() {
        this.mapaCamasService.pacienteText.next(null);
        this.mapaCamasService.tipoCamaSelected.next(null);
        this.mapaCamasService.unidadOrganizativaSelected.next(null);
        this.mapaCamasService.esCensable.next(null);
        this.mapaCamasService.sectorSelected.next(null);
        this.mapaCamasService.equipamientoSelected.next(null);
        this.mapaCamasService.estadoSelected.next(null);
    }

    filtrar() {
        this.mapaCamasService.unidadOrganizativaSelected.next(this.filtro.unidadOrganizativa);
        this.mapaCamasService.sectorSelected.next(this.filtro.sector);
        this.mapaCamasService.tipoCamaSelected.next(this.filtro.tipoCama);
        this.mapaCamasService.esCensable.next(this.filtro.censable);
        this.mapaCamasService.pacienteText.next(this.filtro.paciente);

        this.mapaCamasService.equipamientoSelected.next(this.filtro.equipamiento);
        this.mapaCamasService.estadoSelected.next(this.filtro.estado);

    }
}
