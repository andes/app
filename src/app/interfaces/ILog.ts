import { IOrganizacion } from './IOrganizacion';

export interface ILog {
    fecha: {
        type: Date
    };
    usuario: {
        nombreCompleto: String,
        nombre: String,
        apellido: String,
        username: Number,
        documento: Number
    };
    organizacion: { type: IOrganizacion };
    modulo: {
        type: String,
        enum: ['mpi', 'turnos', 'rup']
    };
    operacion: {
        type: String,
        enum: [
            // Operaciones genéricas
            'query', 'insert', 'update', 'delete',
            // Operaciones de módulos
            // ... Mpi
            'macheoAlto', 'posibleDuplicado', 'reportarError', 'validadoScan', 'scan', 'scanFail',
            // OperacionesElastic
            'elasticInsert', 'elasticUpdate', 'elasticDelete',
            // ... Turnos
            'asignarTurno', 'cancelarTurno', 'listaEspera'
            // ... RUP
        ]
    };
    datosOperacion: any;
    cliente: {
        ip: String,
        app: {
            type: String,
            enum: ['desktop', 'mobile']
        }
    };
    servidor: {
        ip: String,
    };
}
