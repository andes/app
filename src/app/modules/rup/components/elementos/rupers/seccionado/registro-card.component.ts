import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';

@Component({
    selector: 'rup-registro-card',
    templateUrl: 'registro-card.component.html',
    styleUrls: ['seccion.component.scss']
})
@RupElement('RegistroCardComponent')
export class RegistroCardComponent extends RUPComponent implements OnInit {
    @Input() elementoRUP: any;
    @Input() registro: any;
    @Input() prestacion: any;
    @Input() params: any;
    @Input() paciente: any;
    @Input() i: number;
    @Input() itemsRegistros: any = {};
    @Input() confirmarDesvincular: any[] = [];
    @Input() confirmarEliminar = false;
    @Input() indexEliminar: any;
    @Input() scopeEliminar: string;
    @Input() soloValoresfact = false;

    // Evento para comunicar al componente padre que debe eliminar un registro
    @Output() eliminarRegistroEvent: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        // Inicialización del componente
    }

    desvincular(registroActual, registroDesvincular) {
        this.confirmarDesvincular[registroActual.id] = registroDesvincular.id;
    }

    cancelarDesvincular(registroId) {
        delete this.confirmarDesvincular[registroId];
    }

    confirmarDesvinculacion(registroId, index) {
        // quitamos relacion si existe
        if (this.confirmarDesvincular[registroId]) {
            const registroActual = this.registro;

            if (registroActual) {
                registroActual.relacionadoCon = registroActual.relacionadoCon.filter(rr => rr.id !== this.confirmarDesvincular[registroId]);
                delete this.confirmarDesvincular[registroId];
            }
        }
    }

    vincularRegistros(registroOrigen: any, registroDestino: any) {
        // si proviene del drag and drop lo que llega es un concepto
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }
        // Verificamos si ya esta vinculado no dejar que se vinculen de nuevo
        const control = this.controlVinculacion(registroOrigen, registroDestino);
        if (control) {
            return false;
        }
        // Controlar si lo que llega como parámetro es un registro o es un concepto
        if (!registroOrigen.concepto) {
            // this.ejecutarConceptoInside(registroOrigen, registroDestino);
        } else {
            if (registroOrigen) {
                registroOrigen.relacionadoCon = [registroDestino];
            }
        }
    }

    controlVinculacion(registroOrigen, registroDestino) {
        let control;
        if (this.recorreArbol(registroDestino, registroOrigen)) {
            return true;
        }
        if (registroOrigen === registroDestino) {
            return true;
        }
        if (registroOrigen.relacionadoCon && registroOrigen.relacionadoCon.length > 0) {
            control = registroOrigen.relacionadoCon.find(registro => registro.id === registroDestino.id);
        }
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            control = registroDestino.relacionadoCon.find(registro => registro.id === registroOrigen.id);
        }
        if (control) {
            return true;
        } else {
            return false;
        }
    }

    recorreArbol(registroDestino, registroOrigen) {
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            for (const registro of registroDestino.relacionadoCon) {
                if (registro.id === registroOrigen.id) {
                    return true;
                }
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    return this.recorreArbol(registro, registroOrigen);
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    cambiaValorCollapse(indice) {
        if (this.itemsRegistros[indice]) {
            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
    }

    confirmarEliminarRegistro(scope) {
        this.scopeEliminar = scope;
        this.indexEliminar = this.i;
        this.confirmarEliminar = true;
    }

    eliminarRegistro() {
        // // Emitimos el evento para que el componente padre maneje la eliminación
        this.eliminarRegistroEvent.emit();
    }

    checkPlantilla(registro) {
        const checkSemtag = registro.concepto.semanticTag === 'procedimiento' || registro.concepto.semanticTag === 'elemento de registro' || registro.concepto.semanticTag === 'régimen/tratamiento';
        return checkSemtag;
    }
}
