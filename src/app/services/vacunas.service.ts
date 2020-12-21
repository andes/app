import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';

@Injectable()
export class VacunasService {

    private vacunasURL = '/modules/vacunas';  // URL to web api
    private nomivacVacunasUrl = '/modules/vacunas/nomivacVacunas';
    private nomivacCategoriasUrl = '/modules/vacunas/nomivacCategorias';
    private nomivacCondicionesUrl = '/modules/vacunas/nomivacCondiciones';
    private nomivacLaboratoriosUrl = '/modules/vacunas/nomivacLaboratorios';
    private nomivacEsquemasUrl = '/modules/vacunas/nomivacEsquemas';
    private nomivacDosisUrl = '/modules/vacunas/nomivacDosis';

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto tipoPrestacion.
     * @param {any} params Opciones de busqueda
     */
    get(idPaciente: String): Observable<any> {
        return this.server.get(this.vacunasURL + '/paciente/' + idPaciente, null);
    }

    /**
     * Metodo get. Obtiene listado de vacunas
     * @param {any} params Opciones de busqueda
     */
    getNomivacVacunas(params: any) {
        return this.server.get(this.nomivacVacunasUrl, { params: params, showError: true });
    }

    getNomivacCategorias(params: any) {
        return this.server.get(this.nomivacCategoriasUrl, { params: params, showError: true });
    }

    getNomivacCondiciones(params: any) {
        return this.server.get(this.nomivacCondicionesUrl, { params: params, showError: true });
    }

    getNomivacLaboratorios(params: any) {
        return this.server.get(this.nomivacLaboratoriosUrl, { params: params, showError: true });
    }

    getNomivacEsquemas(params: any) {
        return this.server.get(this.nomivacEsquemasUrl, { params: params, showError: true });
    }

    getNomivacDosis(params: any) {
        return this.server.get(this.nomivacDosisUrl, { params: params, showError: true });
    }

}
