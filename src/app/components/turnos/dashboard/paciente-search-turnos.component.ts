import {
    PacienteSearchComponent
} from '../../paciente/paciente-search.component';
import {
    Component,
    Output,
    Input,
    EventEmitter,
    OnInit
} from '@angular/core';


@Component({
    selector: 'paciente-search-turnos',
    templateUrl: 'paciente-search-turnos.html'
})
export class PacienteSearchTurnosComponent extends PacienteSearchComponent {

    public mostrarNuevo = false;

    @Input('resultadoCreateUpdate')
    set resultadoCreateUpdate(value: any) {
        if (value && value.length) {
            this.resultado = value;
        }
    }
    get resultadoCreateUpdate(): any {
        return this.resultado;
    }
    @Output() sinResultados: EventEmitter < any > = new EventEmitter < any > ();
    @Output() operacion: EventEmitter < any > = new EventEmitter < any > ();
    @Output() createUpdate: EventEmitter < any > = new EventEmitter < any > ();

    pacienteSeleccionado = null;


    // Emite al componente puntoInicio
    public operacionSeleccionada(operacion, paciente) {
        if (operacion) {
            // Se habilita el calendario para seleccionar las agendas y permitir asignar turnos al paciente
            debugger;
            this.operacion.emit({
                operacion,
                paciente
            });
        }
    }

    public seleccionar(paciente: any) {
        // Se muestran los datos básicos del paciente en el componente estadisticas Paciente
        this.pacienteSeleccionado = paciente;
        this.selected.emit(paciente);
        this.resultado = [paciente];
        this.textoLibre = '';
    }

    public seleccionarPaciente(paciente: any) {
        super.seleccionarPaciente(paciente);
        if (this.esEscaneado) {
            this.sinResultados.emit(false);
        }
    }

    public buscar() {
        this.pacienteSeleccionado = null;
        super.buscar();
        if (!this.resultado || this.resultado.length === 0) {
            this.mostrarNuevo = true;
            this.sinResultados.emit(true);
        }
    }

}
