import { Observable, combineLatest } from 'rxjs';
import { IPaciente } from '../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { map } from 'rxjs/operators';

@Injectable()
export class PacienteService {
    private pacienteUrl = '/core/mpi/pacientes';  // URL to web api
    private pacienteCoreV2 = '/core-v2/mpi/pacientes';
    /**
     * RegEx para validar nombres y apellidos.
     */
    public nombreRegEx = /^([a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ '])+$/;

    constructor(
        private server: Server) { }

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

    // Búsqueda tipo matching según condiciones.
    getSearch(params: any): Observable<any[]> {
        return this.server.get(this.pacienteUrl + '/search', { params: params, showError: true });
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
     * Metodo patch. Modifica solo algunos campos del paciente. (por ejemplo telefono)
     * @param {any} cambios Recibe any
     */
    patch(id: String, cambios: any, options: any = {}): Observable<IPaciente> {
        return this.server.patch(`${this.pacienteUrl}/${id}`, cambios);
    }

    patchV2(id: String, cambios: any): Observable<IPaciente> {
        return this.server.patch(`${this.pacienteCoreV2}/${id}`, cambios);
    }

    save(paciente: IPaciente, ignoreCheck: boolean = false): Observable<IPaciente> {
        if (paciente.id) {
            return this.server.put(`${this.pacienteUrl}/${paciente.id}`, { paciente, ignoreCheck });
        } else {
            return this.server.post(this.pacienteUrl, { paciente, ignoreCheck });
        }
    }


    // ############################  AUDITORIA  #################################

    /**
     * Metodo setActivo: Actualiza dato activo (true/false) de un paciente
     * @param {IPaciente} paciente
     * @param {boolean} activo
     */
    setActivo(paciente: IPaciente, activo: boolean) {
        return this.server.patch(`${this.pacienteCoreV2}/${paciente.id}`, { activo });
    }

    /**
     * Se vinculan dos pacientes: modifica el array de identificadores del paciente.
     * @param pacienteBase paciente que va a contener el vinculo de otro paciente
     * @param pacienteLink paciente a ser vinculado
     */
    linkPatient(pacienteBase: IPaciente, pacienteLink: IPaciente): Observable<IPaciente[]> {
        if (pacienteBase && pacienteBase.id && pacienteLink && pacienteLink.id) {
            const dataLink = {
                entidad: 'ANDES',
                valor: pacienteLink.id
            };
            if (pacienteBase.identificadores) {
                pacienteBase.identificadores.push(dataLink);
            } else {
                pacienteBase.identificadores = [dataLink];
            }
            pacienteLink.activo = false;
            return combineLatest(this.patchV2(pacienteBase.id, pacienteBase), this.setActivo(pacienteLink, false));
        }
        return;
    }

    /**
     * Se desvinculan dos pacientes: modifica el array de identificadores del paciente.
     * @param pacienteBase paciente que va a contener el vinculo de otro paciente
     * @param pacienteLink paciente a ser desvinculado
     */
    unlinkPatient(pacienteBase: any, pacienteLink: IPaciente) {
        if (pacienteBase && pacienteBase.id && pacienteLink && pacienteLink.id) {
            if (pacienteBase.identificadores) {
                pacienteBase.identificadores = (pacienteBase.identificadores.filter((x) => x.valor !== pacienteLink.id));
            }
            return combineLatest(this.patchV2(pacienteBase.id, pacienteBase), this.setActivo(pacienteLink, true));
        }
        return;
    }
}
