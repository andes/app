import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { IProfesional } from './../interfaces/IProfesional';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Options } from 'projects/shared/src/lib/server/options';
import { auditTime, map, switchMap } from 'rxjs/operators';

@Injectable()
export class ProfesionalService {

    private profesionalUrl = '/core/tm/profesionales'; // URL to web api
    public profesionalesFiltrados$: Observable<IProfesional[]>;
    public documento = new BehaviorSubject<string>(null);
    public apellido = new BehaviorSubject<string>(null);
    public nombre = new BehaviorSubject<string>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;

    constructor(private server: Server) {

        this.profesionalesFiltrados$ = combineLatest(
            this.documento,
            this.apellido,
            this.nombre,
            this.lastResults
        ).pipe(
            auditTime(0),
            switchMap(([documento, apellido, nombre, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                const params: any = {
                    limit: this.limit,
                    skip: this.skip
                };
                if (documento) {
                    params.documento = documento;
                }
                if (apellido) {
                    params.apellido = apellido;
                }

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
         * Metodo get. Devuelve profesionales
         * @param {any} params Opciones de búsqueda
         */
    get(params: any): Observable<IProfesional[]> {
        return this.server.get(this.profesionalUrl, { params: params, showError: true });
    }

    getByID(id: String): Observable<IProfesional[]> {
        return this.server.get(`${this.profesionalUrl}/${id}`);
    }

    getFirma(params: any): Observable<any> {
        return this.server.get(this.profesionalUrl + '/firma', { params: params });
    }

    getFoto(params: any): Observable<any> {
        return this.server.get(this.profesionalUrl + '/foto/', { params: params });
    }

    /**
     * Metodo post. Inserta un nuevo profesional
     * @param {IProfesional} profesional
     */
    post(profesional: IProfesional): Observable<IProfesional> {
        return this.server.post(this.profesionalUrl, profesional); // ...using post request
    }

    saveFirma(firma) {
        return this.post(firma);
    }

    saveProfesional(profesionalModel: any) {
        return profesionalModel.id ? this.server.patch(`${this.profesionalUrl}/${profesionalModel.id}`, profesionalModel) : this.server.post(this.profesionalUrl, { profesional: profesionalModel });
    }

    validarProfesional(body): Observable<any> {
        return this.server.post(this.profesionalUrl + '/validar', body);
    }

    actualizarProfesional(body, options?: Options): Observable<any> {
        return this.server.put(this.profesionalUrl + '/actualizar', body, options);
    }
}
