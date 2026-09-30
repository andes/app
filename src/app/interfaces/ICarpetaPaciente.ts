
export interface ICarpetaPaciente {
    id: string;
    documento: string;
    carpetaEfectores: [{
        organizacion: {
            id: string;
            nombre: string;
        };
        idPaciente: string;
        nroCarpeta: string;
    }];

}
