export interface IPracticaSearch {
    // type: string; // 'simplequery' | 'multimatch' | 'suggest';
    cadenaInput?: string;
    codigo?: string;
    buscarSimples?: boolean;
    buscarNoNomencladas?: boolean;
    // descripcion?: string;
}
