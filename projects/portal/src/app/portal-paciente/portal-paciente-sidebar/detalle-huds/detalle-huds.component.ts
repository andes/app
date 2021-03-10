import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Huds } from '../../../modelos/huds';

@Component({
    selector: 'app-detalle-huds',
    templateUrl: './detalle-huds.component.html',
})
export class DetalleHudsComponent implements OnInit {

    public selectedId;
    public huds$;
    public listadoHud: Huds[];
    hud$: Observable<Huds>;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.huds$ = this.prestacionService.getHuds();
        this.prestacionService.getPreviousUrl();

        // Mostrar detalle de prestacion
        this.hud$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getHud(params.get('id')))
        );
    }


}
