import { arrayToSet } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { MapaCamasService } from '../../../services/mapa-camas.service';



@Component({
    selector: 'app-filtros-camas',
    templateUrl: './filtros-camas.component.html',
    styleUrls: ['filtros-camas.scss']
})

export class FiltrosCamasComponent implements OnInit {

    public unidadOrganizativaList$: Observable<any[]>;
    public sectorList$: Observable<any[]>;
    public tipoCamaList$: Observable<any[]>;
    public equipamientoList$: Observable<any[]>;
    public estadoList$: Observable<any[]>;
    public paciente = '';
    public collapse = true;

    filtro: any = {};
    censables = [
        { id: 0, nombre: 'No censable' },
        { id: 1, nombre: 'Censable' }
    ];

    constructor(
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.unidadOrganizativaList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', (item) => item.unidadOrganizativa))
        );

        this.sectorList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map(cama => this.arraySectores(cama))
        );
        this.tipoCamaList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map((camas) => arrayToSet(camas.filter(snap => !snap.sala), 'conceptId', (item) => item.tipoCama))
        );

        this.equipamientoList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map((camas) => arrayToSet(camas.filter(snap => !snap.sala), 'conceptId', ((item) => item.equipamiento ? item.equipamiento : []))),
        );

        this.estadoList$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            map((camas) => arrayToSet(camas, 'estado', (item) => item)),
            map(estados => estados.map(e => ({ estado: e.estado })))
        );

        this.checkSeleccion();
    }

    checkSeleccion() {
        const filtros = [this.mapaCamasService.tipoCamaSelected, this.mapaCamasService.esCensable, this.mapaCamasService.equipamientoSelected];

        combineLatest(filtros).pipe(
            filter(values => values.some(value => value !== null)),
            tap(() => {
                this.collapse = false;
            })
        ).subscribe();
    }

    colapsar() {
        this.collapse = !this.collapse;
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

    // Función que nos devuelve un array de jerarquía de sectores que no estan repetidos
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
