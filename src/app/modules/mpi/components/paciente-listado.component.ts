import { IPacienteMatch } from './../interfaces/IPacienteMatch.inteface';
import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'paciente-listado',
    templateUrl: 'paciente-listado.html',
    styleUrls: ['paciente-listado.scss']
})
export class PacienteListadoComponent {
    private _pacientes: IPacienteMatch[] | IPaciente[];
    private seleccionado: IPacienteMatch | IPaciente;

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
    /**
     * Indica si selecciona automáticamente el primer paciente de la lista
     *
     */
    @Input() autoselect = false;
    /**
    * Indica como se muestra la tabla de resultados
    *
    */
    @Input() type: 'default' | 'sm' = 'default';
    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<IPaciente>}
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    /**
     * Evento que se emite cuando el mouse está sobre un paciente
     *
     * @type {EventEmitter<any>}
     * @memberof PacienteListadoComponent
     */
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();


    constructor(private plex: Plex) {
    }

    public seleccionar(paciente: IPaciente) {
        if (this.seleccionado !== paciente) {
            this.seleccionado = paciente;
            this.selected.emit(this.seleccionado);
        } else {
            this.seleccionado = null;
            this.selected.emit(null);
        }
    }

    public hoverPaciente(paciente: IPaciente) {
        this.hover.emit(paciente);
    }
}
