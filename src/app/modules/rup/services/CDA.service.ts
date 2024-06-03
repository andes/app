import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server, saveAs } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class CDAService {

    private CDAUrl = '/modules/cda/'; // URL to web api

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

    descargarCDA(params, nombreArchivo: string): Observable<any> {
        return this.download('createInformeCDA', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    download(url, data): Observable<any> {
        return this.server.post(this.CDAUrl + url, data, { responseType: 'blob' } as any);
    }

    /**
     * @param idPaciente
     */
    getCDAList(idPaciente) {
        return this.server.get(this.CDAUrl + 'paciente/' + idPaciente);
    }

    protected extractData(res: Response) {
        return res.blob();
    }

}
