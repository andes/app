import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function arrayToSet(array, key, itemFn) {
    const listado = [];
    array.forEach(elem => {
        const item = itemFn(elem);
        const index = listado.findIndex(i => i[key] === item[key]);
        if (index < 0) {
            listado.push(item);
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

    }

    filtrar() {
        this.mapaCamasService.unidadOrganizativaSelected.next(this.filtro.unidadOrganizativa);
        this.mapaCamasService.sectorSelected.next(this.filtro.sector);
        this.mapaCamasService.tipoCamaSelected.next(this.filtro.tipoCama);
        this.mapaCamasService.esCensable.next(this.filtro.censable);
        this.mapaCamasService.pacienteText.next(this.filtro.paciente);
    }
}
