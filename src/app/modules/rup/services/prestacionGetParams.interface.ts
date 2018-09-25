export class IPrestacionGetParams {
    id?: string;
    estado?: any;
    sinEstado?: string;
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
    tienePrestacionOrigen?: 'si' | 'no';
    tieneTurno?: 'si' | 'no';
    organizacion?: string;
    ordenFecha?: boolean;
    ordenFechaEjecucion?: boolean;
    limit?: number;
}
