export interface IElementoRUP {
    id: String;
    key: String;
    nombre: String;
    autonoma: Boolean;
    turneable: Boolean;
    activo: Boolean;
    componente: {
        nombre: String,
        ruta: String
    };
    tipo: String;
    conceptos: [
        {
            conceptId: String,
            term: String,
            fsn: String,
            semanticTag: String
        }];
    requeridos: IElementoRUP[];
    frecuentes: [
        {
            conceptId: String,
            term: String,
            fsn: String,
            semanticTag: String
    }];

}
