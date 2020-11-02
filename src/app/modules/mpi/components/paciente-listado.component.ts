import { IPacienteMatch } from './../interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { PacienteBuscarService } from 'src/app/core/mpi/services/paciente-buscar.service';

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
    }

    /**
     * Indica la altura del listado respecto a su contenedor
     */

    @Input() height: string | number = 80;

    /**
     * Cantidad de pixeles a reducir de la pantalla completa.
     */
    @Input() set offset(value: number) {
        if (value) {
            this.height = `calc(100% - ${value}px)`;
        }
    }

    // Indica si debe aparecer el boton 'editar' en cada resultado
    @Input() editing = false;

    // Evento que se emite cuando se selecciona un paciente (click en la lista)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se presiona el boton 'editar' de un paciente
    @Output() edit: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    constructor(
        private plex: Plex,
        private pacienteBuscar: PacienteBuscarService) { }

    onScroll() {
        this.pacienteBuscar.findByText().subscribe((resultado: any) => {
            if (resultado) {
                this.listado = this.listado.concat(resultado.pacientes);
            }
        });
    }

    public seleccionar(paciente: IPaciente) {
        (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
    }

    public editar(paciente: IPaciente) {
        (paciente.id) ? this.edit.emit(paciente) : this.edit.emit(null);
    }

    /**
     * retorna true/false al querer mostrar el documento del tutor de un paciente menor  de 5 años
     * @param paciente
     */
    public showDatosTutor(paciente: IPaciente) {
        //  si es un paciente sin documento menor a 5 años mostramos datos de un familiar/tutor
        const edad = 5;
        const rel = paciente.relaciones;
        return !paciente.documento && !paciente.numeroIdentificacion && paciente.edad < edad && rel !== null && rel.length > 0;
    }
}
