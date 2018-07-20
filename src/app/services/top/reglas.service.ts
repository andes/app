import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

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

    // patch(id: String, cambios: any): Observable<any> {
    //     console.log(this.reglaUrl);
    //     return this.server.patch(this.reglaUrl + '/' + id, cambios);
    // }

    save(regla: any): Observable<any> {
        if (regla.id) {
            return this.server.put(this.reglaUrl + '/' + regla.id, regla);
        } else {
            return this.server.post(this.reglaUrl, regla);
        }
    }

}
