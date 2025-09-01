export interface IDataPrestacion {
    id: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
    fechaBaja: Date;
}

export interface IConfigPrestacion {
    prestacion: IDataPrestacion;
    deldiaAccesoDirecto: boolean;
    deldiaReservado: boolean;
    deldiaAutocitado: boolean;
    programadosAccesoDirecto: boolean;
    programadosReservado: boolean;
    programadosAutocitado: boolean;
}
