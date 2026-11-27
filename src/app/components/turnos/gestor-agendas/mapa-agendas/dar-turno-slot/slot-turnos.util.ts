import moment from 'moment';
import { IAgenda } from '../../../../../interfaces/turnos/IAgenda';
import { IBloque } from '../../../../../interfaces/turnos/IBloque';
import { ITurno } from '../../../../../interfaces/turnos/ITurno';
import { AgendaEnSlot, SlotSeleccionado, TurnoEnSlot } from './dar-turno-slot.interface';

export function duracionMinutosTurno(bloque: IBloque): number {
    if (!bloque?.duracionTurno) {
        return 0;
    }
    if (bloque.citarPorBloque) {
        return bloque.duracionTurno * (bloque.cantidadBloque || 1);
    }
    return bloque.duracionTurno;
}

export interface RangoTurno {
    inicio: Date;
    fin: Date;
}

export function rangoTurno(turno: ITurno, bloque: IBloque): RangoTurno | null {
    if (!turno?.horaInicio) {
        return null;
    }
    const inicio = moment(turno.horaInicio).toDate();
    const fin = moment(turno.horaInicio).add(duracionMinutosTurno(bloque), 'minutes').toDate();
    return { inicio, fin };
}

export function turnoIntersecaSlot(turno: ITurno, bloque: IBloque, slot: SlotSeleccionado): boolean {
    const rango = rangoTurno(turno, bloque);
    if (!rango) {
        return false;
    }
    const turnoInicio = moment(rango.inicio);
    const turnoFin = moment(rango.fin);
    const slotInicio = moment(slot.horaInicio);
    const slotFin = moment(slot.horaFin);
    return turnoInicio.isBefore(slotFin) && turnoFin.isAfter(slotInicio);
}

/** Al menos un turno nominalizado libre en la agenda (cualquier horario). */
export function tieneTurnosDisponibles(agenda: IAgenda): boolean {
    return agenda?.bloques?.some((bloque) =>
        bloque.turnos?.some((turno) => turno.estado === 'disponible'),
    ) ?? false;
}

function idTipoPrestacion(p: { id?: string; _id?: string }): string | undefined {
    return p?.id ?? p?._id;
}

export function turnosEnSlot(agenda: IAgenda, slot: SlotSeleccionado): TurnoEnSlot[] {
    const resultado: TurnoEnSlot[] = [];
    if (!agenda?.bloques) {
        return resultado;
    }
    agenda.bloques.forEach((bloque, indiceBloque) => {
        if (!bloque?.turnos) {
            return;
        }
        bloque.turnos.forEach((turno, indiceTurno) => {
            if (turno.estado !== 'disponible') {
                return;
            }
            if (!turnoIntersecaSlot(turno, bloque, slot)) {
                return;
            }
            const rango = rangoTurno(turno, bloque);
            if (!rango) {
                return;
            }
            resultado.push({
                bloque,
                indiceBloque,
                turno,
                indiceTurno,
                horaInicio: rango.inicio,
                horaFin: rango.fin,
            });
        });
    });
    return resultado;
}

export interface ContadoresBloque {
    delDia: number;
    programado: number;
    gestion: number;
    profesional: number;
}

export function contadoresBloque(bloque: IBloque, esHoy: boolean): ContadoresBloque {
    const contieneAccesoDirecto =
        bloque.accesoDirectoDelDia > 0 || bloque.accesoDirectoProgramado > 0;
    const accesoDirectoHoy = esHoy && contieneAccesoDirecto;
    return {
        delDia: accesoDirectoHoy
            ? (bloque.restantesDelDia as number) + (bloque.restantesProgramados as number)
            : bloque.restantesDelDia,
        programado: accesoDirectoHoy ? 0 : bloque.restantesProgramados,
        gestion: accesoDirectoHoy ? 0 : bloque.restantesGestion,
        profesional: accesoDirectoHoy ? 0 : bloque.restantesProfesional,
    };
}

export function contieneExclusivoGestion(agenda: IAgenda): boolean {
    return agenda.bloques.some(
        (bloque) =>
            bloque.reservadoGestion > 0 &&
            bloque.accesoDirectoDelDia === 0 &&
            bloque.accesoDirectoProgramado === 0
    );
}

/** Filtra agendas del paso 2 según turnos:darTurnos:prestacion:? (misma regla que dar-turnos en bloques). */
export function filtrarAgendasPorPermiso(
    agendas: AgendaEnSlot[],
    permisosPrestacion?: string[],
): AgendaEnSlot[] {
    if (!permisosPrestacion?.length || permisosPrestacion[0] === '*') {
        return agendas;
    }
    return agendas.filter((item) =>
        item.agenda.bloques?.some((bloque) =>
            bloque.tipoPrestaciones?.some((p) => {
                const id = idTipoPrestacion(p);
                return id && permisosPrestacion.includes(id);
            }),
        ),
    );
}

/**
 * Copia de {@link dar-turnos.component.ts} filtrarBloques (sin solicitud, autocitado ni tipoPrestacion de opciones).
 */
export function filtrarBloques(
    agenda: IAgenda,
    esAgendaDeHoy: boolean,
    tipoTurno: 'delDia' | 'programado' | 'gestion',
    condicionLlave: boolean,
    permisosPrestacion?: string[],
): IBloque[] {
    if (!agenda?.bloques) {
        return [];
    }
    let bloques = [...agenda.bloques];

    // T11: filtrar por turnos:darTurnos:prestacion:?
    if (permisosPrestacion?.length && permisosPrestacion[0] !== '*') {
        bloques = bloques.filter((bloque) =>
            bloque.tipoPrestaciones?.some((p) => {
                const id = idTipoPrestacion(p);
                return id && permisosPrestacion.includes(id);
            }),
        );
    }

    if (tipoTurno === 'gestion' || condicionLlave) {
        if (!contieneExclusivoGestion(agenda)) {
            bloques = bloques.filter((value) => {
                if (esAgendaDeHoy) {
                    return (value.restantesDelDia as number) + (value.restantesProgramados as number) > 0;
                }
                return (
                    (value.restantesProgramados as number)
                    + (value.restantesGestion as number)
                    + (value.restantesProfesional as number)
                ) > 0;
            });
        }
    } else {
        bloques = bloques.filter((value) => {
            if (esAgendaDeHoy) {
                return (value.restantesDelDia as number) + (value.restantesProgramados as number) > 0;
            }
            return (value.restantesProgramados as number) > 0;
        });
    }
    return bloques;
}

export function tipoTurnoParaAgenda(
    agenda: IAgenda,
    condicionLlave: boolean
): 'delDia' | 'programado' | 'gestion' {
    const esHoy = moment(agenda.horaInicio).isSame(moment(), 'day');
    const exclusivaGestion = contieneExclusivoGestion(agenda);
    if (esHoy && exclusivaGestion) {
        return 'gestion';
    }
    if (esHoy) {
        return 'delDia';
    }
    if (condicionLlave) {
        return 'gestion';
    }
    return 'programado';
}
