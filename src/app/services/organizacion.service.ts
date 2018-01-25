import { Server } from '@andes/shared';
import { IOrganizacion } from './../interfaces/IOrganizacion';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { ICama } from '../interfaces/ICama';
import { ICamaEstado } from '../interfaces/ICamaEstado';

@Injectable()
export class OrganizacionService {
    private organizacionUrl = '/core/tm/organizaciones';  // URL to web api
    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto organizacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IOrganizacion[]> {
        return this.server.get(this.organizacionUrl, { params: params, showError: true });
    }

    /**
     * Metodo getById. Trae el objeto organizacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IOrganizacion> {
        return this.server.get(this.organizacionUrl + '/' + id, null);
    }

    getCamas(id: String): Observable<ICama> {
        return this.server.get(this.organizacionUrl + '/' + id + '/camas', null);
    }


    /**
     * Save. Si le organizacion por parametro tiene id hace put y sino hace post
     *
     * @param {IOrganizacion} organizacion guarda una organizacion
     * @returns {Observable<IOrganizacion>} retorna un observable
     *
     * @memberof OrganizacionService
     */
    save(organizacion: IOrganizacion): Observable<IOrganizacion> {
        if (organizacion.id) {
            return this.server.put(this.organizacionUrl + '/' + organizacion.id, organizacion);
        } else {
            return this.server.post(this.organizacionUrl, organizacion);
        }
    }

    /**
     * Metodo disable. deshabilita organizacion.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    disable(organizacion: IOrganizacion): Observable<IOrganizacion> {
        organizacion.activo = false;
        organizacion.fechaBaja = new Date();
        return this.save(organizacion);
    }

    /**
    * Metodo enable. habilita establecimiento.
    * @param {IOrganizacion} establecimiento Recibe IOrganizacion
    */
    enable(establecimiento: IOrganizacion): Observable<IOrganizacion> {
        establecimiento.activo = true;
        return this.save(establecimiento);
    }

    /**
     * @param cama recibe una cama para agregar a la organizacion
     * @param id es el id de la organizacion
     */
    addCama(id, cama: ICama): Observable<ICama> {
        let dto: any = {
            op: 'newCama',
            newCama: cama
        };
        return this.server.patch(this.organizacionUrl + '/' + id + '/camas', dto);
    }

    /**
    * @param idcama recibe un id de una cama para agregar a la organizacion
    * @param options opciones para el patch
    * @param id es el id de la organizacion
    */
    patch(id, idcama, options): Observable<any> {
        return this.server.patch(this.organizacionUrl + '/' + id + '/camas/' + idcama, options);
    }

    NewEstado(id, idcama, estado: ICamaEstado): Observable<any> {
        let dto: any = {
            op: 'estado',
            estado: estado.estado,
            objEstado: estado
        };
        return this.server.patch(this.organizacionUrl + '/' + id + '/camas/' + idcama, dto);
    }

}
