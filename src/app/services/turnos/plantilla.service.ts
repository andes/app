import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ServerService } from 'andes-shared/src/lib/server.service';

@Injectable()
export class PlantillaService {
    private plantillaUrl = 'http://localhost:3002/api/turnos/plantilla';  // URL to web api

    constructor(private server: ServerService) { }

    get(): Observable<IPlantilla[]> {
        return this.server.get(this.plantillaUrl, null);
    }

    getById(id: String): Observable<IPlantilla[]> {
        return this.server.get(this.plantillaUrl + "/" + id, null);
    }

    post(plantilla: IPlantilla): Observable<IPlantilla> {
        return this.server.post(this.plantillaUrl, plantilla);
    }

    put(plantilla: IPlantilla): Observable<IPlantilla> {
        return this.server.put(this.plantillaUrl + "/" + plantilla.id, plantilla);
    }
}