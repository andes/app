import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Prestacion } from '../../../modelos/prestacion';
import { Familiar } from '../../../modelos/familiar';

@Component({
    selector: 'app-detalle-familiar',
    templateUrl: './detalle-familiar.component.html',
})
export class DetalleFamiliarComponent implements OnInit {

    public selectedId;
    public familiares$;
    public prestaciones$;
    public listadoPrestacion: Prestacion[];
    prestacion$: Observable<Prestacion>;
    familiar$: Observable<Familiar>;



    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.familiares$ = this.prestacionService.getFamiliares();

        // Mostrar detalle de prestacion
        this.familiar$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getFamiliar(params.get('id')))
        );
    }


}
