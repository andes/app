import { IPrestacion } from '../../../interfaces/prestacion.interface';
import { Component, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { RUPComponent } from '../../core/rup.component';
import { RupElement } from '..';

/**
 * DEPRECADO
 * Se deja para mantener la epicrisis. No debe ser usada en nuevas componentes.
 */

@Component({
    selector: 'rup-InformeEpicrisisComponent',
    templateUrl: 'informeEpicrisis.html',
    styleUrls: ['informeEpicrisis.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
@RupElement('InformeEpicrisisComponent')
export class InformeEpicrisisComponent extends RUPComponent implements OnInit {

    public accordionActive = 0;
    public unidadesOrganizativas = [];
    public desplegarTodo = false;
    public mensajeAccionAccordion = 'Desplegar';


    ngOnInit() {
        this.registro.hasSections = true;
        if (!this.registro.valor) {
            this.registro.valor = {
                unidadOrganizativa: null
            };
        }
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.unidadesOrganizativas = organizacion.unidadesOrganizativas;
        });
    }

    get requeridos() {
        const requeridos = [];
        for (let i = 0; i < this.registro.registros.length; i++) {
            const concepto = this.registro.registros[i].concepto;
            const requerido = this.elementoRUP.requeridos.find(r => r.concepto.conceptId === concepto.conceptId);
            if (requerido) {
                requeridos.push(requerido);
            }
        }
        return requeridos;
    }


    accordionSeleccionado(i, concepto: any) {
        if (this.accordionActive === i) {
            this.accordionActive = -1;
            this.prestacionesService.clearRefSetData();
        } else {
            this.accordionActive = i;
            this.prestacionesService.setRefSetData(concepto);
            this.prestacionesService.clearData();
        }
    }

    desplegarAccordions() {
        this.desplegarTodo = !this.desplegarTodo;
        this.mensajeAccionAccordion = this.desplegarTodo ? 'Colapsar' : 'Desplegar';
        this.accordionActive = -1;
        this.prestacionesService.clearRefSetData();
    }

    VerArbolRelaciones() {
    }
}
