import { Http, Response } from '@angular/http';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
@Injectable()
export class PlantillaService {
    private plantillaUrl = 'http://localhost:3002/api/turnos/plantilla';  // URL to web api
    constructor(private http: Http) { }
    
    get(): Observable<IPlantilla[]> {
        console.log("entro");
       return this.http.get(this.plantillaUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
    }

    getById(id:String): Observable<IPlantilla[]> {
        console.log("entro");
       return this.http.get(this.plantillaUrl+"/"+id)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
    }

    handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}