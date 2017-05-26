export interface ITipoProblema {
    // id: String;
    // nombre: String;
    // tipo: String;
    // descripcion: String;
    // codigo: [{
    //     nombre: String,
    //     codigo: String,
    //     jerarquia: String,
    //     origen: String
    // }];
    // activo: Boolean;
    active: Boolean;
    conceptActive: Boolean;
    conceptId: String;
    definitionStatus: String;
    fsn: String;
    module: String;
    term: String;
    nombre: String; // TODO: Borrar o crear virtual
}