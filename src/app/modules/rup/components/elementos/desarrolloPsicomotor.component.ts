import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-desarrollo-psicomotor',
    templateUrl: 'desarrolloPsicomotor.html'
})
export class DesarrolloPsicomotorComponent extends RUPComponent implements OnInit {
    ngOnInit() {
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
