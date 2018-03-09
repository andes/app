import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';


@Injectable()
export class ProcedimientosQuirurgicosService {

    private camasUrl = '/core/tm/procemientosQuirurgicos';  // URL to web api
    constructor(private server: Server) { }

    get(params): Observable<any[]> {
        return this.server.get(this.camasUrl, { params: params, showError: true });
    }


}
