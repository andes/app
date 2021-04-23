import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { map, switchMap } from 'rxjs/operators';
import { ICiudadano } from '../interfaces/ICiudadano';

@Injectable()
export class InscripcionService extends ResourceBaseHttp {
    // URL to web api
    protected url = '/modules/vacunas/inscripcion-vacunas';
    public pacienteText = new BehaviorSubject<string>(null);
    public gruposSelected = new BehaviorSubject<any[]>(null);
    public localidadSelected = new BehaviorSubject<ILocalidad>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public tieneCertificado = new BehaviorSubject<Boolean>(null);
    public inscriptosFiltrados$: Observable<any[]>;
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;


    constructor(protected server: Server) {
        super(server);
        this.inscriptosFiltrados$ = combineLatest(
            this.pacienteText,
            this.gruposSelected,
            this.localidadSelected,
            this.fechaDesde,
            this.fechaHasta,
            this.tieneCertificado,
            this.lastResults
        ).pipe(
            switchMap(([paciente, grupos, localidad, fechaDesde, fechaHasta, tieneCertificado, lastResults]) => {
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
                if (paciente) {
                    params.paciente = paciente;
                    params.sort = 'apellido nombre';
                }
                if (tieneCertificado) {
                    params.tieneCertificado = true;
                }
                const desdeF = moment(fechaDesde).startOf('day').format();
                const hastaF = moment(fechaHasta).endOf('day').format();
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

    save(ciudadano: ICiudadano): Observable<any> {
        return this.server.post(`${this.url}/registro`, ciudadano);
    }

    patch(inscripcion): Observable<any> {
        return this.server.patch(`${this.url}/${inscripcion.id}`, inscripcion);
    }
}
