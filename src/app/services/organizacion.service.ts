import { Server } from '@andes/shared';
import { IOrganizacion } from './../interfaces/IOrganizacion';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';

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
     * Funciones sobre sectores y unidades organizativas de la orgazacion
     */

    clone(item) {
        let r = Object.assign({}, item);
        delete r['hijos'];
        return r;
    }

    traverseTree(sector, onlyLeaft) {
        if (sector.hijos && sector.hijos.length > 0) {
            let res = onlyLeaft ? [] : [this.clone(sector)];
            for (let sec of sector.hijos) {
                res = [ ...res, ...this.traverseTree(sec, onlyLeaft)];
            }
            return res;
        } else {
            return [this.clone(sector)];
        }
    }

    getFlatTree(organizacion, onlyLeaft = true) {
        let items = organizacion.unidadesOrganizativas.reduce((_items, actual) => {
            return [..._items, ...this.traverseTree(actual, onlyLeaft)];
        } , []);
        return items;
    }

    getRuta(organizacion, item) {
        for (let sector of organizacion.unidadesOrganizativas) {
            let res = this.makeTree(sector, item);
            if (res) {
                return res;
            }
        }
        return [];
    }


    makeTree(sector, item) {
        if (sector.hijos && sector.hijos.length > 0) {
            for (let sec of sector.hijos) {
                let res = this.makeTree(sec, item);
                if (res) {
                    let r = this.clone(sector);
                    return [r, ...res];
                }
            }
            return null;
        } else {
            if (item.id === sector.id) {
                let r = this.clone(sector);
                return [r];
            } else {
                return null;
            }
        }
    }


}
