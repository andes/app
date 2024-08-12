import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { IFarmacia } from '../interfaces/IFarmacia';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { map, switchMap, auditTime } from 'rxjs/operators';

@Injectable()
export class FarmaciaService extends ResourceBaseHttp {
    protected url = '/core/tm/farmacias';
    public farmaciasFiltradas$: Observable<any[]>
    public denominacion = new BehaviorSubject<string>(null);
    public razonSocial = new BehaviorSubject<string>(null);
    public cuit = new BehaviorSubject<string>(null);
    public DTResponsable = new BehaviorSubject<string>(null);
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
            this.lastResults
        ]).pipe(
            auditTime(0),
            switchMap(([denominacion, razonSocial, cuit, DTResponsable, lastResults]) => {
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
                    params.denominacion = denominacion;
                }

                if (razonSocial) {
                    params.razon = razonSocial;
                }

                if (cuit) {
                    params.cuit = cuit;
                }

                if (DTResponsable) {
                    params.DTResponsable = DTResponsable;
                }

                return this.search(params).pipe(
                    map(resultados => {
                        const listaFarmacias = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listaFarmacias.length;
                        return listaFarmacias;
                    })
                );
            })
        )
    }


}
