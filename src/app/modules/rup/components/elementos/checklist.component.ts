import { IPrestacionGetParams } from '../../interfaces/prestacionGetParams.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-Checklist',
    templateUrl: 'checklist.html'
})
@RupElement('ChecklistComponent')
export class ChecklistComponent extends RUPComponent implements OnInit {

    public conceptos: any[] = [];

    ngOnInit() {

        if (!this.registro.valor) {
            this.registro.valor = [];
        }

        if (this.params) {
            if (this.params.query) {

                // Soporte para cualquier tipo de query
                this.snomedService.getQuery({ expression: this.params.query }).subscribe(resultado => {
                    this.conceptos = resultado;
                    this.conceptos.map(d => {
                        this.registro.valor.map(c => {
                            if (c.concepto.conceptId === d.conceptId) {
                                d.value = true;
                            }
                            return d;
                        });
                    });
                });

            }
            // Si params.ultimoValor es true, se traen los últimos datos validados de la HUDS
            // Sirve por ejemplo para pre-setear antecedentes y trastornos crónicos
            if (this.params.ultimoValor) {
                let params: IPrestacionGetParams = {
                    idPaciente: this.paciente.id,
                    conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
                    estado: 'validada'
                };
                this.prestacionesService.get(params).subscribe(ultimaPrestacionPaciente => {
                    let registroValor = null;
                    if (ultimaPrestacionPaciente && ultimaPrestacionPaciente.length > 0) {
                        registroValor = ultimaPrestacionPaciente[ultimaPrestacionPaciente.length - 1].ejecucion.registros
                            .find(y => y.concepto.conceptId === this.registro.concepto.conceptId);

                        if (registroValor.valor && registroValor.valor.length) {
                            this.registro.valor = registroValor.valor;
                        }
                    }

                });
            }

        }
    }

    selectCheck(concepto) {
        let posConcepto;
        if (concepto.value) {
            if (!this.registro.valor.some(c => c.concepto.conceptId === concepto.conceptId)) {
                this.registro.valor.push({ concepto });
            }
        } else {
            posConcepto = this.registro.valor.indexOf(this.registro.valor.find(c => c.concepto.conceptId === concepto.conceptId));
            this.registro.valor.splice(posConcepto, 1);
        }
    }
}
