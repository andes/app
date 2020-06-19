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
    private _pacientes: IPacienteMatch[] | IPaciente[];
    private seleccionado: IPaciente; // revisar si no debería ser también  IPacienteMatch[] | IPaciente[] !!!!!!!!!!!!!!!!!!!!!!!
    private posicion: number;
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
    /**
     * Indica si selecciona automáticamente el primer paciente de la lista
     *
     */
    @Input() autoselect = false;

    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<IPaciente>}
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    /**
     * Evento que se emite cuando se hace click en el boton vicular
     *
     * @type {EventEmitter<IPaciente>}
     */
    @Output() linked: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    /**
     * Evento que se emite cuando se hace click en el boton inactivar/activar paciente
     *
     * @type {EventEmitter[IPaciente, number]}
     */
    @Output() actived: EventEmitter<[IPaciente, number]> = new EventEmitter<[IPaciente, number]>();
    /**
     * Evento que se emite cuando el mouse está sobre un paciente
     *
     * @type {EventEmitter<any>}
     * @memberof PacienteListadoComponent
     */
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    itemsDropdown: any[];
    constructor(private plex: Plex) {
        this.itemsDropdown = [
            { label: 'VINCULAR', handler: () => { this.vincular(this.seleccionado); } },
            { divider: true },
            { label: 'ACTIVAR', handler: () => { this.changeActived(this.seleccionado); } },

        ];
        this.posicion = -1;
    }

    public getPacienteDropDown(paciente: IPaciente, pos: number) {
        if (paciente) {
            this.seleccionado = paciente;
            this.posicion = pos;
            const anItem = this.itemsDropdown.find(item =>
                (item.label === 'ACTIVAR' || item.label === 'INACTIVAR')
            );
            anItem.label = (paciente.activo) ? 'INACTIVAR' : 'ACTIVAR';
        } else { this.posicion = -1; }
        console.log(this.itemsDropdown);
    }
    public seleccionar(paciente: IPaciente) {
        console.log('seleccionar paciente');
        if (this.seleccionado !== paciente) {
            this.seleccionado = paciente;
            this.selected.emit(this.seleccionado);
        } else {
            this.seleccionado = null;
            this.selected.emit(null);
        }
    }
    public changeActived(paciente: IPaciente) {
        console.log('changeActived', paciente);
        if (this.seleccionado !== paciente) {
            this.seleccionado = paciente;
            this.actived.emit([this.seleccionado, this.posicion]);
        } else {
            this.seleccionado = null;
            this.actived.emit([null, this.posicion]);
        }
    }
    public vincular(paciente: IPaciente) {
        console.log('vincular', paciente);
        if (this.seleccionado !== paciente) {
            this.seleccionado = paciente;
            this.linked.emit(this.seleccionado);
        } else {
            this.seleccionado = null;
            this.linked.emit(null);
        }
    }

    public hoverPaciente(paciente: IPaciente) {
        this.hover.emit(paciente);
    }
}
