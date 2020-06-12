import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-resumenHistoriaClinica',
    templateUrl: 'resumenHistoriaClinica.html'
})
@RupElement('ResumenHistoriaClinicaComponent')
export class ResumenHistoriaClinicaComponent extends RUPComponent implements OnInit {
    public referentSet = [];
    ngOnInit() {
        // Observa cuando cambia la propiedad 'Sistolica' en otro elemento RUP
        if (!this.soloValores && !this.registro.valor) {
            this.prestacionesService.getRegistrosHuds(this.paciente.id, '6035001').subscribe(prestaciones => {
                if (prestaciones && prestaciones.length) {
                    prestaciones.sort(function (a, b) {
                        let dateA = new Date(a.fecha).getTime();
                        let dateB = new Date(b.fecha).getTime();
                        return dateA > dateB ? 1 : -1;
                    });
                    this.registro.valor = prestaciones[prestaciones.length - 1].registro.valor;
                }
            });
        }
    }
}
