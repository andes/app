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
    // savedText: any;
    constructor(private server: Server, public auth: Auth, public cos: ConceptObserverService) { }

    get(conceptId, force = false): Observable<any> {

        if (!this.cache[conceptId]) {
            this.cache[conceptId] = new BehaviorSubject(null);
        }
        if (this.cache[conceptId].getValue() && !force) {
            return this.cache[conceptId];
        } else {
            const params = {
                conceptId,
                organizacion: this.auth.organizacion.id,
                profesional: this.auth.profesional
            };
            return this.server.get(this.url, { params }).pipe(map(plantillas => {
                if (plantillas.length > 0) {
                    plantillas = [...plantillas,
                    { title: 'Limpiar', handler: this.limpiarTextoPlantilla(conceptId), descripcion: '' }];
                    this.cache[conceptId].next(plantillas.map(p => {
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
        // this.savedText = plantilla.decripcion;
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
