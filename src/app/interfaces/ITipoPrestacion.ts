export interface ITipoPrestacion {
    id: String;
    conceptId: String;
    term: String;
    fsn: String;
    refsetIds: [];
    semanticTag: String;
    noNominalizada?: Boolean;
    ambito?: Array<string>;
    queries?: String[];
    auditable?: Boolean;
}
