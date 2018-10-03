import { Observable } from 'rxjs/Rx';
import { PacienteSearch } from './pacienteSearch.interface';
import { IPaciente } from './../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import { ICarpetaPaciente } from './../interfaces/ICarpetaPaciente';
import { IPacienteMatch } from '../modules/mpi/interfaces/IPacienteMatch.inteface';

@Injectable()
export class PacienteService {

    private pacienteUrl = '/core/mpi/pacientes';  // URL to web api
    private carpetaUrl = '/modules/carpetas';


    constructor(private server: Server) { }

    getConsultas(filtro: String): Observable<number> {
        return this.server.get(this.pacienteUrl + '/counts?consulta=' + filtro, null);
    }

    /**
     * Metodo getById. Trae un objeto paciente por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IPaciente> {
        return this.server.get(this.pacienteUrl + '/' + id, null);
    }

    /**
     * TEMPORAL. Resuelve el bug de la API de pacientes, unificando la interface que devuelven los diferentes tipos
     * Una vez solucionado el bug de la API, eliminar este método y reemplazarlo por get()
     * @param {PacienteSearch} params
     * @returns {Observable<IPacienteMatch[]>}
     * @memberof PacienteService
     */
    getMatch(params: PacienteSearch): Observable<IPacienteMatch[]> {
        return this.server.get(this.pacienteUrl, { params: params, showError: true }).map((value) => {
            if (params.type === 'simplequery') {
                return value.map((i) => ({ paciente: i, id: i.id, match: 100 }));
            } else {
                return value;
            }
        });
    }

    get(params: PacienteSearch): Observable<IPaciente[]> {
        return this.server.get(this.pacienteUrl, { params: params, showError: true });
    }

    getDashboard(): Observable<IPaciente[]> {
        return this.server.get(this.pacienteUrl + '/dashboard/', null);
    }

    getTemporales(): Observable<IPaciente[]> {
        return this.server.get(this.pacienteUrl + '/temporales/', null);
    }

    getNroCarpeta(params: any): Observable<any> {
        return this.server.get(this.carpetaUrl + '/carpetasPacientes', { params: params, showError: true });
    }

    getByIdNroCarpeta(id: String): Observable<ICarpetaPaciente> {
        return this.server.get(this.carpetaUrl + '/carpetasPacientes' + id, null);
    }

    /**
     * Metodo post. Inserta un objeto paciente nuevo.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    post(paciente: IPaciente): Observable<IPaciente> {
        return this.server.post(this.pacienteUrl, paciente);
    }

    /**
     * Metodo put. Actualiza un objeto paciente.
     * @param {IPaciente} paciente Recibe IPaciente
     */
    put(paciente: IPaciente): Observable<IPaciente> {
        return this.server.put(this.pacienteUrl + '/' + paciente.id, paciente);
    }

    /**
     * Metodo patch. Modifica solo algunos campos del paciente. (por ejemplo telefono)
     * @param {any} cambios Recibe any
     */
    patch(id: String, cambios: any, options: any = {}): Observable<IPaciente> {
        return this.server.patch(this.pacienteUrl + '/' + id, cambios);
    }

    /**
     * Metodo disable. deshabilita un objeto paciente.
     * @param {IPaciente} paciente Recibe IPaciente{}
     */
    disable(paciente: IPaciente): Observable<IPaciente> {
        paciente.activo = false;
        return this.put(paciente);
    }

    /**
     * Metodo enable. habilita un objeto paciente..
     * @param {IPaciente} paciente Recibe IPaciente
     */
    enable(paciente: IPaciente): Observable<IPaciente> {
        paciente.activo = true;
        return this.put(paciente);
    }

    save(paciente: IPaciente): Observable<IPaciente> {
        if (paciente.id) {
            return this.server.put(this.pacienteUrl + '/' + paciente.id, paciente);
        } else {
            return this.server.post(this.pacienteUrl, paciente);

        }
    }
    getSiguienteCarpeta(): Observable<any> {
        return this.server.get(this.carpetaUrl + '/ultimaCarpeta');
    }
    incrementarNroCarpeta(): Observable<any> {
        return this.server.post(this.carpetaUrl + '/incrementarCuenta', {});
    }
}
