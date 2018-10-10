import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class CDAService {

    private CDAUrl = '/modules/cda/';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param id, id del archivo CDA // 12948300
     */

    get(id) {
        return this.server.get(this.CDAUrl + id);
    }

    /**
     *
     * @param id, id del archivo CDA // 12948300
     */
    getJson(id) {
        return this.server.get(this.CDAUrl + 'tojson/' + id);
    }

    /**
     *
     */
    post(file, metadata) {
        return this.server.post(this.CDAUrl + 'create/', metadata);
    }

    /**
     * @param idPaciente
     */
    getCDAList(idPaciente) {
        return this.server.get(this.CDAUrl + 'paciente/' + idPaciente);
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    protected extractData(res: Response) {
        return res.blob();
    }

}
