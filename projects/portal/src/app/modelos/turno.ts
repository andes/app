export class Turno {
    id: number;
    fecha: string;
    efector: string;
    horaInicio: String;
    estado: boolean;
    asistencia: string;
    profesional: string;
    paciente: {
        id: string,
        nombre: string,
        apellido: string,
        alias: string,
        documento: string,
        fechaNacimiento: String,
        telefono: String,
        sexo: String,
        carpetaEfectores: [{
            organizacion: string,
            nroCarpeta: string,
            id: String,
        }],
        obraSocial: {
            codigoPuco: number,
            nombre: string,
            financiador: string
        },
        foto: String;
    };
    tipoPrestacion: string;
    idPrestacionPaciente: string;
    tipoTurno: string;
    reasignado: {
        anterior: {
            idAgenda: string,
            idBloque: string,
            idTurno: string
        }
        siguiente: {
            idAgenda: string,
            idBloque: string,
            idTurno: string
        }
    };
    carpetaEfectores?: [{
        organizacion: {
            id: string;
            nombre: string
        },
        nroCarpeta: string
    }];
    nota: string;
    motivoSuspension: String;
    avisoSuspension: String;
    diagnostico: {
        codificaciones: [];
    };
    estadoFacturacion: {
        estado: String;
        tipo: String;
        numeroComprobante: String;
    }
    auditable: Boolean;
    emitidoPor: String;
    fechaHoraDacion: String;
    motivoConsulta: String;
    horaAsistencia: String;
}
