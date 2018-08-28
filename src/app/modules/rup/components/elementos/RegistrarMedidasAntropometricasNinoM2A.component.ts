import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-registrar-medidas-antropometricas-m2a',
    templateUrl: 'RegistrarMedidasAntropometricasNinoM2A.html'
})
export class RegistrarMedidasAntropometricasNinoM2AComponent extends RUPComponent implements OnInit {


    ngOnInit() {
        this.registro.valido = true;
    }

}
