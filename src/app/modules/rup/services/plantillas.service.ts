import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { Cache } from '@andes/shared';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ConceptObserverService } from './conceptObserver.service';

@Injectable()
export class PlantillasService {

    private url = '/modules/rup/plantillas';  // URL to web api
    private cache = {};
    constructor(private server: Server, public auth: Auth, public cos: ConceptObserverService) { }

    get(conceptId): Observable<any> {

        if (!this.cache[conceptId]) {
            this.cache[conceptId] = new BehaviorSubject(null);
        }
        if (this.cache[conceptId].getValue()) {
            return this.cache[conceptId];
        } else {
            const params = {
                conceptId,
                organizacion: this.auth.organizacion.id,
                profesional: this.auth.profesional && this.auth.profesional.id
            };
            return this.server.get(this.url, { params }).pipe(map(plantillas => {
                this.cache[conceptId].next(plantillas.map(p => {
                    return {
                        ...p,
                        label: p.title,
                        handler: this.handlerDropDown(conceptId, p)
                    };
                }));
                return plantillas;
            }));
        }

    }

    handlerDropDown(conceptId, plantilla) {
        return () => {
            this.cos.notify({ conceptId } as any, { valor: plantilla.descripcion } as any);
        };
    }


    plantillas(conceptId) {
        if (!this.cache[conceptId]) {
            this.cache[conceptId] = new BehaviorSubject(null);
        }
        return this.cache[conceptId];
    }

}
