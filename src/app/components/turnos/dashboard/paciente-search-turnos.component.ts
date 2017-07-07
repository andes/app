import { PacienteSearchComponent } from '../../paciente/paciente-search.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'paciente-search-turnos',
    templateUrl: 'paciente-search-turnos.html'
})
export class PacienteSearchTurnosComponent extends PacienteSearchComponent {

    @Output() sinResultados: EventEmitter<any> = new EventEmitter<any>();
    @Output() operacion: EventEmitter<any> = new EventEmitter<any>();


    public operacionSeleccionada(operacion) {
        if (operacion) {
            // Se habilita el calendario para seleccionar las agendas y permitir asignar turnos al paciente
            this.operacion.emit(operacion);
        }
    }

    public seleccionar(paciente: any) {
        // Se muestran los datos básicos del paciente en el componente estadisticas Paciente
        this.selected.emit(paciente);
    }

    public buscar() {
        super.buscar();
        if (this.resultado == null) {
            this.sinResultados.emit(true);
        }
    }

}
