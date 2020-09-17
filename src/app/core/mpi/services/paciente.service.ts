import { Observable, pipe } from 'rxjs';
import { PacienteSearch } from '../../../interfaces/pacienteSearch.interface';
import { IPaciente } from '../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICarpetaPaciente } from '../../../interfaces/ICarpetaPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { map } from 'rxjs/operators';

@Injectable()
export class PacienteService {
    private pacienteUrl = '/core/mpi/pacientes';  // URL to web api
    private carpetaUrl = '/modules/carpetas';
    /**
     * RegEx para validar nombres y apellidos.
     */
    public nombreRegEx = /^([a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ '])+$/;

    constructor(private server: Server) { }

    getConsultas(filtro: String): Observable<number> {
        return this.server.get(`${this.pacienteUrl}/counts?consulta=${filtro}`, null);
    }

    /**
     * Metodo getById. Trae un objeto paciente por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IPaciente> {
        return this.server.get(`${this.pacienteUrl}/${id}`, null);
    }

    /**
     * TEMPORAL. Resuelve el bug de la API de pacientes, unificando la interface que devuelven los diferentes tipos
     * Una vez solucionado el bug de la API, eliminar este método y reemplazarlo por get()
     * @param {PacienteSearch} params
     * @returns {Observable<IPacienteMatch[]>}
     * @memberof PacienteService
     */
    getMatch(params: any): Observable<IPacienteMatch[]> {
        return this.server.get(this.pacienteUrl, { params: params, showError: true }).pipe(map((value) => {
            if (params.type === 'simplequery') {
                return value.map((i) => ({ paciente: i, id: i.id, match: 100 }));
            } else {
                return value;
            }
        }));
    }

    // Búsqueda tipo SEARCH por elastic según condiciones.
    getSearch(params: any): Observable<any[]> {
        return this.server.get(this.pacienteUrl + '/search', { params: params, showError: true });
    }

    get(params: PacienteSearch): Observable<IPaciente[]> {
        return this.server.get(this.pacienteUrl, { params: params, showError: true });
    }

    getInactivos(): Observable<IPaciente[]> {
        return this.server.get(`${this.pacienteUrl}/inactivos/`, { showError: true });
    }

    getAuditoriaVinculados(params: any): Observable<IPaciente[]> {
        return this.server.get(`${this.pacienteUrl}/auditoria/vinculados/`, { params: params, showError: true });
    }

    getTemporales(): Observable<IPaciente[]> {
        return this.server.get(`${this.pacienteUrl}/temporales/`, null);
    }

    getNroCarpeta(params: any): Observable<any> {
        return this.server.get(`${this.carpetaUrl}/carpetasPacientes`, { params: params, showError: true });
    }

    getByIdNroCarpeta(id: String): Observable<ICarpetaPaciente> {
        return this.server.get(`${this.carpetaUrl}/carpetasPacientes${id}`, null);
    }

    /**
     * Metodo post. Inserta un objeto paciente nuevo.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    post(paciente: IPaciente): Observable<IPaciente> {
        return this.server.post(this.pacienteUrl, paciente);
    }
    /**
     * Consulta fuentes auténticas para obtener datos del paciente validados.
     *
     * @param {*} paciente
     * @returns {Observable<any>}
     * @memberof PacienteService
     */
    validar(paciente: any): Observable<any> {
        return this.server.post(this.pacienteUrl + '/validar', paciente);
    }
    /**
     * Metodo put. Actualiza un objeto paciente.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    put(paciente: IPaciente): Observable<IPaciente> {
        return this.server.put(`${this.pacienteUrl}/${paciente.id}`, paciente);
    }

    /**
     * Metodo setActivo. Actualiza estado (Activo/inactivo) de un paciente.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    setActivo(paciente: IPaciente): Observable<IPaciente> {
        return this.server.put(`${this.pacienteUrl}/auditoria/setActivo`, paciente);
    }

    /**
     * Metodo patch. Modifica solo algunos campos del paciente. (por ejemplo telefono)
     * @param {any} cambios Recibe any
     */
    patch(id: String, cambios: any, options: any = {}): Observable<IPaciente> {
        return this.server.patch(`${this.pacienteUrl}/${id}`, cambios);
    }

    /**
    * Metodo post. Modifica el array de identificadores del paciente.
    * @param {any} cambios Recibe any
    */
    postIdentificadores(id: String, cambios: any, options: any = {}): Observable<IPaciente> {
        return this.server.post(`${this.pacienteUrl}/${id}/identificadores`, cambios);
    }

    /**
     * Metodo disable. deshabilita un objeto paciente.
     * @param {IPaciente} paciente Recibe IPaciente{}
     */
    disable(paciente: IPaciente): Observable<IPaciente> {
        paciente.activo = false;
        return this.setActivo(paciente);
    }

    /**
     * Metodo enable. habilita un objeto paciente.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    enable(paciente: IPaciente): Observable<IPaciente> {
        paciente.activo = true;
        return this.setActivo(paciente);
    }

    save(paciente: IPaciente, ignoreCheck: boolean = false): Observable<IPaciente> {
        if (paciente.id) {
            return this.server.put(`${this.pacienteUrl}/${paciente.id}`, { paciente, ignoreCheck });
        } else {
            return this.server.post(this.pacienteUrl, { paciente, ignoreCheck });
        }
    }
    getSiguienteCarpeta(): Observable<any> {
        return this.server.get(`${this.carpetaUrl}/ultimaCarpeta`);
    }
    incrementarNroCarpeta(): Observable<any> {
        return this.server.post(`${this.carpetaUrl}/incrementarCuenta`, {});
    }

}
