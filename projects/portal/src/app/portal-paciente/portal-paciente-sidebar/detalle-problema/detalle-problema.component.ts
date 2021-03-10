import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Problema } from '../../../modelos/problema';

@Component({
    selector: 'app-detalle-problema-huds',
    templateUrl: './detalle-problema.component.html',
})
export class DetalleProblemaComponent implements OnInit {

    public selectedId;
    public problemas$;
    public listadoPrestacion: Problema[];
    problema$: Observable<Problema>;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.problemas$ = this.prestacionService.getProblemas();
        this.prestacionService.getPreviousUrl();

        // Mostrar detalle del problema
        this.problema$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProblema(params.get('id')))
        );
    }


}
