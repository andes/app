import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-calculo-edad-gestacional',
    templateUrl: 'edadGestacional.html'
})
@RupElement('CalculoEdadGestacionalComponent')
export class CalculoEdadGestacionalComponent extends RUPComponent implements OnInit {

    termCapitalized = '';
    fechaUltimaMenstruacion: Date;
    fechaUPMConceptId = '21840007'; // conceptId fecha de último periodo menstrual
    registro: any = {};
    alerta = '';

    ngOnInit() {
        if (!this.soloValores) {
            // Observa cuando cambia la propiedad 'percentiloPeso' en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                    if (this.elementoRUP) {
                        this.calculoEdadGestacional();
                    }
                }
            });
        }
        this.termCapitalized += this.elementoRUP.conceptos[0].term[0].toUpperCase() + this.elementoRUP.conceptos[0].term.slice(1).toLowerCase();
    }

    cumpleReglasParams(elementoRUP) {
        if (this.params?.reglas?.visualizacion?.ocultar) {
            return this.params.reglas.visualizacion.ocultar.atomos.findIndex(x => x === elementoRUP.conceptos[0].conceptId) === -1;
        }
        return 1;
    }

    calculoEdadGestacional() {
        this.registro.valor = null;
        const fechaUPM = this.registro.registros?.find(reg => reg.concepto.conceptId === this.fechaUPMConceptId)?.valor;
        if (fechaUPM) {
            const edad = moment().diff(moment(fechaUPM), 'days') / 7;
            this.registro.valor = Number(edad.toFixed(2));
        }
    }
}
