import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CampaniaSaludService } from '../services/campaniaSalud.service';

@Component({
    selector: 'campaniaSaludVisualizacion',
    templateUrl: 'campaniaVisualizacion.html'
})
export class CampaniaVisualizacionComponent {
    @Input() campania: ICampaniaSalud;
    @Output() modificarOutput = new EventEmitter();

    constructor(public campaniaSaludService: CampaniaSaludService) { }

    /**
     * Notifica al componente padre que se seleccionó la opción de modificar la campaña seleccionada
     *
     * @memberof CampaniaVisualizacionComponent
     */
    modificar() {
        console.log('campania que llego al visualizar: ', this.campania);
        this.modificarOutput.emit();
    }

}