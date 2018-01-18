export interface ITipoPrestacion {
    id: String;
    conceptId: String;
    term: String;
    fsn: String;
    semanticTag: String;
    nombre: String;
    acceptability?: {
        conceptId: String,
        preferredTerm: String
    };
    preferido?: String;
}
