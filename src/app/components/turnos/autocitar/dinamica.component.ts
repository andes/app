import { IPrestacion } from './../../../modules/rup/interfaces/prestacion.interface';

import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../interfaces/IPaciente';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { TurnoService } from '../../../services/turnos/turno.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';

@Component({
    selector: 'dinamica',
    templateUrl: 'dinamica.html'
})
export class DinamicaFormComponent implements OnInit {
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    public turnoTipoPrestacion: any;
    public datosTurno: any = {};
    public prestaciones = [];

    // Eventos
    @Input() agenda: IAgenda;
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex,
        private router: Router,
        public serviceTurno: TurnoService,
        public servicioPrestacion: PrestacionesService) {
    }

    ngOnInit() {
        this.getPrestacionesAgendaDinamicas();
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
            this.plex.info('warning', 'El paciente debe ser registrado en MPI');
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
    getPrestacionesAgendaDinamicas() {
        let listaPrestaciones = [];
        this.agenda.bloques.forEach(unBloque => {
            listaPrestaciones = listaPrestaciones.concat(unBloque.tipoPrestaciones);
        });
        this.prestaciones = listaPrestaciones.filter((elem, pos, arr) => {
            return arr.indexOf(elem) === pos;
        });
        if (this.prestaciones.length === 1) {
            this.turnoTipoPrestacion = this.prestaciones[0];
        }
    }

    /**
     * Obtiene los datos del formulario y llama a guardar el turno
     *
     * @param {any} $event formulario a validar
     */
    guardar($event: any) {
        if ($event.formValid) {
            if (this.pacienteActivo) {
                this.datosTurno.tipoPrestacion = this.turnoTipoPrestacion;
                this.guardarDatosTurno();
            } else {
                this.plex.info('warning', 'Debe seleccionar un paciente');
            }
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }


    /**
    * Guarda el turno en la agenda y crea la prestación
    */
    guardarDatosTurno() {
        const paciente = this.datosTurno.paciente;
        if (this.agenda.dinamica) {
            this.plex.confirm('Paciente: <b>' + paciente.apellido + ', ' + paciente.nombre +
                '.</b><br>Prestación: <b>' + this.datosTurno.tipoPrestacion.term + '</b>', '¿Está seguro de que desea agregar el paciente a la agenda?').then(confirmacion => {
                    if (confirmacion) {
                        let datosConfirma = {
                            nota: '',
                            motivoConsulta: '',
                            tipoPrestacion: this.datosTurno.tipoPrestacion,
                            paciente: paciente,
                            idAgenda: this.agenda.id
                        };
                        // guardamos el turno
                        this.serviceTurno.saveDinamica(datosConfirma).subscribe(
                            agendaResultado => {
                                // TODO::revisar si podemos obtener directamente desde la api el turno agregado
                                const turnos = agendaResultado.bloques[0].turnos;
                                const turnoDado = turnos[turnos.length - 1];
                                // creamos la prestación
                                this.servicioPrestacion.crearPrestacion(paciente, this.datosTurno.tipoPrestacion, 'ejecucion', new Date(), turnoDado.id).subscribe(prestacion => {
                                    this.router.navigate(['rup/ejecucion/', prestacion.id]);
                                }, (err) => {
                                    this.plex.info('danger', 'No fue posible crear la prestación');
                                });
                            },
                            error => {

                            });
                    }

                });
        }
    }

}
