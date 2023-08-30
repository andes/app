import { Component, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IngresoPacienteService } from './ingreso-paciente-workflow.service';

@Component({
    selector: 'app-ingreso-paciente-workflow',
    templateUrl: 'ingreso-paciente-workflow.component.html',
    providers: [
        IngresoPacienteService
    ]
})
export class IngresoPacienteWorkflowComponent {
    selectedPaciente$: Observable<any> = this.ingresoPacienteService.selectedPaciente;

    @Output() save = new EventEmitter();
    @Output() cancel = new EventEmitter();

    constructor(public ingresoPacienteService: IngresoPacienteService) {
    }

    onBack() {
        this.cancel.emit();
    }

    onSave(event) {
        this.save.emit(event);
    }

    onBackIngreso() {
        this.ingresoPacienteService.selectPaciente(null);
    }
}
