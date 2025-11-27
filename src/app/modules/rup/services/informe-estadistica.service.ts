/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { IInformeEstadistica } from '../interfaces/informe-estadistica.interface';
import { HUDSService } from './huds.service';

@Injectable({
    providedIn: 'root'
})
export class InformeEstadisticaService {
    private baseUrl = '/modules/rup/internacion/informe-estadistica';
    // Añadimos la URL base del servicio de Prestaciones, donde residen los endpoints de HUDS (Historial Único de Salud).
    private prestacionesBaseUrl = '/modules/rup/prestaciones';
    private cache: { [key: string]: Observable<IInformeEstadistica[]> } = {};
    private cachePrimeraBusqueda: any = {};



    constructor(
        private server: Server,
        private hudsService: HUDSService
    ) { }

    get(params?: any): Observable<IInformeEstadistica[]> {
        return this.server.get(this.baseUrl, { params });
    }

    getById(id: string, options: any = {}): Observable<IInformeEstadistica> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }
        const url = `${this.baseUrl}/${id}`;
        return this.server.get(url, options);
    }

    post(data: IInformeEstadistica): Observable<IInformeEstadistica> {
        return this.server.post(this.baseUrl, data);
    }

    getByPaciente(
        idPaciente: string,
        recargarCache: boolean = false,
        fechaDesde: string | null = null,
        fechaHasta: string | null = null
    ): Observable<IInformeEstadistica[]> {

        const cacheAnterior = { ...this.cachePrimeraBusqueda };

        // Guardamos los parámetros que se usarán para detectar cambios
        this.cachePrimeraBusqueda[idPaciente] = {
            idPaciente,
            fechaDesde,
            fechaHasta
        };

        // Si ya estaba en cache y no pedimos recargar → devolvemos
        const mismaBusqueda =
            cacheAnterior[idPaciente] &&
            cacheAnterior[idPaciente].fechaDesde === fechaDesde &&
            cacheAnterior[idPaciente].fechaHasta === fechaHasta;

        if (!recargarCache && mismaBusqueda && this.cache[idPaciente]) {
            return this.cache[idPaciente];
        }

        // Construcción de parámetros de la API
        const opt: any = {
            params: {
                paciente: idPaciente
            },
            options: {
                showError: true
            }
        };

        if (fechaDesde) {opt.params['fechaDesde'] = fechaDesde;}
        if (fechaHasta) {opt.params['fechaHasta'] = fechaHasta;}

        // Guardamos el observable cacheado
        this.cache[idPaciente] = this.server.get(this.baseUrl, opt).pipe(
            tap(informes => {
                console.log('📘 Informes Estadísticos (getByPaciente):', informes);
            }),
            catchError(err => {
                console.error('❌ Error en informe estadístico (getByPaciente):', err);
                return throwError(() => err);
            })
        );

        return this.cache[idPaciente];
    }

    validarInforme(id: string): Observable<IInformeEstadistica> {
        const url = `${this.baseUrl}/${id}/operacion`;

        const dto: any = {
            op: 'estadoPush',
            estado: {
                tipo: 'validada'
            }
        };

        return this.server.patch(url, dto);
    }
    patch(id: string, data: Partial<IInformeEstadistica>): Observable<IInformeEstadistica> {
        const url = `${this.baseUrl}/${id}`;
        return this.server.patch(url, data);
    }

    patchRegistros(id: string, body: any): Observable<IInformeEstadistica> {
        const url = `${this.baseUrl}/${id}`;
        return this.server.patch(url, body);
    }
    put(id: string, data: IInformeEstadistica): Observable<IInformeEstadistica> {
        return this.server.put(`${this.baseUrl}/${id}`, data);
    }

    // Este método está corregido para usar la URL de Prestaciones.
    getRegistrosHuds(idPaciente: string, expresion, deadLine = null, valor = null, searchTerm = null, form = null) {
        const hudsToken = this.hudsService.getHudsToken();
        const urlPeticion = this.prestacionesBaseUrl + '/huds/' + idPaciente;

        const opt = {
            params: {
                valor,
                expresion,
                searchTerm,
                form,
                deadLine,
                hudsToken: hudsToken
            },
            options: {
            }
        };
        // IMPORTANTE: Usamos la URL base de Prestaciones para acceder a los registros HUDS
        return this.server.get(urlPeticion, opt);
    }

    search(params?: any): Observable<IInformeEstadistica[]> {
        return this.server.get(this.baseUrl, { params });
    }
}
