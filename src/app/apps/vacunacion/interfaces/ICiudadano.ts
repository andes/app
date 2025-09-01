import { ILocalidad } from 'src/app/interfaces/ILocalidad';

export interface ICiudadano {
    id: string;
    fechaRegistro: Date;
    tieneTramite: boolean;
    nroTramite: string;
    grupo: {
        id: string;
        nombre: string;
    };
    documento: string;
    nombre: string;
    alias?: string;
    apellido: string;
    sexo: string;
    genero: string;
    fechaNacimiento: Date;
    telefono: string;
    email: string;
    cud: string;
    localidad: ILocalidad;
    estado: string;
    alergia: boolean;
    condicion: boolean;
    convaleciente: boolean;
    vacuna: boolean;
    plasma: boolean;
    profesion: string;
    matricula: number;
    establecimiento: string;
    localidadEstablecimiento: ILocalidad;
    relacion: string;
    diaseleccionados: string;
    recaptcha: string;
    morbilidades?: any[];
    validado?: boolean;
    validaciones?: any[];
    paciente?: {
        id: string;
    };
    factorRiesgoEdad: boolean;
    numeroIdentificacion?: string;
}
