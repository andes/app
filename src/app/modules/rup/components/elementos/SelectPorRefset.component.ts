import { IPrestacionGetParams } from './../../interfaces/prestacionGetParams.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-SelectPorRefset',
    templateUrl: 'SelectPorRefset.html'
})
@RupElement('SelectPorRefsetComponent')
export class SelectPorRefsetComponent extends RUPComponent implements OnInit {
    public values = [];
    public unique = Date.now();

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = [];
        }

        if (this.params) {
            if (this.params.preload) {
                this.snomedService.getQuery({ expression: this.params.query }).subscribe(conceptos => {
                    this.values = conceptos.map(elem => {
                        return { id: elem.conceptId, nombre: elem.term, concepto: elem };
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

    loadData($event) {
        if ($event.query.length > 0) {
            this.snomedService.getQuery({ expression: this.params.query, field: 'term', words: $event.query }).subscribe(resultado => {
                let conceptosSelect = resultado.map(elem => {
                    return { id: elem.conceptId, nombre: elem.term, concepto: elem };
                });
                $event.callback(conceptosSelect);
            });
        }
    }
}
