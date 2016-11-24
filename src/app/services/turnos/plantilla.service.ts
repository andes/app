import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ServerService } from 'andes-shared/src/lib/server.service';

@Injectable()
export class PlantillaService {
    private plantillaUrl = 'http://localhost:3002/api/turnos/plantilla';  // URL to web api
<<<<<<< HEAD

    constructor(private server: ServerService) { }

    get(): Observable<IPlantilla[]> {
        return this.server.get(this.plantillaUrl, null);
=======
    constructor(private server: ServerService, private http: Http) { }

    // get(params: any): Observable<IPlantilla[]> {
    //    console.log("entro");
    //     return this.server.get(this.plantillaUrl, params)
    //         .map((res: Response) => res.json())
    //         .catch(this.handleError); //...errors if any*/
    // }

    get(params: any): Observable<IPlantilla[]> {
        debugger;
        return this.server.get(this.plantillaUrl, params);
>>>>>>> buscarAgendas
    }

    getById(id: String): Observable<IPlantilla[]> {
        return this.server.get(this.plantillaUrl + "/" + id, null);
    }

    save(plantilla: IPlantilla): Observable<IPlantilla>{
        if (plantilla.id)
            return this.server.put(this.plantillaUrl+ "/" + plantilla.id, plantilla);
        else
            return this.server.post(this.plantillaUrl, plantilla);
    }
}