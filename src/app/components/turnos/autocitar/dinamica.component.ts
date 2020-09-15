import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { TurnoService } from '../../../services/turnos/turno.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { IObraSocial } from '../../../interfaces/IObraSocial';

@Component({
    selector: 'dinamica',
    templateUrl: 'dinamica.html'
})
export class DinamicaFormComponent implements OnInit {
    public pacienteActivo: IPaciente;
    public turnoTipoPrestacion: any;
    public datosTurno: any = {};
    public prestaciones = [];
    public obraSocialPaciente: IObraSocial;

    // Eventos
    @Input() agenda: IAgenda;
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex,
        private router: Router,
        public serviceTurno: TurnoService,
        public servicioPrestacion: PrestacionesService,
        private obraSocialService: ObraSocialService) {
    }

    ngOnInit() {
        this.getPrestacionesAgendaDinamicas();
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        }
    }

    searchClear() {
        this.pacienteActivo = null;
    }

    onPacienteSelected(paciente: IPaciente) {
        this.pacienteActivo = paciente;
        if (paciente) {
            this.obraSocialPaciente = null;
            if (paciente.id && paciente.documento) {
                this.obraSocialService.getObrasSociales(paciente.documento).subscribe(
                    (resultado: IObraSocial[]) => {
                        if (resultado.length > 0) {
                            this.obraSocialPaciente = resultado[0];
                        }
                        this.setPacienteTurno(paciente);
                    },
                    () => {
                        this.setPacienteTurno(paciente);
                    });
            } else {
                this.setPacienteTurno(paciente);
            }

        } else {
            this.plex.info('warning', 'El paciente debe ser registrado en MPI');
        }
    }

    private setPacienteTurno(paciente: IPaciente) {
        let pacienteSave = {
            id: paciente.id,
            documento: paciente.documento,
            apellido: paciente.apellido,
            nombre: paciente.nombre,
            alias: paciente.alias,
            fechaNacimiento: paciente.fechaNacimiento,
            sexo: paciente.sexo,
            obraSocial: this.obraSocialPaciente
        };
        this.datosTurno.paciente = pacienteSave;
    }

    cancelar($event) {
        this.searchClear();
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
                this.searchClear();
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
