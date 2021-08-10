import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ReglaService {

    // URL to web api
    private reglaUrl = '/modules/top/reglas';

    constructor(private server: Server) { }

    get(params: any): Observable<any[]> {
        return this.server.get(this.reglaUrl, { params: params, showError: true });
    }

    getById(id: String): Observable<any> {
        return this.server.get(this.reglaUrl + '/' + id, null);
    }

    save(reglas: any): Observable<any> {
        return this.server.post(this.reglaUrl, reglas);
    }

    delete(params: any): Observable<any[]> {
        return this.server.delete(this.reglaUrl, { params: params, showError: true });
    }

    saveRaw(regla: any): Observable<any> {
        if (regla.id) {
            return this.server.patch(this.reglaUrl + '/' + regla.id, regla);
        } else {
            return this.server.post('/modules/top/reglas-v2', regla);
        }
    }
}
