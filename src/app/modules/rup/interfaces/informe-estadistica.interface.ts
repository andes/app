import { ISnomedConcept } from './snomed-concept.interface';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IProfesional } from 'src/app/interfaces/IProfesional';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IOcupacion } from './ocupacion.interface';
export interface IInformeIngreso {
    fechaIngreso: Date;
    esCensable?: boolean;
    esMovimiento?: boolean;
    periodosCensables?: {
        desde: Date;
        hasta?: Date | null;
    }[];
    origen?: {
        tipo?: string;
        organizacionOrigen?: IOrganizacion;
        otraOrganizacion?: string;
    };
    ocupacionHabitual?: IOcupacion | null;
    situacionLaboral?: { id: string; nombre: string } | null;
    nivelInstruccion?: { id: string; nombre: string } | null;
    especialidades?: ISnomedConcept[];
    nroCarpeta?: string | null;
    motivo?: string;
    profesional?: IProfesional;
    paseAunidadOrganizativa?: string;
    cobertura?: {
        tipo?: string;
        obraSocial?: IObraSocial;
    };
    createdAt?: Date;
    createdBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: string | number;
        documento: string | number;
        organizacion: IOrganizacion;
    };
}

export interface IObraSocial {
    nombre: string;
    financiador: string;
    codigoPuco?: number; // Nota: ES OPCIONAL
}

export interface IInformeEgreso {
    // para analizar _id: any;
    fechaEgreso?: Date;
    procedimientosQuirurgicos?: {
        procedimiento?: ISnomedConcept;
        fecha?: Date;
    }[];
    causaExterna?: {
        producidaPor?: string;
        lugar?: string;
        comoSeProdujo?: string;
    };
    diasDeEstada?: number;
    tipoEgreso?: {
        id?: string;
        nombre?: string;
        OrganizacionDestino?: Partial<IOrganizacion>;
        otraOrganizacion?: string;
    };
    diagnosticos?: {
        principal?: ISnomedConcept;
        secundarios?: ISnomedConcept[];
        otrasCircunstancias?: ISnomedConcept;
        diasEstadaOtrasCircunstancias?: number;
        diasDePermisoDeSalida?: number;
    };
    nacimientos?: {
        pesoAlNacer?: number;
        condicionAlNacer?: string;
        terminacion?: string;
        sexo?: string;
    }[];
    createdAt?: Date;
    createdBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: string | number;
        documento: string | number;
        organizacion: IOrganizacion;
    };
}

export interface IInternacionEstado {
    tipo: 'anulada' | 'ejecucion' | 'validada';
    createdAt?: Date;
    createdBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: string | number;
        documento: string | number;
        organizacion: IOrganizacion;
    };
}

export interface IInformeEstadistica {
    id: any;
    _id?: string;
    organizacion: Partial<IOrganizacion & { _id?: string }>;

    unidadOrganizativa: ISnomedConcept;
    paciente: IPaciente;
    informeIngreso: IInformeIngreso;
    informeEgreso?: IInformeEgreso;
    periodosCensables?: { desde: Date; hasta: Date }[];
    estados?: IInternacionEstado[];
    estadoActual?: IInternacionEstado;
    estado?: IInternacionEstado | string;
    createdAt?: Date;
    createdBy?: {
        id: string;
        nombreCompleto: string;
        nombre: string;
        apellido: string;
        username: string | number;
        documento: string | number;
        organizacion: Partial<IOrganizacion & { _id?: string }>;
    };
}

