import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { ISnomedConcept } from '../../../../interfaces/snomed-concept.interface';

// [TODO] Epic ocultar cascaron de RUP en modo seccionado

// [TODO] solo valores version clasic
// [TODO] Tener moleculas antes de las secciones?
// [TODO] sin icono o icono por default ?

@Component({
    selector: 'rup-seccionnado-component',
    templateUrl: 'seccionado.component.html',
    styleUrls: ['seccionado.component.scss'],
    encapsulation: ViewEncapsulation.None
})
@RupElement('SeccionadoComponent')
export class SeccionadoComponent extends RUPComponent implements OnInit {

    public accordionActive = -1;
    public desplegarTodo = false;


    ngOnInit() {
        this.registro.hasSections = true;
        this.accordionSeleccionado(0, this.registro.registros[0].concepto);
    }

    get btnToogleLabel() {
        return this.desplegarTodo ? 'Colapsar Todos' : 'Desplegar Todos';
    }

    isActive(i: number) {
        return this.accordionActive === i || this.desplegarTodo;
    }

    showNoConcept(i: number, rupInstance: RUPComponent) {
        const registroInterno = this.registro.registros[i];
        const isSection = registroInterno.isSection;
        const tieneRegistros = registroInterno.registros.length > 0;
        return !tieneRegistros && isSection && rupInstance.isValid;
    }

    showCountConcept(i: number, rupInstance: RUPComponent) {
        const registroInterno = this.registro.registros[i];
        const isSection = registroInterno.isSection;
        const tieneRegistros = registroInterno.registros.length > 0;
        return tieneRegistros && isSection && rupInstance.isValid;
    }

    iconName(name: string) {
        const index = name.indexOf('-');
        return name.substring(index + 1);
    }

    iconPrefix(name: string) {
        const index = name.indexOf('-');
        return name.substring(0, index);
    }

    accordionSeleccionado(i: number, concepto: ISnomedConcept) {
        if (this.accordionActive === i) {
            this.accordionActive = -1;
            this.ejecucionService.clearSeccion();
        } else {
            this.accordionActive = i;
            this.ejecucionService.setSeccion(concepto);
        }
    }

    desplegarAccordions() {
        this.desplegarTodo = !this.desplegarTodo;
        this.accordionActive = -1;
        this.ejecucionService.clearSeccion();
    }

}
