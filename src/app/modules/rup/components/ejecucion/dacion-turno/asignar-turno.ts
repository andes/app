import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
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
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';

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
    private prestacionesProfesional;
    public isButtonDisabled = false;

    // Eventos
    @Input() agenda: IAgenda;
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('modalAsignarTurno', { static: true }) modal: PlexModalComponent;

    constructor(
        public serviceTurno: TurnoService,
        public servicioPrestacion: PrestacionesService,
        private plex: Plex,
        private router: Router,
        private obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,
        private serviceAgenda: AgendaService,
        private conceptosTurneablesService: ConceptosTurneablesService,
        private pacienteRestringido: PacienteRestringidoPipe
    ) { }

    ngOnInit() {
        this.inicio = this.agenda.horaInicio;
        this.fin = this.agenda.horaFin;
        this.conceptosTurneablesService.getByPermisos('rup:tipoPrestacion:?').subscribe(data => {
            this.prestacionesProfesional = data.map(concept => concept.id);
            this.getPrestacionesAgendaDinamicas();
        });
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

    esPacienteRestringido(paciente: IPaciente) {
        return this.pacienteRestringido.transform(paciente);
    }

    onPacienteSelected(paciente: IPaciente) {
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        this.pacientes = null;
        if (paciente) {
            if (!this.esPacienteRestringido(paciente)) {
                this.pacienteActivo = paciente;
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
                this.plex.info('warning', 'No tiene permisos para acceder a este paciente.');
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
            numeroIdentificacion: paciente.numeroIdentificacion,
            genero: paciente.genero,
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
            listaPrestaciones = unBloque.tipoPrestaciones.filter((prestacion: any) => this.prestacionesProfesional.includes(prestacion.id));
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

    confirmar() {
        this.isButtonDisabled = true;
        const paciente = this.datosTurno.paciente;
        let fechaTurno;

        const datosConfirma = {
            nota: '',
            motivoConsulta: '',
            tipoPrestacion: this.datosTurno.tipoPrestacion,
            idAgenda: this.agenda.id,
            paciente,
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

    cerrar() {
        this.modal.close();
    }

    getEquipoProfesional() {
        let equipo = '';
        this.agenda?.profesionales?.forEach((profesional) => {
            equipo += `${profesional.nombre} ${profesional.apellido}, `;
        });

        return equipo === '' ? '-' : equipo.slice(0, -2);
    }

    /**
    * Guarda el turno en la agenda y crea la prestación
    */
    guardarDatosTurno() {
        if (this.agenda.dinamica) {
            this.modal.show();
        } else {
            const paciente = this.datosTurno.paciente;

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

            this.guardado = true;
        }
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
