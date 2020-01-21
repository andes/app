import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class MapaCamasService {

    public ambito = 'internacion';
    public capa;
    private url = '/modules/rup/internacion';
    constructor(private server: Server) { }

    setCapa(capa: string) {
        this.capa = capa;
    }

    snapshot(ambito, capa, fecha): Observable<any[]> {
        return this.server.get(this.url + '/camas', {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    historial(ambito: string, capa: string, desde: Date, hasta: Date, filtros): Observable<any[]> {
        const params = {
            ambito,
            capa,
            desde,
            hasta,
            ...filtros
        };
        return this.server.get(`${this.url}/camas/historial`, { params });
    }

    getCama(ambito, capa, fecha, idCama): Observable<any[]> {
        return this.server.get(this.url + `/camas/${idCama}`, {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    patchCama(data, ambito, capa, fecha) {
        let params = {
            ...data, ambito, capa, fecha
        };
        if (data._id) {
            return this.server.patch(this.url + `/camas/${data._id}`, {
                params,
                showError: true
            });
        } else {
            return this.server.post(this.url + `/camas`, {
                params: { ...data, ambito, capa },
                showError: true
            });
        }
    }

    getMaquinaEstados(organizacion, ambito, capa): Observable<any[]> {
        return this.server.get(this.url + `/estados`, {
            params: { organizacion, ambito, capa },
            showError: true
        });
    }

    censoDiario(fecha, unidadOrganizativa): Observable<any[]> {
        return this.server.get(this.url + '/censoDiario', {
            params: { fecha, unidadOrganizativa },
            showError: true
        });
    }

    censoMensual(fechaDesde, fechaHasta, unidadOrganizativa): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', {
            params: { fechaDesde, fechaHasta, unidadOrganizativa },
            showError: true
        });
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
