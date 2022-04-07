import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';
@Component({
    selector: 'rup-peso',
    templateUrl: 'peso.html'
})
@RupElement('PesoComponent')
export class PesoComponent extends RUPComponent implements OnInit {
    public esRequerido: boolean;

    ngOnInit() {
        if (!this.soloValores) {
            // Observa cuando cambia la propiedad 'peso' en otro elemento RUP
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

        if (this.params) {
            this.esRequerido = this.params.required;
        } else {
            this.esRequerido = false;
        }
    }
}
