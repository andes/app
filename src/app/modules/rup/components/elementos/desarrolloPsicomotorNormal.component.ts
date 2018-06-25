import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-desarrollo-psicomotor',
    templateUrl: 'desarrolloPsicomotorNormal.html'
})
export class DesarrolloPsicomotorNormalComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'Sistolica' en otro elemento RUP
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
    }
}
