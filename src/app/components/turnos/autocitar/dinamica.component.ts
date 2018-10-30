import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../interfaces/IPaciente';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';

@Component({
    selector: 'dinamica',
    templateUrl: 'dinamica.html'
})
export class DinamicaFormComponent implements OnInit {
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    public turnoTipoPrestacion: any;
    public datosTurno: any = {};

    // Eventos
    @Input() prestaciones: any[];
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex) {
    }

    ngOnInit() {
        if (this.prestaciones.length === 1) {
            this.turnoTipoPrestacion = this.prestaciones[0];
        }
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    searchClear() {
        this.pacientes = null;
        this.pacienteActivo = null;
    }

    onPacienteSelected(paciente: IPaciente) {
        this.pacienteActivo = paciente;
        this.pacientes = null;
        if (paciente.id) {
            let pacienteSave = {
                id: paciente.id,
                documento: paciente.documento,
                apellido: paciente.apellido,
                nombre: paciente.nombre,
                alias: paciente.alias,
                fechaNacimiento: paciente.fechaNacimiento,
                sexo: paciente.sexo
            };
            this.datosTurno.paciente = pacienteSave;
            // this.darTurno(pacienteSave);
        } else {
            this.plex.alert('El paciente debe ser registrado en MPI');
        }
    }

    cancelar($event) {
        this.cancel.emit();
    }

    /**
     * Guarda los datos del formulario y emite el dato guardado
     *
     * @param {any} $event formulario a validar
     */
    guardar($event: any) {
        if ($event.formValid) {
            if (this.pacienteActivo) {
                this.datosTurno.tipoPrestacion = this.turnoTipoPrestacion;
                this.save.emit(this.datosTurno);
            } else {
                this.plex.info('warning', 'Debe seleccionar un paciente');
            }
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }
}
