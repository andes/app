import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPacienteMatch } from '../../../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { IAgenda } from '../../../../../interfaces/turnos/IAgenda';
import { PacienteBuscarResultado } from '../../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';
import { ObraSocialService } from '../../../../../services/obraSocial.service';
import { IObraSocial } from '../../../../../interfaces/IObraSocial';
import { map, tap, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'rup-asignar-turno',
    templateUrl: 'asignar-turno.html'
})
export class RupAsignarTurnoComponent implements OnInit {
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    public turnoTipoPrestacion: any;
    public datosTurno: any = {};
    public prestaciones = [];
    public obraSocialPaciente: IObraSocial;
    public horaTurno = null;
    public hoy = new Date();
    public inicio: Date;
    public fin: Date;
    public guardado = false;

    // Eventos
    @Input() agenda: IAgenda;
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public auth: Auth,
        private router: Router,
        public serviceTurno: TurnoService,
        public servicioPrestacion: PrestacionesService,
        private plex: Plex,
        private obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,
        private serviceAgenda: AgendaService
    ) { }

    ngOnInit() {
        this.getPrestacionesAgendaDinamicas();
        this.inicio = this.agenda.horaInicio;
        this.fin = this.agenda.horaFin;
    }

    searchStart() {
        this.searchClear();
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
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        this.pacienteActivo = paciente;
        this.pacientes = null;
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
        const pacienteSave = {
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

        const prestacionesProfesional = this.auth.getPermissions('rup:tipoPrestacion:?');

        this.agenda.bloques.forEach(unBloque => {
            listaPrestaciones = unBloque.tipoPrestaciones.filter((prestacion: any) => prestacionesProfesional.includes(prestacion.id));
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
            if (this.datosTurno.paciente) {
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
            this.plex.confirm('Paciente: <b>' + paciente.apellido + ', ' + paciente.nombre + '.</b><br>Prestación: <b>' + this.datosTurno.tipoPrestacion.term + '</b>', '¿Está seguro de que desea agregar el paciente a la agenda?').then(confirmacion => {
                let fechaTurno;
                if (confirmacion) {
                    const datosConfirma = {
                        nota: '',
                        motivoConsulta: '',
                        tipoPrestacion: this.datosTurno.tipoPrestacion,
                        paciente: paciente,
                        idAgenda: this.agenda.id
                    };
                    // guardamos el turno
                    this.serviceTurno.saveDinamica(datosConfirma).pipe(
                        map(turnoDado => {
                            fechaTurno = turnoDado.horaInicio;
                            return turnoDado?.paciente?.id === paciente.id ? turnoDado.id : null;
                        }), switchMap(idturnoDado => {
                            if (idturnoDado) {
                                return this.servicioPrestacion.crearPrestacion(paciente, this.datosTurno.tipoPrestacion, 'ejecucion', this.servicioPrestacion.getFechaPrestacionTurnoDinamico(fechaTurno), idturnoDado).pipe(tap(prestacion => {
                                    this.router.navigate(['rup/ejecucion/', prestacion.id]);
                                })
                                );
                            } else {
                                this.plex.info('danger', 'No fue posible crear la prestación');
                                return EMPTY;
                            }
                        })
                    ).subscribe();
                }

            });
        } else {
            if (!this.horaTurno) {
                return this.plex.info('warning', 'Debe seleccionar hora del sobreturno');
            }

            const patch = {
                'op': 'agregarSobreturno',
                'sobreturno': {
                    horaInicio: this.combinarFechas(this.agenda.horaInicio, this.horaTurno),
                    estado: 'asignado',
                    tipoPrestacion: this.turnoTipoPrestacion,
                    paciente: this.pacienteActivo,
                }
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(agenda => {
                const sobreTurno = agenda.sobreturnos[agenda.sobreturnos.length - 1];
                if (sobreTurno) {
                    this.servicioPrestacion.crearPrestacion(paciente, sobreTurno.tipoPrestacion, 'ejecucion', sobreTurno.horaInicio, sobreTurno.id).subscribe(
                        prestacion => {
                            this.router.navigate(['rup/ejecucion/', prestacion.id]);
                        }
                    );
                } else {
                    this.plex.info('danger', 'No fue posible crear la prestación');
                }
            });
        }
        this.guardado = true;
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            const auxiliar = new Date(fecha1);
            const horas = fecha2.getHours();
            const minutes = fecha2.getMinutes();
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

}
