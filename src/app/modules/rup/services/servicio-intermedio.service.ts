import { cacheStorage, clearCacheStorage, ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { IServicioIntermedio, IServicioIntermedioSearchParams } from '../../../interfaces/IServicioIntermedio';
import { normalizeServicioIntermedioFromApi } from '../../../interfaces/servicio-intermedio.normalize';

/** Clave compartida con {@link cacheStorage} en {@link ServicioIntermedioService#getAll}. */
export const SERVICIO_INTERMEDIO_CACHE_KEY = 'servicio-intermedio';

@Injectable({ providedIn: 'root' })
export class ServicioIntermedioService extends ResourceBaseHttp<IServicioIntermedio> {
    protected url = '/core/tm/servicios-intermedio';

    constructor(protected server: Server) {
        super(server);
    }

    /**
     * Listado completo cacheado en `sessionStorage` (mapa, directivas, pipes).
     * Tras mutaciones usar {@link search} sin cache o confiar en la invalidación en {@link create}/{@link update}/{@link delete}.
     */
    getAll(): Observable<IServicioIntermedio[]> {
        return super.search({}).pipe(
            map(list => list.map(normalizeServicioIntermedioFromApi)),
            cacheStorage({ key: SERVICIO_INTERMEDIO_CACHE_KEY })
        );
    }

    /**
     * Listado con filtros y paginación; **no** usa la misma cache que {@link getAll} (adecuado para pantallas TM).
     */
    search(params?: IServicioIntermedioSearchParams): Observable<IServicioIntermedio[]> {
        return super.search(params ?? {}).pipe(
            map(list => list.map(normalizeServicioIntermedioFromApi))
        );
    }

    get(id: string): Observable<IServicioIntermedio> {
        return super.get(id).pipe(map(normalizeServicioIntermedioFromApi));
    }

    create(body: Partial<IServicioIntermedio>): Observable<IServicioIntermedio> {
        return super.create(body).pipe(
            map(normalizeServicioIntermedioFromApi),
            tap(() => clearCacheStorage(SERVICIO_INTERMEDIO_CACHE_KEY))
        );
    }

    update(id: string, body: Partial<IServicioIntermedio>): Observable<IServicioIntermedio> {
        return super.update(id, body).pipe(
            map(normalizeServicioIntermedioFromApi),
            tap(() => clearCacheStorage(SERVICIO_INTERMEDIO_CACHE_KEY))
        );
    }

    delete(id: string): Observable<any> {
        return super.delete(id).pipe(
            tap(() => clearCacheStorage(SERVICIO_INTERMEDIO_CACHE_KEY))
        );
    }
}
