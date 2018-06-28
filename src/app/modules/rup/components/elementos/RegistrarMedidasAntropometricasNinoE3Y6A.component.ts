import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-registrar-medidas-antropometricas-e3y6a',
    templateUrl: '../core/rup.html'
})
export class RegistrarMedidasAntropometricasNinoE3Y6AComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
