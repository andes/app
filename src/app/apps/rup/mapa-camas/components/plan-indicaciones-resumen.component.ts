import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { PlanIndicacionesServices } from '../services/plan-indicaciones.service';


@Component({
    selector: 'in-plan-indicaciones-resumen',
    templateUrl: './plan-indicaciones-resumen.component.html'
})
export class PlanIndicacionesResumenComponent implements OnInit {

    @Input() prestacion: IPrestacion;

    indicaciones$: Observable<any[]>;

    @Output() edit = new EventEmitter();

    constructor(
        private planIndicacionesServices: PlanIndicacionesServices,
    ) {

    }

    ngOnInit() {
        this.indicaciones$ = this.planIndicacionesServices.getIndicaciones(this.prestacion.trackId, new Date(), null);
    }

    onEdit(indicacion) {
        this.edit.emit(indicacion);
    }

}
