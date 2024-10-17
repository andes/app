import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { map, switchMap, auditTime } from 'rxjs/operators';

@Injectable()
export class FarmaciaService extends ResourceBaseHttp {
    protected url = '/core/tm/farmacias';
    public farmaciasFiltradas$: Observable<any[]>;
    public denominacion = new BehaviorSubject<string>(null);
    public razonSocial = new BehaviorSubject<string>(null);
    public cuit = new BehaviorSubject<string>(null);
    public DTResponsable = new BehaviorSubject<string>(null);
    public asociado = new BehaviorSubject<any>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 20;
    private skip;

    constructor(protected server: Server) {
        super(server);
        this.farmaciasFiltradas$ = combineLatest([
            this.denominacion,
            this.razonSocial,
            this.cuit,
            this.DTResponsable,
            this.asociado,
            this.lastResults
        ]).pipe(
            auditTime(0),
            switchMap(([denominacion, razonSocial, cuit, DTResponsable, asociado, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }

                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    return EMPTY;
                }

                const params: any = {
                    limit: this.limit,
                    skip: this.skip
                };

                if (denominacion) {
                    params.denominacion = '^' + (denominacion as string).toUpperCase();
                }

                if (razonSocial) {

                    params.razonSocial = '^' + (razonSocial as string).toUpperCase();
                }

                if (cuit) {
                    params.cuit = '^' + (cuit as string).toUpperCase();
                }

                if (DTResponsable) {
                    params.DTResponsable = '^' + (DTResponsable as string).toUpperCase();
                }
                if (asociado) {
                    params.asociadoA = asociado.nombre;
                }

                return this.search(params).pipe(
                    map(resultados => {
                        const listaFarmacias = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listaFarmacias.length;
                        return listaFarmacias.filter(farm => farm.activo);
                    })
                );
            })
        );
    }


}
