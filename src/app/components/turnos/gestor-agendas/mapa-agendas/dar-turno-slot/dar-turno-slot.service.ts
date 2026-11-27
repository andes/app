import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IServicioIntermedio } from 'src/app/interfaces/IServicioIntermedio';
import { ITipoPrestacion } from 'src/app/interfaces/ITipoPrestacion';
import { IAgenda } from 'src/app/interfaces/turnos/IAgenda';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';
import { AgendaEnSlot, DatosTurnoForm, SlotSeleccionado } from './dar-turno-slot.interface';
import { tieneTurnosDisponibles, turnosEnSlot } from './slot-turnos.util';

const estadoFacturacion = {
    tipo: '',
    estado: 'Sin comprobante',
    numeroComprobante: '',
};

export interface GuardarTurnoDatos {
    idAgenda: string;
    idTurno: string;
    idBloque: string;
    paciente: IPaciente;
    telefono: string;
    financiador?: IObraSocial;
    tipoPrestacion: ITipoPrestacion;
    tipoTurno: 'delDia' | 'programado' | 'gestion';
    datos: DatosTurnoForm;
}

@Injectable({ providedIn: 'root' })
export class DarTurnoSlotService {
    /** Último resultado de {@link reglasPaciente}; lo consume {@link agendasEnSlot}. */
    private condicionLlavePaciente = false;

    constructor(
        private agendaService: AgendaService,
        private turnoService: TurnoService,
        private pacienteService: PacienteService,
        private servicioIntermedioService: ServicioIntermedioService,
        private auth: Auth,
    ) { }

    agendasEnSlot(
        slot: SlotSeleccionado,
        servicioIntermedio: IServicioIntermedio | null,
    ): Observable<AgendaEnSlot[]> {
        const params: Record<string, unknown> = {
            rango: true,
            desde: slot.horaInicio,
            hasta: slot.horaFin,
            organizacion: this.auth.organizacion.id,
            estados: ['publicada', 'disponible'],
            nominalizada: true,
        };
        if (servicioIntermedio?.id) {
            params.servicioIntermedio = servicioIntermedio.id;
        }

        return this.agendaService.get(params).pipe(
            map((agendas) => this.armarAgendasEnSlot(agendas, slot)),
        );
    }

    agendaCompleta(id: string): Observable<IAgenda> {
        return this.agendaService.getById(id);
    }

    reglasPaciente(pacienteId: string, conceptId?: string): Observable<boolean> {
        const regla: { paciente: string; prestacion?: string } = { paciente: pacienteId };
        if (conceptId) {
            regla.prestacion = conceptId;
        }
        return this.turnoService.getRules(regla).pipe(
            map((resp) => (resp?.length > 0) || false),
            tap((condicionLlave) => {
                this.condicionLlavePaciente = condicionLlave;
            }),
        );
    }

    cargarPaciente(id: string): Observable<IPaciente> {
        return this.pacienteService.getById(id);
    }

    serviciosIntermedios(): Observable<IServicioIntermedio[]> {
        return this.servicioIntermedioService.getAll();
    }

    guardarTurno(datos: GuardarTurnoDatos): Observable<IAgenda> {
        const { paciente, telefono, financiador, datos: form } = datos;
        const pacienteSave = {
            id: paciente.id,
            documento: paciente.documento,
            numeroIdentificacion: paciente.numeroIdentificacion,
            apellido: paciente.apellido,
            nombre: paciente.nombre,
            alias: paciente.alias,
            genero: paciente.genero,
            fechaNacimiento: paciente.fechaNacimiento,
            sexo: paciente.sexo,
            telefono,
            carpetaEfectores: paciente.carpetaEfectores,
            obraSocial: financiador ?? form.financiador,
        };

        const procedimiento: ISnomedConcept | undefined = form.procedimiento;

        const payload = {
            idAgenda: datos.idAgenda,
            idTurno: datos.idTurno,
            idBloque: datos.idBloque,
            paciente: pacienteSave,
            tipoPrestacion: datos.tipoPrestacion,
            tipoTurno: datos.tipoTurno,
            nota: form.nota,
            motivoConsulta: form.motivoConsulta,
            procedimiento,
            estadoFacturacion,
            emitidoPor: form.turnoTelefonico ? 'turno telefonico' : null,
            videoConferencia: form.videoConferencia,
            link: form.link,
            ambitoOrigen: form.ambitoOrigen?.id,
        };

        return this.turnoService.save(payload, { showError: false });
    }

    private armarAgendasEnSlot(agendas: IAgenda[], slot: SlotSeleccionado): AgendaEnSlot[] {
        const conTurnos = agendas
            .map((agenda) => {
                const turnos = turnosEnSlot(agenda, slot);
                if (turnos.length === 0 && !tieneTurnosDisponibles(agenda)) {
                    return null;
                }
                let condicionLlave = false;
                if (agenda.turnosRestantesGestion > 0) {
                    condicionLlave = this.condicionLlavePaciente;
                }
                return {
                    agenda,
                    turnos,
                    condicionLlave,
                } as AgendaEnSlot;
            })
            .filter((item): item is AgendaEnSlot => item !== null);

        return conTurnos.sort((a, b) => {
            const inia = moment(a.agenda.horaInicio);
            const inib = moment(b.agenda.horaInicio);
            const ordenDia =
                inia.isSame(inib, 'day') ? null : (inia.isBefore(inib, 'day') ? -1 : 1);
            return (ordenDia ?? b.turnos.length - a.turnos.length);
        });
    }
}
