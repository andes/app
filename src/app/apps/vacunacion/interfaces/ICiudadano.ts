import { ILocalidad } from 'src/app/interfaces/ILocalidad';

export interface ICiudadano {
    id: string;
    fechaRegistro: Date;
    tieneTramite: boolean;
    nroTramite: string;
    grupo: {
        id: String,
        nombre: String
    };
    documento: string;
    nombre: string;
    apellido: string;
    sexo: string;
    fechaNacimiento: Date;
    telefono: string;
    email: string;
    cue: string;
    localidad: ILocalidad;
    estado: string;
    alergia: boolean;
    condicion: boolean;
    enfermedad: boolean;
    convaleciente: boolean;
    aislamiento: boolean;
    vacuna: boolean;
    plasma: boolean;
    amamantando: boolean;
    embarazada: boolean;
    profesion: string;
    matricula: number;
    establecimiento: string;
    localidadEstablecimiento: ILocalidad;
    relacion: string;
}
