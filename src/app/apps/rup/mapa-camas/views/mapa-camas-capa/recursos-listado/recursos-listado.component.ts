import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { map } from 'rxjs/operators';
import { ISnapshot } from '../../../interfaces/ISnapshot';

@Component({
    selector: 'app-recursos-listado',
    templateUrl: './recursos-listado.component.html'
})
export class RecursosListadoComponent implements OnInit {

    sectore$: Observable<any[]>;
    selectedCama$: Observable<ISnapshot>;
    accion;
    selectedId;
    estadoRelacion: any;
    constructor(
        private mapaCamasService: MapaCamasService,
        public auth: Auth,

    ) {

    }
    ngOnInit() {
        this.sectore$ = this.mapaCamasService.snapshotOrdenado$.pipe(
            map(snapshots => {
                const arreglo = [];
                snapshots = snapshots.filter(snap => snap.estado !== 'inactiva');
                snapshots.map(c => {
                    if (!(arreglo.length > 0)) {
                        arreglo.push(c);
                    } else
                        if (!(arreglo.find(d => d.sectorName === c.sectorName))) {
                            arreglo.push(c);
                        }
                });
                return arreglo.map(sector => {

                    return {
                        nombre: sector.sectorName.split(',').reverse().join(','),
                        camasSector: snapshots.filter(c => c.sectorName === sector.sectorName)
                    };
                });

            })
        );

        this.selectedCama$ = this.mapaCamasService.selectedCama.pipe(
            map((cama) => {
                if (cama.id && !this.accion) {
                    this.accion = 'verDetalle';
                }
                return cama;
            })
        );
    }

    verDetalle(cama: ISnapshot, selectedCama: ISnapshot) {
        if (!selectedCama.id || cama !== selectedCama) {
            this.mapaCamasService.select(cama);
            this.accion = 'verDetalle';
        } else {
            this.accion = null;
            this.mapaCamasService.select(null);
        }
    }

    selectCama(cama, relacion) {
        this.mapaCamasService.resetView();
        this.mapaCamasService.select(cama);
        if (relacion) {
            this.estadoRelacion = relacion;
            this.accion = relacion.accion;
        }
    }
}
