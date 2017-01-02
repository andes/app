
export interface IEspecialidad {
    id: string;
    nombre: String;
    descripcion: String;
    disciplina: String;
    complejidad: Number;
    codigo:{
       sisa: String,
    };
   habilitado: Boolean;
   fechaAlta: Date;
   fechaBaja: Date;
}