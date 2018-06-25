import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-registrar-medidas-antropometricas',
    templateUrl: '../core/rup.html'
})
export class RegistrarMedidasAntropometricasNinoM2AComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
