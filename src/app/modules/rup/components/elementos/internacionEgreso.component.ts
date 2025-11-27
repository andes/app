/* eslint-disable no-console */
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'rup-internacionEgreso',
    templateUrl: 'internacionEgreso.html'
})
@RupElement('InternacionEgresoComponent')
export class InternacionEgresoComponent extends RUPComponent implements OnInit {
    informeEgreso$ = new BehaviorSubject<any>(null);

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }

        if (!this.registro.valor.InformeEgreso) {
            this.registro.valor.InformeEgreso = {};
        }

        // Inicializar observable
        this.informeEgreso$.next(this.registro.valor.InformeEgreso);

        console.log('DEBUG - informeEgreso$', this.registro.valor.InformeEgreso);
    }

}
