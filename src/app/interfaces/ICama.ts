import { ISnomedConcept } from './../modules/rup/interfaces/snomed-concept.interface';
import { IPaciente } from './IPaciente';

export interface ICama {
    sector: Number;
    habitacion: Number;
    numero: Number;
    servicio: ISnomedConcept;
    tipoCama: ISnomedConcept;
    equipamiento: [ISnomedConcept]; // oxigeno / bomba / etc
    // ultimo estado de la cama
    ultimoEstado: String;
    paciente: IPaciente;
    idInternacion: String;
    observaciones: String;
}

