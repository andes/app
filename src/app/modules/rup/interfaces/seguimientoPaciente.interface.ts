import { IPrestacionRegistro  } from './prestacion.registro.interface';

export interface ISeguimientoPaciente {
    id?: string; // Virtual
    paciente: {
        id: string,
        nombre: string,
        apellido: string,
        documento: string,
        telefono: string,
        sexo: string,
        fechaNacimiento: Date,
    }; // Agregar interface de paciente
    registro: IPrestacionRegistro; // Agregar interface de registros
    profesional: any; // Agregar interface de profesion
}
