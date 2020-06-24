import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PacienteHttpService {

    private baseURL = '/core-v2/mpi/paciente';  // URL to web api
    /**
    * RegEx para validar nombres y apellidos.
    */
    public nombreRegEx = /^([a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ '])+$/;


    constructor(private server: Server, public auth: Auth) { }

    /**
     * Recupera un listado de paciente según los filtros aplicados
     * @param params Filtros de busqueda
     */

    get(params) {
        return this.server.get(this.baseURL, { params });
    }

    /**
     * Recupera un listado de paciente según una cadena de texto.
     * @param params Filtros de busqueda
     */

    search(text) {
        return this.server.get(this.baseURL, { params: { search: text } });
    }

    /**
     * Recupera un paciente por ID
     * @param ID ID del paciente
     */

    findById(id, options) {
        return this.server.get(`${this.baseURL}/${id}`, { params: options });
    }


    /**
     * Busca paciente similares según documento, sexo, identidad.
     * @param params Datos basicos del paciente a matchear
     */

    match(data) {
        return this.server.post(`${this.baseURL}/match`, data)/*.pipe(map((value) => {
            if (data.type === 'simplequery') {
                return value.map((i) => ({ paciente: i, id: i.id, match: 100 }));
            } else {
                return value;
            }
        }))*/;
    }

    /**
     * Crea un paciente
     * @param paciente Datos del paciente
     */

    create(paciente) {
        return this.server.post(`${this.baseURL}`, paciente);
    }

    /**
    * Actualiza los datos de un paciente
    * @param paciente Datos del paciente
    */

    update(paciente) {
        if (paciente.id) {
            return this.server.patch(`${this.baseURL}/${paciente.id}`, paciente);
        } else {
            return throwError('invalid_id');
        }
    }

    /**
     * Guarda los datos del paciente
     * @param paciente Datos del paciente
     */
    save(paciente) {
        if (paciente.id) {
            return this.update(paciente);
        } else {
            return this.create(paciente);
        }
    }

}
