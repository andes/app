import { AppSettings } from './../appSettings';
import { IPaciente } from './../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Server } from 'andes-shared/src/lib/server/server.service';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PacienteService {

  private pacienteUrl = AppSettings.API_ENDPOINT + '/core/mpi/pacientes';  // URL to web api
  private pacienteUrlSearch = AppSettings.API_ENDPOINT + '/core/mpi/pacientes/search';  // URL to web api
  constructor(private server: Server, private http: Http) { }

  /**
   * Metodo get. Trae el objeto paciente.
   * @param {any} params Opciones de busqueda
   */
  get(params: any): Observable<IPaciente[]> {
    return this.server.get(this.pacienteUrl, { params: params, showError: true }); //...errors if any*/
  }

  /**
   * Metodo getById. Trae un objeto paciente por su Id.
   * @param {String} id Busca por Id
   */
  getById(id: String): Observable<IPaciente> {
    return this.server.get(this.pacienteUrl + '/' + id, null)
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
  patch(id: String, cambios: any): Observable<IPaciente> {
    console.log(cambios);
    return this.server.patch(this.pacienteUrl + '/' + id, cambios);
  }

  /**
   * Metodo disable. deshabilita un objeto paciente.
   * @param {IPaciente} paciente Recibe IPaciente
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

  postSearch(dto: any): Observable<IPaciente[]> {
    let bodyString = { 'objetoBusqueda': dto }
    // let pacientes;
    return this.server.post(this.pacienteUrlSearch, bodyString);
  }

  search(value: String, dto: any): any {
    if (dto.documento && dto.apellido) {
      let bodyString = { 'objetoBusqueda': dto }
      return this.server.post(this.pacienteUrlSearch + '/simplequery/', bodyString);
    } else {
      if (value) {
        return this.server.post(this.pacienteUrlSearch + '/multimatch/' + value, { value });
      }
    }
  }

  searchMatch(field: String, dto: any): any {

    let bodyString = { 'objetoBusqueda': dto };
    return this.server.post(this.pacienteUrlSearch + '/match/' + field, bodyString);

  }

  save(paciente: IPaciente): Observable<IPaciente> {
      if (paciente.id) {
          return this.server.put(this.pacienteUrl + '/' + paciente.id, paciente);
      } else {
          return this.server.post(this.pacienteUrl, paciente);
      }
  }



}
