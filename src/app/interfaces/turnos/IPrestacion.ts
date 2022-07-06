import { IPacienteBasico } from 'src/app/core/mpi/interfaces/IPaciente';
import { ISolicitud } from 'src/app/modules/rup/interfaces/solicitud.interface';
import { IOrganizacion } from '../IOrganizacion';

export interface IPrestacion {
    id: String;
    solicitud: ISolicitud;
    ejecucion: {
        organizacion: IOrganizacion;
        fecha: Date;
        registros: any[];
    };
    paciente: IPacienteBasico;
    estados: {
        tipo: string;
        idOrigenModifica: string;
        motivoRechazo: string;
        observaciones: string;
    };
    inicio: string;
    trackId: string;
}
