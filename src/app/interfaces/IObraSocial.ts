export interface IObraSocial {
    id: string;
    tipoDocumento: string;
    dni: number;
    transmite: string;
    nombre: string;
    codigoFinanciador: number;
    financiador: string;
    version: Date;
    numeroAfiliado: string;
    prepaga?: boolean;
    codigoPuco?: number;
    idObraSocial?: number;
    origen?: string;
}
