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
    _pacientes: IPacienteMatch[] | IPaciente[];
    seleccionado: IPaciente; // revisar si no debería ser también  IPacienteMatch[] | IPaciente[] !!!!!!!!!!!!!!!!!!!!!!!
    // posicion: number;
    listado: IPaciente[]; // Contiene un listado plano de pacientes
    itemsDropdown = [
        { label: '', handler: () => { this.vincular(this.seleccionado); } },
        { label: '', handler: () => { this.setActivo(this.seleccionado); } },
    ];

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

    // Indica si selecciona automáticamente el primer paciente de la lista
    @Input() autoselect = false;
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() toLink: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() actived: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() linked: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    constructor(private plex: Plex) { }

    public setDropDown(paciente: IPaciente) {
        if (paciente.id) {
            if (paciente.activo) {
                this.itemsDropdown[0].label = 'VINCULAR';
                this.itemsDropdown[1].label = 'INACTIVAR';
            } else {
                this.itemsDropdown[0].label = 'DESVINCULAR';
                this.itemsDropdown[1].label = 'ACTIVAR';
            }
        }
    }

    public seleccionar(paciente: IPaciente) {
        (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
    }

    // Cambia estado activo/inactivo
    public setActivo(paciente: IPaciente) {
        (paciente.id) ? this.actived.emit(paciente) : this.actived.emit(null);
    }

    public vincular(paciente: IPaciente) {
        (paciente.id) ? this.toLink.emit(paciente) : this.toLink.emit(null);
    }

    public verVinculados(paciente: IPaciente) {
        (paciente.id) ? this.linked.emit(paciente) : this.linked.emit(null);
    }

    public hoverPaciente(paciente: IPaciente) {
        this.hover.emit(paciente);
    }
}
