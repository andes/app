import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-lactancia',
    templateUrl: 'lactancia.html',
    styles: [
        `
            plex-bool {
                top: 0 !important;
            }
        `
    ] // Le aplico al style top 0 por que el componente plex-bool trae un top: 35px y se sale del content
})
export class LactanciaComponent extends RUPComponent implements OnInit {
    public conceptos: any[] = [];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = [];
        }

        if (this.params) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptos = resultado;
                if (!this.registro.valor.length) { // La primera vez, siempre crea los registro.valor por cada concepto y ser utilizado en el html por el (ngModel)
                    for (let i in this.conceptos) {
                        let concepto = this.conceptos[i];
                        let a = this.estaSeleccionado(concepto);
                        this.registro.valor[i] = {};
                        this.registro.valor[i] = a;
                    }
                }
            });
        }
    }

    private estaSeleccionado(concepto) { // Se genera el arreglo de un registro de lactancia
        let checkbox = false;
        if (this.registro.valor.length) {
            checkbox = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === String(concepto.conceptId)) >= 0; // Se busca el concepto dentro de los seleccionados
        }
        return { concepto: concepto, checkbox: checkbox };
    }

    loadConceptos($event) {
        let conceptosCheckBox = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(conceptosCheckBox);
    }

    selectCheckBox(concepto) {
        let grupos = this.params.grupo;
        for (let k in grupos) {
            if (!grupos[k].includes(concepto.conceptId)) { // Si no pertenece al grupo de seleccion, cambiamos el valor del check a false
                for (let val in grupos[k]) {
                    let indexRegistro = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === grupos[k][val]); // Obtenemos el index del registro
                    if (this.registro.valor[indexRegistro].checkbox) {
                        this.registro.valor[indexRegistro].checkbox = false;
                    }
                }
            }
        }
    }
}
