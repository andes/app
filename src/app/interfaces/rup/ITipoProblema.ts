export interface ITipoProblema {
    id: String;
    nombre: String;
    tipo: String;
    descripcion: String;
    codigo: [{
        nombre: String,
        codigo: String,
        jerarquia: String,
        origen: String
    }];
    activo: Boolean;
}