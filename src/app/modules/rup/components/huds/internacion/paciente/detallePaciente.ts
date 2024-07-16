import { Component, Input } from '@angular/core';

@Component({
    selector: 'detalle-paciente',
    templateUrl: 'detallePaciente.html',
})

export class DetallePacienteComponent {
    @Input() paciente;

}
