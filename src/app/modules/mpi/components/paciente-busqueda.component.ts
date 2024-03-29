import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { IPacienteRelacion } from '../interfaces/IPacienteRelacion.inteface';

@Component({
    selector: 'paciente-busqueda',
    templateUrl: 'paciente-busqueda.html',
    styleUrls: []
})

export class PacienteBusquedaComponent {

    public resultados = [];
    public loading = false;
    public searchAreaCleared = true;
    public relaciones: IPacienteRelacion[];
    // Buscador
    @Input() hostComponent = '';
    @Input() create = false;
    /* returnScannedPatient en true retorna un objeto con los datos del paciente escaneado en caso de
        que este no estuviera registrado */
    @Input() returnScannedPatient = false;

    @Output() searchStart: EventEmitter<null> = new EventEmitter<null>();
    @Output() searchEnd: EventEmitter<PacienteBuscarResultado> = new EventEmitter<PacienteBuscarResultado>();
    @Output() searchClear: EventEmitter<null> = new EventEmitter<null>();

    // Listado
    @Input() pacientes;
    // Indica si debe aparecer el boton 'editar' en cada resultado
    @Input() editing = false;
    // Evento que se emite cuando se selecciona un paciente (click en la lista)
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    // Evento que se emite cuando se presiona el boton 'editar' de un paciente
    @Output() edit: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    @Input() height: string;

    @Input() offset: string;

    public onSearchStart() {
        this.loading = true;
        this.searchStart.emit();
    }

    public onSearchEnd(data: PacienteBuscarResultado) {
        this.loading = false;
        this.resultados = data.pacientes;
        this.searchEnd.emit(data);
        this.searchAreaCleared = false;
    }

    public onSearchClear() {
        this.loading = false;
        this.resultados = null;
        this.searchAreaCleared = true;
        this.searchClear.emit();
    }

    public onSelected(data: IPaciente) {
        this.selected.emit(data);
    }

    public onEdit(data: IPaciente) {
        this.edit.emit(data);
    }

    public onRelaciones(data: IPacienteRelacion[]) {
        if (data) {
            this.relaciones = data;
        }
    }
}
