import { Observable } from 'rxjs/Rx';
import { PacienteSearch } from './pacienteSearch.interface';
import { IPaciente } from './../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import { ICarpetaPaciente } from './../interfaces/ICarpetaPaciente';

@Injectable()
export class PacienteService {

  private pacienteUrl = '/core/mpi/pacientes';  // URL to web api
  private carpetaUrl = '/modules/turnos/carpetasPacientes';


  constructor(private server: Server) { }

  getConsultas(filtro: String): Observable<number> {
    return this.server.get(this.pacienteUrl + '/counts?consulta=' + filtro, null);
  }

  /**
   * Metodo getById. Trae un objeto paciente por su Id.
   * @param {String} id Busca por Id
   */
  getById(id: String): Observable<IPaciente> {
    return this.server.get(this.pacienteUrl + '/' + id, null)
  }

  get(params: PacienteSearch): Observable<IPaciente[]> {
    return this.server.get(this.pacienteUrl, { params: params, showError: true });
  }

  getDashboard(): Observable<IPaciente[]> {
    return this.server.get(this.pacienteUrl + '/dashboard/', null);
  }

  getNroCarpeta(params: any): Observable<any> {
    return this.server.get(this.carpetaUrl, { params: params, showError: true });
  }

  getByIdNroCarpeta(id: String): Observable<ICarpetaPaciente> {
      return this.server.get(this.carpetaUrl + '/' + id, null);
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
    console.log("CAMBIOS PATCH",cambios);
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
}
