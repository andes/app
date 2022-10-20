import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { arrayToSet } from '@andes/shared';



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

    public paciente = '';

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
            map((camas) => camas.map((elem: any) => ({ _id: elem._id, nombre: elem.sectorName })))
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
