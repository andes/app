import { IPacienteMatch } from './../interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { PacienteBuscarService } from 'src/app/core/mpi/services/paciente-buscar.service';
import { IPacienteRelacion } from '../interfaces/IPacienteRelacion.inteface';
import { calcularEdad } from '@andes/shared';

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
    public listadoRelaciones: IPacienteRelacion[];
    public desplegado = false;
    public selectedOn = true;
    public coloresItems = {
        impar: {
            border: '#00000000',
            hover: '#00a8e099',
            background: '#00a8e01a'
        },
        par: {
            border: '#00000000',
            hover: '#00a8e099',
            background: '#0027381a'
        }
    };
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

    // Indica si debe aparecer el boton 'relaciones' en cada paciente
    @Input() showRelaciones = true;

    // Evento que se emite cuando se selecciona un paciente (click en la lista)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se presiona el boton 'editar' de un paciente
    @Output() edit: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    // Evento que se emite cuando se presiona el boton 'verRelaciones' de un paciente
    @Output() relaciones: EventEmitter<IPacienteRelacion[]> = new EventEmitter<IPacienteRelacion[]>();

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
        if (this.selectedOn) {
            (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
            this.selectedId = paciente.id;
        } else {
            this.selectedOn = true;
        }
    }

    public editar(paciente: IPaciente) {
        (paciente.id) ? this.edit.emit(paciente) : this.edit.emit(null);
    }

    public openBtnRelaciones(paciente: IPaciente) {
        const igualPaciente = this.pacienteSeleccionado?.id === paciente.id;
        return (this.desplegado && igualPaciente);
    }
    /**
     * Se visualiza el botón para ver las relaciones de un paciente,
     * sólo en aquellas relaciones que son hijo/a, tutelado menores de 11 años y que sean pacientes activos
     * @param paciente un item del listado
     */
    public showBtnRelaciones(paciente: IPaciente) {
        this.listadoRelaciones = [];
        if (this.showRelaciones && paciente.relaciones?.length) {
            const limiteEdad = 11;
            const relaciones = ['progenitor/a', 'tutor'];
            this.listadoRelaciones = paciente.relaciones.filter(rela => {
                const relacionesTutor = rela?.relacion?.opuesto && relaciones.includes(rela.relacion.opuesto);
                const cumpleEdad = rela?.fechaNacimiento && calcularEdad(rela.fechaNacimiento, 'y') < limiteEdad;
                return (relacionesTutor && rela.activo && rela.fechaNacimiento && cumpleEdad);
            });
        }
        return this.listadoRelaciones.length;
    }

    public verRelaciones(paciente: IPaciente) {
        this.selectedOn = false;
        if (this.desplegado) {
            this.desplegado = false;
            this.pacienteSeleccionado = null;
        } else {
            if (paciente.id && paciente.relaciones?.length) {
                this.relaciones.emit(paciente.relaciones);
                this.desplegado = true;
                this.pacienteSeleccionado = paciente;

            } else {
                this.relaciones.emit(null);
            }
        }
    }

    /**
     * retorna true/false al querer mostrar el documento del tutor de un paciente menor  de 5 años
     * @param paciente
     */
    public showDatosTutor(paciente: IPaciente) {
        //  si es un paciente sin documento menor a 5 años mostramos datos de un familiar/tutor
        const edad = 5;
        const rel = paciente.relaciones;
        return !paciente.documento && !paciente.numeroIdentificacion && paciente.edad < edad && rel !== null && rel.length;
    }
    /**
     *
     * @param pos posición en el listado
     * @returns color del item
     */
    public colorItem(pos) {
        return (pos % 2 === 0) ? this.coloresItems.par : this.coloresItems.impar;
    }
}
