import { IPrestacion } from './IPrestacion';
import { IUbicacion } from './../IUbicacion';

export interface IConfigPrestacion{
    prestacion: IPrestacion;
    deldiaAccesoDirecto: Boolean;
    deldiaReservado: Boolean;
    deldiaAutocitado: Boolean;
    programadosAccesoDirecto: Boolean;
    programadosReservado: Boolean;
    programadosAutocitado: Boolean;
}
