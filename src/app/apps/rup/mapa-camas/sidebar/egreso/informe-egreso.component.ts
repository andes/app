import { Component, OnInit } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { notNull } from '@andes/shared';
import { map, tap } from 'rxjs/operators';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';
import { IInformeEgreso } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';
@Component({
    selector: 'app-informe-egreso',
    templateUrl: './informe-egreso.component.html',
})

export class InformeEgresoComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    informe$: Observable<IInformeEstadistica>;
    registro$: Observable<any>;
    informeEgreso$: Observable<any>;
    // VARIABLES
    public prestacionValidada = false;

    constructor(
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {

        this.informe$ = this.mapaCamasService.informeEstadistica$;

        this.registro$ = this.informe$.pipe(
            notNull(),
            map(informe => informe)
        );

        this.informeEgreso$ = this.informe$.pipe(
            notNull(),
            map(informe => informe.informeEgreso || informe.informeEgreso)
        );
        // this.informeEgreso$ = this.informe$.pipe(
        //     notNull(),
        //     tap(informe => {
        //         console.log('📘 informe completo:', JSON.parse(JSON.stringify(informe)));
        //     }),
        //     map(informe => informe.informeEgreso || informe.informeEgreso),
        //     tap(informeEgreso => {
        //         console.log('informeEgreso:', JSON.parse(JSON.stringify(informeEgreso)));
        //     })
        // );


    }
}
