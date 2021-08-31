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

    public conceptos: any[] = [];

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();

    ngOnInit() {

        if (!this.registro.valor) {
            this.registro.valor = [];
        }

        if (this.params) {

            // Conceptos de Refset
            if (this.params.refsetId) {
                this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                    this.conceptos = resultado;
                });
            } else if (this.params.query) {
                // Soporte para cualquier tipo de query
                this.snomedService.getQuery({ expression: this.params.query }).subscribe(resultado => {
                    this.conceptos = resultado;
                });
            }

            // Si params.ultimoValor es true, se traen los últimos datos validados de la HUDS
            // Sirve por ejemplo para pre-setear antecedentes y trastornos crónicos
            if (this.params.ultimoValor) {
                const params: IPrestacionGetParams = {
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

    loadConceptos($event) {
        const conceptosSelect = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(conceptosSelect);
    }

    selectRadio(concepto) {
        this.registro.valor = { concepto: concepto };
    }
}
