export interface IDataPrestacion {
    id: String;
    nombre: String;
    descripcion: String;
    activo: Boolean;
    fechaBaja: Date;
}

export interface IConfigPrestacion {
    prestacion: IDataPrestacion;
    deldiaAccesoDirecto: Boolean;
    deldiaReservado: Boolean;
    deldiaAutocitado: Boolean;
    programadosAccesoDirecto: Boolean;
    programadosReservado: Boolean;
    programadosAutocitado: Boolean;
}
