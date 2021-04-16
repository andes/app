import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class InscripcionService extends ResourceBaseHttp {
    // URL to web api
    protected url = '/modules/vacunas/inscripcion-vacunas';
    public documentoText = new BehaviorSubject<string>(null);
    public gruposSelected = new BehaviorSubject<any[]>(null);
    public localidadSelected = new BehaviorSubject<ILocalidad>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public inscriptosFiltrados$: Observable<any[]>;
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;


    constructor(protected server: Server) {

        super(server);

        this.inscriptosFiltrados$ = combineLatest(
            this.documentoText,
            this.gruposSelected,
            this.localidadSelected,
            this.fechaDesde,
            this.fechaHasta,
            this.lastResults
        ).pipe(
            switchMap(([documento, grupos, localidad, fechaDesde, fechaHasta, lastResults]) => {
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
                if (grupos) {
                    params.grupos = grupos;
                }
                if (localidad) {
                    params.localidad = localidad.id;
                }
                if (documento) {
                    params.documento = documento;
                }
                const desdeF = moment(fechaDesde).startOf('day').toDate();
                const hastaF = moment(fechaHasta).endOf('day').toDate();
                if (fechaDesde) {
                    if (fechaHasta) {
                        params.fechaRegistro = `${desdeF}|${hastaF}`;
                    } else {
                        params.fechaRegistro = `>${desdeF}`;
                    }
                } else {
                    if (fechaHasta) {
                        params.fechaRegistro = `<${hastaF}`;
                    }
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
        return this.server.get(`${this.url}/consultas`, { params, showError: false, showLoader: true });
    }

    get(params: any): Observable<any[]> {
        return this.server.get(this.url, { params: params, showError: true });
    }

    patch(inscripcion): Observable<any> {
        return this.server.patch(`${this.url}/${inscripcion.id}`, inscripcion);
    }
}
