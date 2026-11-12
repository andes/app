export interface IOcupacion {
    _id?: string;
    organizacion: IOrganizacion;
    unidadOrganizativa: IUnidadOrganizativa;
    paciente: IPaciente;
    informeIngreso: IInformeIngreso;
    estadoActual?: IEstadoActual;
    estados?: IEstado[];
    periodosCensables?: any[];
    createdAt?: Date;
    createdBy?: IUsuario;
    updatedAt?: Date;
    updatedBy?: IUsuario;
}

export interface IOrganizacion {
    _id: string;
    nombre: string;
    id?: string;
}

export interface IUnidadOrganizativa {
    _id: string;
    conceptId: string;
    term: string;
    fsn: string;
    semanticTag: string;
}

export interface IPaciente {
    id: string;
    documento: string;
    nombre: string;
    apellido: string;
    carpetaEfectores?: any[];
}

export interface IInformeIngreso {
    id?: string;
    fechaIngreso: Date;
    motivo: string;
    nivelInstruccion?: string;
    profesional: IProfesional;
    especialidades?: IEspecialidad[];
}

export interface IProfesional {
    id: string;
    nombre: string;
    apellido: string;
    documento?: string;
}

export interface IEspecialidad {
    term: string;
    conceptId: string;
}

export interface IEstadoActual {
    _id?: string;
    tipo: string;
    createdAt: Date;
    createdBy: IUsuario;
    id?: string;
}

export interface IEstado {
    tipo: string;
    fecha: Date;
    createdBy?: IUsuario;
}

export interface IUsuario {
    id: string;
    nombre: string;
    apellido: string;
    nombreCompleto?: string;
    username?: string;
}
