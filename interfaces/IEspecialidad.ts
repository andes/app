
export interface IEspecialidad {
    _id: string;
    nombre: String;
    descripcion: String;
    disciplina: String;
    nivelComplejidad: Number;
    codigo:{
       sisa: Number,
    };
   habilitado: Boolean;
   fechaAlta: Date;
   fechaBaja: Date;
}