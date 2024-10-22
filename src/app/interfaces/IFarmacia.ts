import { IDireccion } from '../core/mpi/interfaces/IDireccion';
import { IContacto } from './IContacto';
import { IUbicacion } from './IUbicacion';

export interface IFarmacia {
    id: string;
    denominacion: string;
    razonSocial: string;
    cuit: string;
    DTResponsable: string;
    matriculaDTResponsable: string;
    disposicionAltaDT: string;
    activo: boolean;
    farmaceuticosAuxiliares: any[];
    horarios: [{
        dia: string;
    }];
    domicilio: {
        valor: string;
        codigoPostal: string;
        ubicacion: {
            provincia: {};
            localidad: {};
        };
    };
    contactos: any[];
    asociadoA: string;
    disposicionHabilitacion: string;
    fechaHabilitacion: Date;
    fechaRenovacion: Date;
    vencimientoHabilitacion: Date;
    gabineteInyenctables: boolean;
    laboratoriosMagistrales: boolean;
    expedientePapel: string;
    expedienteGDE: string;
    nroCaja: string;
    disposiciones: [];
    sancion: [];
}
