import { Component, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-ingreso-paciente-workflow',
    templateUrl: 'ingreso-paciente-workflow.component.html'
})
export class IngresoPacienteWorkflowComponent {
    selectedPaciente$: Observable<any> = this.mapaCamasService.selectedPaciente;

    @Output() save = new EventEmitter();
    @Output() cancel = new EventEmitter();

    constructor(public mapaCamasService: MapaCamasService) {
    }

    onback() {
        this.cancel.emit();
    }

    onSave(event) {
        this.save.emit(event);
    }
}
