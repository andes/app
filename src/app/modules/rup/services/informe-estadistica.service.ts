import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IInformeEstadistica } from '../interfaces/informe-estadistica.interface';
import { HUDSService } from './huds.service';

@Injectable({
    providedIn: 'root'
})
export class InformeEstadisticaService {
    // URL base para el servicio de informe estadístico
    private baseUrl = '/modules/rup/internacion/informe-estadistica';
    // Añadimos la URL base del servicio de Prestaciones, donde residen los endpoints de HUDS (Historial Único de Salud).
    private prestacionesBaseUrl = '/modules/rup/prestaciones';

    constructor(private server: Server,
                private hudsService: HUDSService
    ) { }

    // Obtiene una lista de informes estadísticos con filtros opcionales
    get(params?: any): Observable<IInformeEstadistica[]> {
        return this.server.get(this.baseUrl, { params });
    }

    // Obtiene un informe estadístico por su ID
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

    patch(id: string, data: Partial<IInformeEstadistica>): Observable<IInformeEstadistica> {
        return this.server.patch(`${this.baseUrl}/${id}`, data);
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
