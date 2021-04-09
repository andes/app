import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../services/prestaciones.service';

@Component({
    selector: 'pdp-mis-turnos-detalle',
    templateUrl: 'mis-turnos-detalles.component.html',
})
export class PDPMisTurnosDetallesComponent implements OnInit {

    public turno$: Observable<any>;
    public familiar: any = false;
    constructor(
        private prestacionService: PrestacionService,
        private activeRoute: ActivatedRoute,

    ) { }

    ngOnInit() {
        this.familiar = window.sessionStorage.getItem('familiar');

        const parametros = { horaInicio: moment(new Date()).format(), familiar: JSON.stringify(this.familiar) };

        this.turno$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getTurno(params.get('id'), parametros))
        );
    }
}
