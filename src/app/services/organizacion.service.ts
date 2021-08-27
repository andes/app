import { Server, Cache } from '@andes/shared';
import { IOrganizacion } from './../interfaces/IOrganizacion';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { auditTime, switchMap, map } from 'rxjs/operators';
import { Auth } from '@andes/auth';

@Injectable()
export class OrganizacionService {
    private organizacionUrl = '/core/tm/organizaciones'; // URL to web api

    public organizacionesFiltradas$: Observable<IOrganizacion[]>;
    public nombre = new BehaviorSubject<string>(null);
    public soloNoActivo = new BehaviorSubject<boolean>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;

    constructor(
        public server: Server,
        private auth: Auth) {

        this.organizacionesFiltradas$ = combineLatest(
            this.nombre,
            this.soloNoActivo,
            this.lastResults
        ).pipe(
            auditTime(0),
            switchMap(([nombre, soloNoActivo = false, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    return EMPTY;
                }
                const params: any = {
                    activo: !soloNoActivo,
                    limit: this.limit,
                    skip: this.skip,
                    user: this.auth.usuario.username
                };
                if (nombre) {
                    params.nombre = nombre;
                }
                return this.get(params).pipe(
                    map(resultados => {
                        const listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        return listado;
                    })
                );
            })
        );
    }

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

    getGeoreferencia(id: String): Observable<any> {
        return this.server.get(this.organizacionUrl + '/georef/' + id, null);
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

    @Cache({ key: true })
    configuracion(id: String) {
        return this.server.get(`${this.organizacionUrl}/${id}/configuracion`);
    }

    unidadesOrganizativas(id: String) {
        return this.server.get(`${this.organizacionUrl}/${id}/unidadesOrganizativas`);
    }

    /**
     * Funciones sobre sectores y unidades organizativas de la orgazacion
     */

    clone(item) {
        const r = Object.assign({}, item);
        delete r['hijos'];
        return r;
    }

    traverseTree(sector, onlyLeaft) {
        if (sector.hijos && sector.hijos.length > 0) {
            let res = onlyLeaft ? [] : [this.clone(sector)];
            for (const sec of sector.hijos) {
                res = [...res, ...this.traverseTree(sec, onlyLeaft)];
            }
            return res;
        } else {
            return [this.clone(sector)];
        }
    }

    getFlatTree(organizacion, onlyLeaft = true) {
        const items = organizacion.mapaSectores.reduce((_items, actual) => {
            return [..._items, ...this.traverseTree(actual, onlyLeaft)];
        }, []);
        return items;
    }

    getRuta(organizacion, item) {
        for (const sector of organizacion.mapaSectores) {
            const res = this.makeTree(sector, item);
            if (res) {
                return res;
            }
        }
        return [];
    }


    makeTree(sector, item) {
        if (sector.hijos && sector.hijos.length > 0) {
            for (const sec of sector.hijos) {
                const res = this.makeTree(sec, item);
                if (res) {
                    const r = this.clone(sector);
                    return [r, ...res];
                }
            }
            return null;
        } else {
            if (item.id === sector.id) {
                const r = this.clone(sector);
                return [r];
            } else {
                return null;
            }
        }
    }
    /**
     * Devuelve el nombre del estado de la organizacion pasada por parámetro
     * @param {(boolean | IOrganizacion)} organizacion
     * @returns {string}
     * @memberof OrganizacionService
     */
    getEstado(organizacion: boolean | IOrganizacion): string {
        const estado = (typeof organizacion === 'boolean') ? organizacion : organizacion.activo;
        return estado ? 'Habilitado' : 'No disponible';
    }

    /**
     * Consulta en SISA los datos de la organización con código SISA igual al pasado por parámetro
     * @param {string} cod es el código SISA
     * @returns {Observable<any>}
     * @memberof OrganizacionService
     */
    getOrgSisa(cod: string): Observable<any> {
        return this.server.get(this.organizacionUrl + '/sisa/' + cod);
    }

    getSectoresNombreCompleto(organizacion: IOrganizacion) {
        const sectores = this.getFlatTree(organizacion);
        for (const sector of sectores) {
            const sectorRuta = this.getRuta(organizacion, sector);
            sectorRuta.pop();
            sector['sectorName'] = (sectorRuta.length > 0) ? '(' + [...sectorRuta].reverse().map(s => s.nombre).join(', ') + ')' : '';
        }
        return sectores;
    }
}
