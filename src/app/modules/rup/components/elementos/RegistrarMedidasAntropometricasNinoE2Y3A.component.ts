import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-registrar-medidas-antropometricas-e2y3a',
    templateUrl: '../core/rup.html'
})
export class RegistrarMedidasAntropometricasNinoE2Y3AComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
