import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../interfaces/IPacienteRelacion.inteface';
import { PacienteService } from '../../../core/mpi/services/paciente.service';

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
        this._relaciones = value?.filter(rel => {
            return (rel.hasOwnProperty('activo')) ? rel.activo : true;
        });
        if (this._relaciones?.length) {
            this.listado = this._relaciones as IPacienteRelacion[];
        } else {
            this.listado = [];
        }
    }

    // Evento que se emite cuando se selecciona un paciente (click en la listado)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    constructor(
        private plex: Plex,
        private pacienteService: PacienteService
    ) { }

    public seleccionarRelacion(relacionado: IPacienteRelacion) {
        if (relacionado.referencia) {
            let pacienteRel: IPaciente;
            this.pacienteService.getById(relacionado.referencia).subscribe(result => {
                pacienteRel = result;
                (pacienteRel) ? this.selected.emit(pacienteRel) : this.selected.emit(null);
            });
        }
    }
}
