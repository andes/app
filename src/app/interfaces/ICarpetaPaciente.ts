
export interface ICarpetaPaciente {
    id: String;
    documento: String;
    carpetaEfectores: [{
      organizacion: {
        id: String,
        nombre: String
      },
      idPaciente: String,
      nroCarpeta: String
    }];

}
