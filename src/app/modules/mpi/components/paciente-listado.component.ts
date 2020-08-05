import { IPacienteMatch } from './../interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'paciente-listado',
    templateUrl: 'paciente-listado.html',
    styleUrls: ['paciente-listado.scss']
})
export class PacienteListadoComponent {
    private _pacientes: IPacienteMatch[] | IPaciente[] = [];
    pacienteSeleccionado: IPaciente;
    selectedId: string;

    // Propiedades públicas
    public listado: IPaciente[]; // Contiene un listado plano de pacientes

    /**
     * Listado de pacientes para mostrar. Acepta una lista de pacientes o un resultado de una búsqueda
     *
     * @type {(IPacienteMatch[] | IPaciente[])}
     */
    @Input()
    get pacientes(): IPacienteMatch[] | IPaciente[] {
        return this._pacientes;
    }
    set pacientes(value: IPacienteMatch[] | IPaciente[]) {
        this._pacientes = value;
        if (value && value.length) {
            // Test if IPacienteMatch
            if ('paciente' in value[0]) {
                this.listado = (value as IPacienteMatch[]).map(i => i.paciente);
            } else {
                this.listado = value as IPaciente[];
            }
        } else {
            this.listado = [];
        }
        // Selecciona el primero
        if (this.autoselect && this.listado && this.listado.length) {
            this.seleccionar(this.listado[0]);
        }
    }

    // Indica si selecciona automáticamente el primer paciente de la lista
    @Input() autoselect = false;

    // Indica si debe aparecer el boton 'editar' en cada resultado
    @Input() editing = false;

    // Evento que se emite cuando se selecciona un paciente (click en la lista)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se presiona el boton 'editar' de un paciente
    @Output() edit: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando el mouse está sobre un paciente
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se scrollea en la lista
    @Output() scrolled: EventEmitter<null> = new EventEmitter<null>();

    constructor(private plex: Plex) {
    }

    public seleccionar(paciente: IPaciente) {
        (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
    }

    public editar(paciente: IPaciente) {
        (paciente.id) ? this.edit.emit(paciente) : this.edit.emit(null);
    }

    public hoverPaciente(paciente: IPaciente) {
        this.hover.emit(paciente);
    }

    public onScroll() {
        this.scrolled.emit();
    }
}
