import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteCacheService } from './pacienteCache.service';

@Injectable()
export class PacienteService {
    private pacienteV2 = '/core-v2/mpi/pacientes';
    /**
     * RegEx para validar nombres y apellidos.
     */
    public nombreRegEx = /^[a-zA-ZàáèéìíòóùúüñÀÁÈÉÌÍÒÓÙÚÑ']+( [a-zA-ZZàáèéìíòóùúüñÀÁÈÉÌÍÒÓÙÚÑ']+)*$/;

    constructor(
        private server: Server,
        private plex: Plex,
        private pacienteCacheService: PacienteCacheService
    ) { }

    /**
     * Metodo getById. Trae un objeto paciente por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String, options?: any): Observable<IPaciente> {
        return this.server.get(`${this.pacienteV2}/${id}`, options).pipe(
            tap((paciente: IPaciente) => this.pacienteCacheService.setPaciente(paciente))
        );
    }

    /**
     * TEMPORAL. Resuelve el bug de la API de pacientes, unificando la interface que devuelven los diferentes tipos
     * Una vez solucionado el bug de la API, eliminar este método y reemplazarlo por get()
     * @param {PacienteSearch} params
     * @returns {Observable<IPacienteMatch[]>}
     * @memberof PacienteService
     */
    get(params: any): Observable<IPacienteMatch[]> {
        return this.server.get(this.pacienteV2, { params }).pipe(map((value) => {
            if (params.type === 'simplequery') {
                return value.map((i) => ({ paciente: i, id: i.id, match: 100 }));
            } else {
                return value;
            }
        }));
    }

    getEstadoInternacion(id: String, options?: any) {
        return this.server.get(`${this.pacienteV2}/estadoActual/${id}/`, options);
    }

    match(params: any): Observable<IPacienteMatch[]> {
        return this.server.post(`${this.pacienteV2}/match`, params);
    }

    /**
     * Metodo post. Inserta un objeto paciente nuevo.
     * @param {IPaciente} paciente Recibe IPaciente
     */

    post(paciente: IPaciente, options?: any): Observable<IPaciente> {
        return this.server.post(this.pacienteV2, paciente, options);
    }

    /**
     * Metodo patch. Modifica solo algunos campos del paciente.
     * @param {any} cambios Recibe any
     */
    patch(id: String, cambios: any): Observable<IPaciente> {
        return this.server.patch(`${this.pacienteV2}/${id}`, cambios);
    }

    save(paciente: IPaciente, ignoreCheck: boolean = false): Observable<IPaciente> {
        if (paciente.id) {
            return this.patch(paciente.id, paciente);
        } else {
            return this.post(paciente, ignoreCheck);
        }
    }

    // Arroja una alerta invasiva cuando un paciente dado se encuentra fallecido
    checkFallecido(paciente: IPaciente) {
        if (paciente.fechaFallecimiento) {
            const fecha = moment(paciente.fechaFallecimiento).format('DD/MM/YYYY');
            this.plex.info('warning', `${paciente.nombreCompleto} se encuentra registrado como paciente fallecido el ${fecha}. De continuar, esta acción quedará registrada en la Historia de Salud del paciente.`, 'Paciente fallecido');
        }
    }


    // ############################  AUDITORIA  #################################

    /**
     * Metodo setActivo: Actualiza dato activo (true/false) de un paciente
     * @param {IPaciente} paciente
     * @param {boolean} activo
     */
    setActivo(paciente: IPaciente, activo: boolean) {
        return this.server.patch(`${this.pacienteV2}/${paciente.id}`, { activo });
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
            pacienteLink.idPacientePrincipal = pacienteBase.id;
            return combineLatest([this.patch(pacienteBase.id, pacienteBase), this.patch(pacienteLink.id, pacienteLink)]);
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
            pacienteLink.idPacientePrincipal = null;
            pacienteLink.activo = true;
            return combineLatest([this.patch(pacienteBase.id, pacienteBase), this.patch(pacienteLink.id, pacienteLink)]);
        }
        return;
    }
}
