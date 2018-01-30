export interface ISnomedConcept {
    id: string;
    conceptId: string;
    term: string;
    fsn: string;
    semanticTag: string;
    refsetIds?: string[];
};
