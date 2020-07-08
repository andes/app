export interface IObraSocial {
  id: string;
  tipoDocumento: String;
  dni: Number;
  transmite: String;
  nombre: String;
  codigoFinanciador: Number;
  financiador: String;
  version: Date;
  numeroAfiliado: String;
  prepaga?: Boolean;
  codigoPuco?: Number;
  idObraSocial?: Number;
}
