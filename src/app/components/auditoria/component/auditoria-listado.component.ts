import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';


@Component({
    selector: 'auditoria-listado',
    templateUrl: 'auditoria-listado.html',
    styleUrls: ['auditoria-listado.scss']
})
export class ListadoAuditoriaComponent {

    // Indica si selecciona automáticamente el primer paciente de la lista
    @Input() autoselect = false;
    // Evento que se emite al seleccionar un paciente de la lista
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    // Evento que se emite al intentar vincular un paciente de la lista
    @Output() setLink: EventEmitter<[IPaciente, boolean]> = new EventEmitter<[IPaciente, boolean]>();
    // Evento que se emite al activar/inactivar un paciente de la lista
    @Output() setActive: EventEmitter<[IPaciente, boolean]> = new EventEmitter<[IPaciente, boolean]>();
    // Evento que se emite al intentar visualizar los vinculados de un paciente de la lista
    @Output() linked: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    // Evento que se emite cuando se scrollea en la lista
    @Output() scrolled: EventEmitter<null> = new EventEmitter<null>();

    _pacientes: IPacienteMatch[] | IPaciente[];
    seleccionado: IPaciente;
    listado: IPaciente[]; // Contiene un listado plano de pacientes
    itemsDropdown: any = [];  // Acciones del dropdown 'vincular

    @Input()
    get pacientes(): IPacienteMatch[] | IPaciente[] {
        return this._pacientes;
    }
    set pacientes(value: IPacienteMatch[] | IPaciente[]) {
        this._pacientes = value;
        if (value && value.length) {
            // Verifica si es IPacienteMatch
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

    constructor(private plex: Plex) { }

    getCantidadVinculados(paciente: IPaciente) {
        let vinculaciones = [];
        if (paciente.identificadores && paciente.identificadores.length) {
            vinculaciones = paciente.identificadores.filter((item: any) => item.entidad === 'ANDES');
        }
        return vinculaciones.length;
    }

    setDropDown(paciente: IPaciente) {
        if (paciente.id) {
            this.seleccionado = paciente;
            this.itemsDropdown = [];

            if (paciente.activo) {
                this.itemsDropdown[0] = { label: 'VINCULAR', handler: () => { this.setVinculacion(this.seleccionado, true); } };
                this.itemsDropdown[1] = { label: 'INACTIVAR', handler: () => { this.setActivo(this.seleccionado, false); } };
            } else {
                this.itemsDropdown[0] = { label: 'ACTIVAR', handler: () => { this.setActivo(this.seleccionado, true); } };
            }
        }
    }

    seleccionar(paciente: IPaciente) {
        if (this.seleccionado && this.seleccionado.id === paciente.id) {
            this.seleccionado = null;
        } else {
            this.seleccionado = paciente;
            (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
        }
    }

    // Cambia estado activo/inactivo
    setActivo(paciente: IPaciente, activo: boolean) {
        (paciente.id) ? this.setActive.emit([paciente, activo]) : this.setActive.emit(null);
    }

    // (Des)Vincula paciente entrante del seleccionado
    setVinculacion(paciente: IPaciente, vincular: boolean) {
        (paciente.id) ? this.setLink.emit([paciente, vincular]) : this.setLink.emit(null);
    }

    verVinculados(paciente: IPaciente) {
        this.seleccionado = paciente;
        (paciente.id) ? this.linked.emit(paciente) : this.linked.emit(null);
    }

    hoverPaciente(paciente: IPaciente) {
        this.hover.emit(paciente);
    }

    public onScroll() {
        this.scrolled.emit();
    }
}
