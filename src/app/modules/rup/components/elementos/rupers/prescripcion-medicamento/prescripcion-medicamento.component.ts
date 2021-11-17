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

    afterInit = false;

    showModal = false;

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
            semanticTag: 'fármaco de uso clínico',
        });
    }

    isEmpty() {
        const value = this.registro.valor;
        return !value.indicaciones;
    }

    onSelectMedicamentos(medicamento) {
        this.registro.valor.medicamento = medicamento;
        this.emitChange2();
    }

    emitChange2() {
        this.emitChange();
        if (this.registro.valor.medicamento?.conceptId) {
            const ctid = this.registro.valor.medicamento.conceptId;
            this.snomedService.getQuery({
                expression: `${ctid}.411116001.736474004`
            }).subscribe((cts: any[]) => {
                if (cts.length) {
                    this.registro.valor.via = cts[0];
                }
            });
        }
    }
}
