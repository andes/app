import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ConceptObserverService } from './conceptObserver.service';

@Injectable()
export class PlantillasService {

    private url = '/modules/rup/plantillas';  // URL to web api
    private cache = {};
    private cacheSolicitud = {};

    constructor(
        private server: Server,
        public auth: Auth,
        public cos: ConceptObserverService
    ) { }

    get(conceptId: string, esSolicitud: Boolean, force = false): Observable<any> {

        const cache = this.getCache(conceptId, esSolicitud);
        if (cache.getValue() && !force) {
            return cache;
        } else {
            const params = {
                conceptId,
                organizacion: this.auth.organizacion.id,
                profesional: this.auth.profesional,
                esSolicitud
            };
            return this.server.get(this.url, { params }).pipe(map(plantillas => {
                if (plantillas.length > 0) {
                    plantillas = [...plantillas,
                    { title: 'Limpiar', handler: this.limpiarTextoPlantilla(conceptId), descripcion: '' }];
                    cache.next(plantillas.map(p => {
                        return {
                            ...p,
                            label: p.title,
                            handler: this.handlerDropDown(conceptId, p)
                        };
                    }));
                    return plantillas;
                } else {
                    return null;
                }
            }));
        }

    }

    getCache(conceptId: string, esSolicitud: Boolean) {

        if (esSolicitud && !this.cacheSolicitud[conceptId]) {
            this.cacheSolicitud[conceptId] = new BehaviorSubject(null);


        } else {
            if (!esSolicitud && !this.cache[conceptId]) {
                this.cache[conceptId] = new BehaviorSubject(null);
            }
        }
        return esSolicitud ? this.cacheSolicitud[conceptId] : this.cache[conceptId];
    }
    post(data): Observable<any> {
        return this.server.post(`${this.url}`, data);
    }

    patch(plantillaId, data): Observable<any> {
        return this.server.patch(`${this.url}/${plantillaId}`, data);
    }

    delete(plantillaId): Observable<any> {
        return this.server.delete(`${this.url}/${plantillaId}`);
    }

    handlerDropDown(conceptId, plantilla) {
        // debugger;
        const ctid = plantilla.target?.conceptId || conceptId;
        return () => {
            this.cos.notify({ conceptId: ctid } as any, { valor: plantilla.descripcion } as any);
        };
    }


    plantillas(conceptId: string, esSolicitud: boolean) {

        return this.getCache(conceptId, esSolicitud);
    }

    limpiarTextoPlantilla(conceptId) {
        return () => {
            this.cos.notify({ conceptId } as any, { valor: '' } as any);
        };
    }

    // reestablecerTextoOriginal(conceptId) {
    //     return () => {
    //         this.cos.notify({ conceptId } as any, { valor: this.savedText } as any);
    //     };

    // }

}
