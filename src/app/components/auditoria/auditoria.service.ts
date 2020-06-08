import { Observable } from 'rxjs';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class AuditoriaService {
    private pacienteUrlV2 = '/core-v2/mpi/paciente';  // URL to web api
    /**
     * RegEx para validar nombres y apellidos.
     */
    public nombreRegEx = /^([a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ '])+$/;

    constructor(private server: Server) { }

    /**
     * Metodo getById: Trae un objeto paciente por su Id.
     * @param {String} id Busca por Id
     */
    findById(id): Observable<IPaciente> {
        return this.server.get(`${this.pacienteUrlV2}/${id}`, null);
    }

    /**
     * Metodo get: Trae los objetos IPaciente que se encuentran en la búsqueda
     * @param params parámetros para filtrar en la búsqueda de pacientes
     */
    get(params: any) {
        if (params) {
            return this.server.get(this.pacienteUrlV2, { params, showError: true });
        } else {
            return this.server.get(this.pacienteUrlV2, { showError: true });
        }
    }

    /**
     * Metodo setActivo: Actualiza dato activo (true/false) de un paciente
     * @param {IPaciente} paciente
     * @param {boolean} activo
     */
    setActivo(paciente: IPaciente, activo: boolean): Observable<IPaciente> {
        paciente.activo = activo;
        return this.update(paciente);
    }

    /**
     * Se vinculan dos pacientes: modifica el array de identificadores del paciente.
     * @param pacienteBase paciente que va a contener el vinculo de otro paciente
     * @param pacienteLink paciente a ser vinculado
     */
    linkPatient(pacienteBase: IPaciente, pacienteLink: IPaciente) {
        if (pacienteBase && pacienteBase.id && pacienteLink && pacienteLink.id) {
            const dataLink = {
                entidad: 'ANDES',
                valor: pacienteLink.id
            };
            if (pacienteBase.identificadores) {
                pacienteBase.identificadores.push(dataLink);
            } else {
                pacienteBase.identificadores = [dataLink]; // Primer elemento del array
            }
            return this.update(pacienteBase);
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
            return this.server.patch(`${this.pacienteUrlV2}/${pacienteBase.id}`, pacienteBase);
        }
        return;
    }

    /**
     * Método: se crea o actuliza un paciente
     * @param paciente
     */
    save(paciente) {
        if (paciente.id) {
            return this.update(paciente);
        } else {
            return this.create(paciente);
        }
    }

    // se crea un nuevo paciente
    create(paciente) {
        return this.server.post(`${this.pacienteUrlV2}`, paciente);
    }

    // se actualiza un paciente existente
    update(paciente) {
        if (paciente.id) {
            return this.server.patch(`${this.pacienteUrlV2}/${paciente.id}`, paciente);
        }
    }
}
