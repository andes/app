import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, scan } from 'rxjs/operators';
import { IDerivacion } from '../interfaces/IDerivacion.interface';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { Auth } from '@andes/auth';
import { OrganizacionService } from 'src/app/services/organizacion.service';

export type IDerivacionFiltros = any;

@Injectable()
export class PuntoInicioService {

    public filtrosSearch = new BehaviorSubject<IDerivacionFiltros>({ skip: 0 });

    public limit = new BehaviorSubject<number>(5);

    // public skip = new BehaviorSubject<number>(0);


    private derivacionesListado$: Observable<IDerivacion[]>;
    public derivacionesFiltradas = new BehaviorSubject<any[]>([]);
    public derivacionesOrdenadas$: Observable<any[]>;

    // --------------------------------------------------------------------


    public sortBehavior = new BehaviorSubject<{ sortBy?: string, sortOrder?: string }>({});

    public sortBy = new BehaviorSubject<string>('fecha');
    public sortOrder = new BehaviorSubject<string>('asc');

    constructor(
        private derivacionesService: DerivacionesService,
        private auth: Auth,
        private organizacionService: OrganizacionService
    ) {

        combineLatest([
            this.filtrosSearch,
            // this.skip,
            this.limit,

            this.organizacionService.getById(this.auth.organizacion.id).pipe(
                map(org => org.esCOM)
            )
        ]).pipe(
            switchMap(([filtros, limit, esCom]) => this.getDerivaciones(filtros, limit, esCom)),
            map(derivaciones => {
                const listado = this.derivacionesFiltradas.getValue();
                this.derivacionesFiltradas.next([...listado, ...derivaciones]);
            })
        ).subscribe();

        this.derivacionesOrdenadas$ = combineLatest(
            this.derivacionesFiltradas,
            this.sortBehavior
        ).pipe(
            map(([derivaciones, sortData]) =>
                this.sortDerivaciones(derivaciones, sortData.sortBy, sortData.sortOrder)
            )
        );
    }

    getListado() {
        return this.derivacionesOrdenadas$;
    }

    getSortCriteria() {
        return this.sortBehavior.asObservable();
    }

    nextPage() {
        // const skip = this.skip.getValue();
        const limit = this.limit.getValue();
        const filtros = this.filtrosSearch.getValue();

        this.filtrosSearch.next({
            ...filtros,
            skip: filtros.skip + limit
        });

        // this.skip.next(skip + limit);
    }

    setFiltros(filtros: IDerivacionFiltros) {
        this.derivacionesFiltradas.next([]);
        filtros.skip = 0;
        this.filtrosSearch.next(filtros);
        // this.skip.next(0);
    }

    setOrder(sortBy: string) {
        const sortData = this.sortBehavior.getValue();
        if (sortData.sortBy === sortBy) {
            this.sortBehavior.next({
                sortBy,
                sortOrder: sortData.sortOrder === 'asc' ? 'desc' : 'asc'
            });
        } else {
            this.sortBehavior.next({
                sortBy,
                sortOrder: 'asc'
            });
        }
    }

    getDerivaciones(params: IDerivacionFiltros, limit: number, esCOM: boolean): Observable<IDerivacion[]> {
        const query: any = {
            cancelada: false,
            skip: params.skip,
            limit
        };

        if (params.estado) {
            query.estado = params.estado.id;
        } else {
            query.estado = '~finalizada';
        }

        if (params.prioridad) {
            query.prioridad = params.prioridad.id;
        }

        if (params.tipo === 'entrantes') {
            query.organizacionDestino = this.auth.organizacion.id;
            if (params.organizacionOrigen) {
                query.organizacionOrigen = params.organizacionOrigen.id;
            }
        } else {
            if (!esCOM) {
                query.organizacionOrigen = this.auth.organizacion.id;
            } else {
                query.organizacionDestino = `~${this.auth.organizacion.id}`;
            }
            if (params.organizacionDestino) {
                query.organizacionDestino = params.organizacionDestino.id;
            }
        }
        if (params.paciente) {
            query.paciente = `^${params.paciente}`;
        }

        return this.derivacionesService.search(query);
    }

    sortDerivaciones(derivaciones, sortBy: string, sortOrder: string) {
        if (sortOrder === 'desc') {
            derivaciones = derivaciones.reverse();
        } else {
            switch (sortBy) {
                case 'fecha':
                    derivaciones = derivaciones.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
                    break;
                case 'paciente':
                    derivaciones = derivaciones.sort((a, b) => a.paciente.apellido.localeCompare((b.paciente.apellido as string)));
                    break;
                case 'origen':
                    derivaciones = derivaciones.sort((a, b) => a.organizacionOrigen.nombre.localeCompare((b.organizacionOrigen.nombre as string)));
                    break;
                case 'destino':
                    derivaciones = derivaciones.sort((a, b) => a.organizacionDestino.nombre.localeCompare((b.organizacionDestino.nombre as string)));
                    break;
                default:
                    derivaciones = derivaciones.sort((a, b) => {
                        if (b.prioridad === sortBy) {
                            return 1;
                        } else if (a.prioridad === sortBy) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;
            }
        }
        return derivaciones;
    }
}
