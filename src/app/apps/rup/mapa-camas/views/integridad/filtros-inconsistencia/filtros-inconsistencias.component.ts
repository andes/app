import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IntegridadService } from '../integridad.service';

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
    selector: 'app-filtros-inconsistencias',
    templateUrl: './filtros-inconsistencias.component.html',
})

export class FiltrosInconsistenciasComponent implements OnInit {

    public sectorList$: Observable<any[]>;
    public camaList$: Observable<any[]>;

    filtros: any = {};
    censables = [
        { id: 0, nombre: 'No censable' },
        { id: 1, nombre: 'Censable' }
    ];

    constructor(
        public integridadService: IntegridadService
    ) { }

    ngOnInit() {
        this.sectorList$ = this.integridadService.listaInconsistencias$.pipe(
            map((inconsistencias) => arrayToSet(inconsistencias, 'nombre', (item) => item.source.sectores))
        );

        this.camaList$ = this.integridadService.listaInconsistencias$.pipe(
            map((inconsistencias) => arrayToSet(inconsistencias, 'nombre', (item) => item.source))
        );
        this.clearFiltros();
    }

    private clearFiltros() {
        this.integridadService.fechaOrigenDesde.next(null);
        this.integridadService.fechaOrigenHasta.next(null);
        this.integridadService.fechaDestinoDesde.next(null);
        this.integridadService.fechaDestinoHasta.next(null);
        this.integridadService.sectorSelected.next(null);
        this.integridadService.camaSelected.next(null);
    }

    filtrar() {
        this.integridadService.fechaOrigenDesde.next(this.filtros.fechaOrigenDesde);
        this.integridadService.fechaOrigenHasta.next(this.filtros.fechaOrigenHasta);
        this.integridadService.fechaDestinoDesde.next(this.filtros.fechaDestinoDesde);
        this.integridadService.fechaDestinoHasta.next(this.filtros.fechaDestinoHasta);
        this.integridadService.sectorSelected.next(this.filtros.sector);
        this.integridadService.camaSelected.next(this.filtros.cama);
    }
}
