import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from './../../../environments/environment';
import { Server } from '@andes/shared';
import { IConfigPrestacion } from './../../interfaces/turnos/IConfigPrestacion';

@Injectable()
export class ConfigPrestacionService {

    private prestacionUrl = '/turnos/prestacion';  // URL to web api
    private configPrestacionUrl = '/turnos/configPrestacion';
    constructor(private server: Server) {
    }

    get(query: string): Observable<any[]> {
        return this.server.get(this.prestacionUrl);
    }

    getConfig(): Observable<any[]> {
        return this.server.get(this.configPrestacionUrl)
    }

    post(prestacion: IConfigPrestacion): Observable<IConfigPrestacion> {
        alert('Reimplementar con Server');
        throw new Error('Reimplementar con Server');
        // let bodyString = JSON.stringify(prestacion); // Stringify payload
        // console.log(bodyString);
        // let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // let options = new RequestOptions({ headers: headers }); // Create a request option
        // return this.http.post(this.configPrestacionUrl, bodyString, options) // ...using post request
        //     .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
        //     .catch(this.handleError); //...errors if any
    }
}
