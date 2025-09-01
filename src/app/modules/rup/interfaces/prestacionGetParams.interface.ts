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
    tienePrestacionOrigen?: boolean;
    tieneTurno?: boolean;
    organizacion?: string;
    ordenFecha?: boolean;
    ordenFechaEjecucion?: boolean;
    limit?: number;
    ambitoOrigen?: string;
    tipoPrestaciones?: any[];
}
