import { Component, EventEmitter, Output } from '@angular/core';
import { SnomedService } from 'src/app/apps/mitos';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-medicamentos-busqueda-detalle',
    templateUrl: './medicamentos-busqueda-detalle.component.html'
})
export class RUPMedicamentosBusquedaDetalleComponent {

    via;
    producto;
    potencia;
    unidadPresentacion;
    rolTerapeutico;

    potenciaExpression = '<260299005';
    viaExpresssion = '<<736479009';
    unidadPresentacionExpression = '<732935002';
    rolTerapeuticoExpression = '<766941000';

    // 766939001
    // 766941000

    @Output() select = new EventEmitter<ISnomedConcept>();

    constructor(
        private snomedService: SnomedService
    ) {

    }

    onClick(concepto: ISnomedConcept) {
        this.select.emit(concepto);
    }

    refreshListado() {
        const partes = [];

        if (this.via || this.producto || this.potencia || this.unidadPresentacion || this.rolTerapeutico) {
            if (this.via) {
                partes.push(`411116001 = ( * :  736474004 = ${this.via.conceptId} )`);
            }
            if (this.producto) {
                partes.push(`762949000 = ${this.producto.conceptId}`);
            }
            if (this.potencia) {
                partes.push(`732944001 = ${this.potencia.conceptId}`);
            }
            if (this.unidadPresentacion) {
                partes.push(`763032000 = ${this.unidadPresentacion.conceptId}`);
            }
            if (this.rolTerapeutico) {
                partes.push(`(766939001 = ${this.rolTerapeutico.conceptId} OR 766941000 = ${this.rolTerapeutico.conceptId} )`);
            }
        }

        const expression = partes.length > 0
            ? '* : ' + partes.join(' , ')
            : undefined;

        if (partes.length > 0) {
            this.potenciaExpression = `(${expression}).732944001`;
            this.viaExpresssion = `(${expression}).411116001.736474004`;
            this.unidadPresentacionExpression = `(${expression}).763032000`;
            this.rolTerapeuticoExpression = `(${expression}).766941000`;
            this.snomedService.get({
                search: '',
                semanticTag: 'fármaco de uso clínico',
                expression
            }).subscribe((conceptos) => {
                this.listado = conceptos.slice(0, 100);
            });
        } else {
            this.potenciaExpression = '<260299005';
            this.viaExpresssion = '<<736479009';
            this.unidadPresentacionExpression = '<732935002';
            this.rolTerapeuticoExpression = '<766941000';
            this.listado = [];
        }

    }

    listado = [];
}
