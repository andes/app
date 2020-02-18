import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';
import { IMaquinaEstados } from '../interfaces/IMaquinaEstados';
import { MapaCamasHTTP, IFiltrosHistorial } from './mapa-camas.http';

@Injectable()
export class MapaCamasService {

    public ambito = 'internacion';
    public capa;
    private url = '/modules/rup/internacion';

    constructor(
        private camasHTTP: MapaCamasHTTP
    ) { }

    setCapa(capa: string) {
        this.capa = capa;
    }

    snapshot(fecha, idInternacion = null, ambito: string = null, capa: string = null, estado: string = null): Observable<ISnapshot[]> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;

        return this.camasHTTP.snapshot(ambito, capa, fecha, idInternacion, estado);
    }

    historial(desde: Date, hasta: Date, filtros: IFiltrosHistorial): Observable<ISnapshot[]> {
        return this.camasHTTP.historial(this.ambito, this.capa, desde, hasta, filtros);
    }

    get(fecha, idCama): Observable<ICama[]> {
        return this.camasHTTP.get(this.ambito, this.capa, fecha, idCama);
    }

    save(data, fecha, ambito: string = null, capa: string = null): Observable<ICama> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;
        return this.camasHTTP.save(ambito, capa, fecha, data);
    }

    getMaquinaEstados(organizacion): Observable<IMaquinaEstados[]> {
        return this.camasHTTP.getMaquinaEstados(this.ambito, this.capa, organizacion);
    }

    censoDiario(fecha, unidadOrganizativa): Observable<any[]> {
        return this.camasHTTP.censoDiario(fecha, unidadOrganizativa);
    }

    listaEspera(ambito: string, capa: string): Observable<any[]> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;
        return this.camasHTTP.listaEspera(ambito, capa);
    }

    censoMensual(fechaDesde, fechaHasta, unidadOrganizativa): Observable<any[]> {
        return this.camasHTTP.censoMensual(fechaDesde, fechaHasta, unidadOrganizativa);
    }

    calcularEdad(fechaNacimiento: Date, fechaCalculo: Date): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = fechaCalculo ? fechaCalculo : new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'año/s'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'mes/es'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'día/s'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'hora/s'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minuto/s'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }
}
