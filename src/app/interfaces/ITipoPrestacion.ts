export interface ITipoPrestacion {
    id: string;
    conceptId: string;
    term: string;
    fsn: string;
    refsetIds: [];
    semanticTag: string;
    noNominalizada?: boolean;
    agendaDinamica: boolean;
    ambito?: Array<string>;
    queries?: string[];
    auditable?: boolean;
}
