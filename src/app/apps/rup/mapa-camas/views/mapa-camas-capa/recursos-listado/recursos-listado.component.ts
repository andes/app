import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { map } from 'rxjs/operators';
import { ISnapshot } from '../../../interfaces/ISnapshot';
import { Router } from '@angular/router';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
@Component({
    selector: 'app-recursos-listado',
    templateUrl: './recursos-listado.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecursosListadoComponent implements OnInit {

    sectore$: Observable<any[]>;
    selectedCama$: Observable<ISnapshot>;
    @Output() accionRecurso = new EventEmitter<any>();
    @Input() permisoIngreso: boolean;
    @Input() permisoBloqueo: boolean;
    selectedId;
    estadoRelacion: any;
    canEdit: Boolean;
    constructor(
        public mapaCamasService: MapaCamasService,
        public auth: Auth,
        private router: Router,
        public permisosMapaCamasService: PermisosMapaCamasService
    ) {

    }
    ngOnInit() {

        this.selectedCama$ = this.mapaCamasService.selectedCama.pipe(
            map((cama) => {
                return cama;
            })
        );
        this.canEdit = this.permisosMapaCamasService.camaEdit;
        this.sectore$ = this.mapaCamasService.snapshotOrdenado$.pipe(
            map(snapshots => {
                const arreglo = [];
                snapshots = snapshots.filter(snap => snap.estado !== 'inactiva');
                snapshots.map(c => {
                    if (!(arreglo.find(d => d.sectorName === c.sectorName))) {
                        arreglo.push(c);
                    }
                });
                return arreglo.map(sector => {
                    let nombre = sector.sectorName.split(',').reverse()[0];
                    let aux = sector.sectorName.split(',').reverse();
                    let subtitulo = aux.slice(1, aux.length).join(', ');

                    return {
                        nombre: nombre,
                        subtitulo: subtitulo,
                        camasSector: snapshots.filter(c => c.sectorName === sector.sectorName)
                    };
                });

            })
        );

    }

    verDetalle(cama: ISnapshot, selectedCama: ISnapshot) {
        let data = {
            verDetalle: true,
            cama: cama,
            selectedCama: selectedCama
        };
        this.accionRecurso.emit(data);

    }

    selectCama(cama, relacion, $event) {
        $event.stopPropagation();
        let data = {
            selectCama: true,
            cama: cama,
            relacion: relacion
        };
        this.accionRecurso.emit(data);

    }

    goTo(cama) {
        if (cama.sala) {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/sala-comun/${cama.id}`]);
        } else {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/cama/${cama.id}`]);
        }
    }
}
