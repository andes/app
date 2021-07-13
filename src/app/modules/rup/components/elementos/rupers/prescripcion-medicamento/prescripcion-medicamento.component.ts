import { Unsubscribe } from '@andes/shared';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';

@Component({
    selector: 'rup-prescripcion-medicamentos',
    templateUrl: 'prescripcion-medicamento.component.html'
})
@RupElement('SolicitudPrescripcionMedicamentoComponent')
export class SolicitudPrescripcionMedicamentoComponent extends RUPComponent implements OnInit, AfterViewInit {

    public reglasMatch = [];
    public reglaSelected = null;

    public organizaciones: any[] = [];
    afterInit = false;

    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
    }

    @Unsubscribe()
    loadConceptos(event) {
        if (!event) { return; }
        if (event.query && event.query.length > 2) {
            return this.getData(event.query).subscribe((data) => {
                event.callback(data);
            });
        } else {
            if (this.registro.valor && this.registro.valor.length) {
                event.callback(this.registro.valor);
            } else {
                event.callback([]);
            }
        }
    }

    getData(input: string) {
        return this.snomedService.get({
            search: input,
            semanticTag: 'fármaco de uso clínico'
        });
    }

    isEmpty() {
        const value = this.registro.valor;
        return !value.indicaciones;
    }
}
