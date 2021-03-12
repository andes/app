import { Observable } from 'rxjs';
import { IProfesional } from './../interfaces/IProfesional';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Options } from 'projects/shared/src/lib/server/options';

@Injectable()
export class ProfesionalService {

    private profesionalUrl = '/core/tm/profesionales';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Devuelve profesionales
     * @param {any} params Opciones de búsqueda
     */
    get(params: any): Observable<IProfesional[]> {
        params['fields'] = 'id documento nombre apellido';
        return this.server.get(this.profesionalUrl, { params: params, showError: true });
    }

    getProfesional(params: any): Observable<IProfesional[]> {
        return this.server.get(this.profesionalUrl, { params: params, showError: true });
    }

    /**
     * Metodo post. Inserta un nuevo profesional
     * @param {IProfesional} profesional
     */
    post(profesional: IProfesional): Observable<IProfesional> {
        return this.server.post(this.profesionalUrl, profesional); // ...using post request
    }

    getFoto(params: any): Observable<any> {
        return this.server.get(this.profesionalUrl + '/foto/', { params: params });
    }

    saveProfesional(profesionalModel: any) {
        return profesionalModel.id ? this.server.patch(`${this.profesionalUrl}/${profesionalModel.id}`, profesionalModel) : this.server.post(this.profesionalUrl, { profesional: profesionalModel });
    }

    disable(profesional: IProfesional): Observable<IProfesional> {
        alert('Reimplementar con Server');
        throw new Error('Reimplementar con Server');
        // profesional.activo = false;

        // let bodyString = JSON.stringify(profesional); // Stringify payload
        // let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // let options = new RequestOptions({ headers: headers }); // Create a request option
        // return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
        //     .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
        //     .catch(this.handleError); //...errors if any
    }

    enable(profesional: IProfesional): Observable<IProfesional> {
        alert('Reimplementar con Server');
        throw new Error('Reimplementar con Server');
        // profesional.activo = true;
        // let bodyString = JSON.stringify(profesional); // Stringify payload
        // let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // let options = new RequestOptions({ headers: headers }); // Create a request option
        // return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
        //     .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
        //     .catch(this.handleError); //...errors if any
    }

    put(profesional: IProfesional): Observable<IProfesional> {
        alert('Reimplementar con Server');
        throw new Error('Reimplementar con Server');
        // let bodyString = JSON.stringify(profesional); // Stringify payload
        // let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // let options = new RequestOptions({ headers: headers }); // Create a request option
        // return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
        //     .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
        //     .catch(this.handleError); //...errors if any
    }

    validarProfesional(body, options?: Options): Observable<any> {
        return this.server.post(this.profesionalUrl + '/validar', body, options);
    }

    actualizarProfesional(body, options?: Options): Observable<any> {
        return this.server.put(this.profesionalUrl + '/actualizar', body, options);
    }
}
