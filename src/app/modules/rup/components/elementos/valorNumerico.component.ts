import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-valor-numerico',
    templateUrl: 'valorNumerico.html'
})
@RupElement('ValorNumericoComponent')
export class ValorNumericoComponent extends RUPComponent implements OnInit {
    public esRequerido: boolean;
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = 0;
        }
        if (!this.soloValores) {
            // Observa cuando cambia la propiedad 'valor' en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
            // si el ojo que todo lo ve encuentra un valor en la consulta no consultamos a la api.
            if (this.params.autocomplete && !this.registro.valor) {
                let query = this.params.autocomplete.query ? this.params.autocomplete.query : this.registro.concepto.conceptId;
                // llega en dias desde la BD
                let deadline = null;
                if (this.params.autocomplete.deadline) {
                    deadline = this.params.autocomplete.deadline;
                    deadline = new Date(Date.now() - deadline * 24 * 60 * 60 * 1000);
                }
                this.prestacionesService.getRegistrosHuds(this.paciente.id, query, deadline).subscribe(prestaciones => {
                    // Ver si tomamos el ultimo valor..
                    if (prestaciones.length) {
                        this.registro.valor = prestaciones[prestaciones.length - 1].registro.valor;
                    }
                    // TODO : Queda pendiente disparar un alerta para el usuario que se recupera el valor desde otra prestacion
                });
            }
        }

        if (this.params) {
            this.esRequerido = this.params.required;
        } else {
            this.esRequerido = false;
        }
    }
}
