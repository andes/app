import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';
@Component({
    selector: 'rup-percentiloPerimetroCefalico',
    templateUrl: 'percentiloPerimetroCefalico.html'
})
@RupElement('PercentiloPerimetroCefalicoComponent')
export class PercentiloPerimetroCefalicoComponent extends RUPComponent implements OnInit {

    ngOnInit() {
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
        }
    }
}
