export class IPrestacionGetParams {
    id?: string;
    estado?: any;
    sinEstado?: string | string[];
    fechaDesde?: Date;
    fechaHasta?: Date;
    idProfesional?: string;
    idPaciente?: string;
    idPrestacionOrigen?: string;
    conceptId?: string;
    turnos?: any[];
    conceptsIdEjecucion?: any[];
    solicitudDesde?: Date;
    solicitudHasta?: Date;
    tienePrestacionOrigen?: Boolean;
    tieneTurno?: Boolean;
    organizacion?: string;
    ordenFecha?: boolean;
    ordenFechaEjecucion?: boolean;
    limit?: number;
    ambitoOrigen?: string;
    tipoPrestaciones?: any[];
}
