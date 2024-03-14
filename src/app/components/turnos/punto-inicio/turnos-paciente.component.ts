import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { DocumentosService } from '../../../services/documentos.service';
import { FacturacionAutomaticaService } from './../../../services/facturacionAutomatica.service';

// Servicios
import { ObraSocialService } from '../../../services/obraSocial.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { TurnoService } from '../../../services/turnos/turno.service';

import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import { ITurno } from '../../../interfaces/turnos/ITurno';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
@Component({
    selector: 'turnos-paciente',
    templateUrl: 'turnos-paciente.html',
    styleUrls: ['turnos-paciente.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})

export class TurnosPacienteComponent implements OnInit {
    cambioMotivo: boolean;
    turnoArancelamiento: any;
    showMotivoConsulta = false;
    puedeRegistrarAsistencia: boolean;
    puedeLiberarTurno: boolean;
    agenda: IAgenda;
    showLiberarTurno: boolean;
    todaysdate: Date;
    _turnos: any;
    _operacion: string;
    turnosPaciente: any;
    turnosSeleccionados: ITurno[] = [];
    public financiador = {
        codigoPuco: null,
        nombre: '',
        financiador: '',
        prepaga: false
    };
    public _paciente: IPaciente;
    @Input('operacion')
    set operacion(value: string) {
        this._operacion = value;
    }

    get operacion(): string {
        return this._operacion;
    }
    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
    }
    get paciente(): any {
        return this._paciente;
    }

    @Input('turnos')
    set turnos(value: any) {
        if (value) {
            this._turnos = value;
            this.turnosPaciente = value;
            this.turnosPaciente.obraSocial = ((this._paciente.financiador) && (this._paciente.financiador.length > 0) && (this._paciente.financiador[0])) ? this._paciente.financiador[0].nombre : null;
        }
    }
    get turnos(): any {
        return this._turnos;
    }
    @Output() turnosPacienteChanged = new EventEmitter<any>();

    // Inicialización
    constructor(
        public servicioFA: FacturacionAutomaticaService,
        public obraSocialService: ObraSocialService,
        public documentosService: DocumentosService,
        public serviceTurno: TurnoService,
        public serviceAgenda: AgendaService,
        public plex: Plex,
        public auth: Auth) { }

    ngOnInit() {
        this.puedeRegistrarAsistencia = this.auth.check('turnos:turnos:registrarAsistencia');
        this.puedeLiberarTurno = this.auth.check('turnos:turnos:liberarTurno');
        this.todaysdate = new Date();
        this.todaysdate.setHours(0, 0, 0, 0);
    }

    setFinanciador(financiador) {
        this.financiador = financiador;
    }

    cambiarMotivo() {
        this.cambioMotivo = true;
    }

    showPanel() {
        this.showMotivoConsulta = false;
        this.showLiberarTurno = false;
    }

    showArancelamiento(turno) {
        if (!this.financiador) {
            this.plex.toast('danger', 'Seleccione una obra social o prepaga', '¡Atención!');
            return;
        }

        this.turnoArancelamiento = turno;
        this.showMotivoConsulta = true;
    }

    async printArancelamiento(turno) {
        const data = {};
        if (this.cambioMotivo) {
            data['motivoConsulta'] = turno.motivoConsulta;
        }

        const obraSocialUpdate = this.financiador ? this._paciente.financiador.find(os => os.nombre === this.financiador.nombre) : null;
        turno.paciente.obraSocial = (obraSocialUpdate) ? obraSocialUpdate : this.financiador;

        data['actualizaObraSocial'] = turno.paciente.obraSocial;
        data['turno'] = turno;
        const bloqueId = (turno.bloque_id) ? turno.bloque_id : -1;

        this.serviceTurno.patch(turno.agenda_id, bloqueId, turno.id, data).subscribe(() => {
            this.documentosService.descargarArancelamiento({ turnoId: turno.id }, 'recupero').subscribe();
        });
    }

    eventosTurno(turno, operacion) {
        const patch: any = {
            op: operacion,
            turnos: [turno._id],
        };
        this.serviceTurno.get({ id: turno.id }).pipe(
            switchMap(t => {
                if (t.some(turno => turno.bloques.some(bloque => bloque.turnos.some(turno => turno.paciente && turno.estado !== 'suspendido')))) {
                    return this.serviceAgenda.patch(turno.agenda_id, patch);
                } else {
                    return this.serviceAgenda.getById(turno.agenda_id).pipe(
                        switchMap(ag => {
                            if (ag.sobreturnos.some(st => turno.id === st.id && st.estado !== 'suspendido' && st.paciente)) {
                                return this.serviceAgenda.patch(turno.agenda_id, patch);
                            } else {
                                if (ag.sobreturnos.some(st => st.estado === 'suspendido')) {
                                    this.plex.info('warning', 'El sobreturno se encuentra suspendido', 'Acción denegada');
                                } else if (t.some(turno => turno.bloques.some(bloque => bloque.turnos.some(turno => turno.estado === 'suspendido')))) {
                                    this.plex.info('warning', 'El turno se encuentra suspendido', 'Acción denegada');
                                } else {
                                    const mensaje = turno.bloque_id ? 'El turno no presenta un paciente registrado' : 'El sobreturno no presenta un paciente registrado';
                                    this.plex.info('warning', mensaje, 'Acción denegada');
                                }
                                return EMPTY;
                            }
                        })
                    );
                }
            })
        ).subscribe(() => {
            this.turnosPacienteChanged.emit();
            let mensaje = '';
            switch (operacion) {
                case 'darAsistencia':
                    mensaje = 'Se registró la asistencia del paciente';
                    break;
                case 'sacarAsistencia':
                    mensaje = 'Se registró la inasistencia del paciente';
                    break;
            }
            if (mensaje !== '') {
                this.plex.toast('success', mensaje);
            }
        });
    }

    liberarTurno(turno) {
        this.turnosSeleccionados = [turno];
        this.serviceAgenda.getById(turno.agenda_id).subscribe(resultado => {
            this.agenda = resultado; // obtiene la agenda para enviarla al componente liberar-turno
            this.showLiberarTurno = true;
        });
    }

    afterLiberarTurno() {
        this.showLiberarTurno = false;
        this.turnosPacienteChanged.emit();
    }

    isToday(turno) {
        return (moment(turno.horaInicio)).isSame(new Date(), 'day');
    }


}

