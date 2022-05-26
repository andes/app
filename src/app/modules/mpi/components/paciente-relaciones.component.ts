
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../interfaces/IPacienteRelacion.inteface';

@Component({
    selector: 'paciente-relaciones',
    templateUrl: 'paciente-relaciones.html'
})
export class PacienteRelacionesComponent {
    private _relaciones: IPacienteRelacion[] = [];
    pacienteSeleccionado: IPaciente;

    // Propiedades públicas
    public listado: IPacienteRelacion[];
    public colorRelaciones = {
        border: '#686b6b29',
        hover: '#00a8e099',
        background: '##bebfbf1c'

    };

    /**
     * Listado de las relaciones de un pacientes a mostrar. Acepta una lista de relaciones
     *
     * @type { IPacienteRelacion[]}
     */
    @Input()
    set relaciones(value: IPacienteRelacion[]) {
        this._relaciones = value.filter( rel => {
            const existe = rel.hasOwnProperty('activo');
            if (existe) {return rel.activo;} else {return true;}
        });
        if (this._relaciones?.length) {
            this.listado = this._relaciones as IPacienteRelacion[];
        } else {
            this.listado = [];
        }
    }

    // Evento que se emite cuando se selecciona un paciente (click en la listado)
    @Output() selected: EventEmitter<IPacienteRelacion> = new EventEmitter<IPacienteRelacion>();

    constructor(
        private plex: Plex
    ) { }

    public seleccionar(paciente: IPacienteRelacion) {
        (paciente.id) ? this.selected.emit(paciente) : this.selected.emit(null);
    }

    public seleccionarRelacion(relacionado: IPacienteRelacion) {
        const pacienteRelacion: any = relacionado;
        if (relacionado.referencia) {
            pacienteRelacion.id = relacionado.referencia;
            pacienteRelacion.sexo = relacionado.sexo ? relacionado.sexo : 'S/D';
            pacienteRelacion.validado = 'S/D';
        }
        (relacionado.id) ? this.selected.emit(relacionado) : this.selected.emit(null);
    }
}
