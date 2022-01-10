import { Unsubscribe } from '@andes/shared';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';

@Component({
    selector: 'rup-prescripcion-medicamentos-internacion',
    templateUrl: 'prescripcion-medicamento-internacion.component.html'
})
@RupElement('SolicitudPrescripcionMedicamentoInternacionComponent')
export class SolicitudPrescripcionMedicamentoInternacionComponent extends RUPComponent implements OnInit, AfterViewInit {


    unidadesSnomed = '<258681007 OR <282115005';
    frecuenciaSnomed = '422133006 OR 421355008 OR 255270004 OR 123035007 OR 123034006 Or 123033000 OR 123032005 OR 123031003 OR 123030002 OR 123027009 OR 73775008 OR 71997007 OR 27814009 OR  21029003';

    afterInit = false;

    showModal = false;

    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                nombre: '',
                sustancias: [{
                    ingrediente: null,
                    denominador: null,
                    numerador: null,
                    cantidad: null
                }],
                frecuencias: [{
                    frecuencia: null,
                    horario: null,
                    cantidad: null
                }]
            };
        }
    }

    addSustancia() {
        this.registro.valor.sustancias.push({
            ingrediente: null,
            denominador: null,
            numerador: null,
            cantidad: null
        });
    }

    addFrecuencia() {
        this.registro.valor.frecuencias.push({
            frecuencia: null,
            horario: null,
            cantidad: null
        });
    }

    deleteSustancia() {
        if (this.registro.valor.sustancias.length > 1) {
            this.registro.valor.sustancias.pop();
        }
    }

    deleteFrecuencia() {
        if (this.registro.valor.frecuencias.length > 1) {
            this.registro.valor.frecuencias.pop();
        }
    }

    valuesChange() {
        const nombre = this.registro.valor.sustancias.map(item => {
            return `${item.ingrediente?.term || ''} ${item.dosis || ''}`;
            // return `${item.ingrediente?.term || ''} ${item.cantidad || ''} ${item.numerador?.term || ''}${ item.denominador ? '/' : '' }${item.denominador?.term || ''}`;
        }).join(' y ');
        this.registro.valor.nombre = nombre;
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
