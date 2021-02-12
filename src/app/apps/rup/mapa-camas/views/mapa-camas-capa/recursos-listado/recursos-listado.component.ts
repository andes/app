import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { CamaMainComponent } from '../../cama/cama.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { map, pluck } from 'rxjs/operators';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { cache } from '@andes/shared';
@Component({
    selector: 'recursos-listado',
    templateUrl: './recursos-listado.component.html'
})
export class RecursosListadoComponent implements OnInit {


    camas$: Observable<any[]>;
    public sectorList$: Observable<any[]>;
    fecha = moment().toDate();
    selectedId: string;
    items = [];
    items2 = [];
    organizacion$: Observable<any>;
    mapaSectores$: Observable<any[]>;
    public camas = [];
    public salida;
    constructor(
        private mapaCamasService: MapaCamasService,
        private router: Router,
        private route: ActivatedRoute,
        public auth: Auth,
        private organizacionService: OrganizacionService
    ) {

    }
    ngOnInit() {
        this.organizacion$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
            cache()
        );

        this.mapaSectores$ = this.organizacion$.pipe(pluck('mapaSectores'));

        this.mapaCamasService.snapshotOrdenado$.pipe(
            map(snapshots => {

                return snapshots.filter(snap => snap.estado !== 'inactiva');
            })
        ).subscribe((d) => {

            const salida = d.filter(h => h.sectores !== undefined);
            this.camas = salida.filter(s => s.sectores.find(n => n.nombre === 'Habitación 509'));
            console.log(this.camas);
        });


        this.items = [
            { label: 'Censo diario' },
            { label: 'Censo mensual' },
        ];

        this.items2 = [
            { label: 'hoy a las 00:00' },
            { label: 'hoy a las 12:00' },
            { label: 'hoy a las 23:59' },
        ];

    }

    selected(cama) {
        this.selectedId = cama.id;
        this.router.navigate(['templates', 'internacion', this.selectedId]);
    }



}
