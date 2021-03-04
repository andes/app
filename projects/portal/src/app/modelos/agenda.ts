export class Agenda {
    id: number;
    tipoPrestaciones: string;
    profesionales: [{
        id: string,
        nombre: string,
        apellido: string
    }];
    paciente: [{
        id: string,
        nombre: string,
        apellido: string
    }];
    turnos: [{
        horaInicio: string;
        estado: string;
        asistencia: string;
        prestacion: string;
        profesional: string;
        nota: string;
        procedencia: string;
        prioritario: boolean;
        paciente: string;
        dni: number,
        carpeta: string;
        efector: string
    },
    ];
    organizacion: {
        id: string,
        nombre: string
    };
    espacioFisico: {
        id: string,
        nombre: string,
        servicio: {
            id: string,
            nombre: string
        };
        sector: {
            id: string,
            nombre: string
        };
    };
    otroEspacioFisico: string;
    fecha: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
    intercalar: boolean;
    bloques: [
        {
            id: string;
            horaInicio: number;
            horaFin: number;
            cantidadTurnos: number;
            duracionTurno: number;
            descripcion: string;
            tipoPrestaciones: string;
            accesoDirectoDelDia: number;
            accesoDirectoProgramado: number;
            reservadoGestion: number;
            reservadoProfesional: number;
            restantesDelDia: number;
            restantesProgramados: number;
            restantesGestion: number;
            restantesProfesional: number;
            pacienteSimultaneos: boolean;
            cantidadSimultaneos: number;
            citarPorBloque: boolean;
            cantidadBloque: number;
            turnos: number;
        }
    ];
    estado: string;
    prePausada: string;
    sobreturnos: string;
    turnosDisponibles: number;
    turnosRestantesDelDia: number;
    turnosRestantesProgramados: number;
    turnosRestantesGestion: number;
    turnosRestantesProfesional: number;
    estadosAgendas: string;
    nota: string;
    nominalizada: boolean;
    dinamica: boolean;
    cupo: number;
    avisos: [{
        profenionalId: string,
        estado: string,
        fecha: string
    }];
}
