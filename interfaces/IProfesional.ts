 import { IDomicilio} from "./IDomicilio";
 import { IMatricula} from "./IMatricula";
 
 export interface IProfesional {
 
 nombre: String;
    apellido: String;
    tipoDni: String;
    numeroDni: Number;
    fechaNacimiento: Date;
    domicilio: IDomicilio;
    telefono: String;
    email: String;
    matriculas: IMatricula[];
    habilitado: Boolean;
    fechaBaja: Date;
 }