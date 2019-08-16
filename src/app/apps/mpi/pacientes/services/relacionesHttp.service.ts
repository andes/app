import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class RelacionesHttpService {

  private baseURL = '/core_v2/mpi/pacientes';  // URL to web api
  private subresource = 'relaciones';

  constructor(private server: Server, public auth: Auth) { }

  /**
* Recupera un listado de relaciones de un paciente según los filtros aplicados
* @param params Filtros de busqueda
*/

  get(paciente, params) {
    return this.server.get(`${this.baseURL}/${paciente.id}/${this.subresource}`, { params });
  }


  /**
   * Crea una relación de un paciente
   * @param paciente Datos del paciente
   * @param relacion Relación de parentesco del paciente
   */

  create(paciente, relacion) {
    return this.server.post(`${this.baseURL}/${paciente.id}/${this.subresource}`, relacion);
  }

  /**
   * Elimina la relación de un paciente
   * @param paciente Datos del paciente
   * @param relacion Relación de parentesco del paciente
   */


  delete(paciente, relacion) {
    return this.server.delete(`${this.baseURL}/${paciente.id}/${this.subresource}`, relacion);
  }


}
