import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-registrar-medidas-antropometricas',
    templateUrl: '../core/rup.html'
})
export class RegistrarMedidasAntropometricasComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'peso' en otro elemento RUP

        // this.conceptObserverService.observe(this.registro).subscribe((data) => {
        //     // No soy yo mismo
        //     if (this.registro !== data && this.registro.valor !== data.valor) {
        //         this.registro.valor = data.valor;
        //         this.emitChange(false);
        //     }
        // });
    }
}
