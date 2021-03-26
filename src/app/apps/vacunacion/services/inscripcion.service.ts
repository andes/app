import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICiudadano } from '../interfaces/ICiudadano';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class InscripcionService {
    // URL to web api
    private inscripcionUrl = '/modules/vacunas/inscripcion-vacunas';
    public documentoText = new BehaviorSubject<string>(null);
    public grupoSelected = new BehaviorSubject<any>(null);
    public localidadSelected = new BehaviorSubject<ILocalidad>(null);
    public inscriptosFiltrados$: Observable<any[]>;
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;

    constructor(private server: Server) {

        this.inscriptosFiltrados$ = combineLatest(
            this.documentoText,
            this.grupoSelected,
            this.localidadSelected,
            this.lastResults
        ).pipe(
            switchMap(([documento, grupo, localidad, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                let params: any = {
                    limit: this.limit,
                    skip: this.skip,
                    fields: '-nroTramite'
                };
                if (grupo) {
                    params.grupo = grupo.nombre;
                }
                if (localidad) {
                    params.localidad = localidad.id;
                }
                if (documento) {
                    params.documento = documento;
                }

                return this.get(params).pipe(
                    map(resultados => {
                        let listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        return listado;
                    })
                );
            })
        );
    }

    search(params): Observable<any> {
        return this.server.get(`${this.inscripcionUrl}/consultas`, { params, showError: false, showLoader: true });
    }

    get(params: any): Observable<any[]> {
        return this.server.get(this.inscripcionUrl, { params: params, showError: true });
    }

    save(ciudadano: ICiudadano): Observable<any> {
        return this.server.post(this.inscripcionUrl, ciudadano);
    }
}
