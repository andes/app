import { Injectable } from "@angular/core";
import { Server } from "@andes/shared";
import { Observable } from "rxjs/Observable";


@Injectable()
export class InternacionService {

    private url = '/modules/rup/internaciones';
    constructor(private server: Server) { }


    getInfoCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo', { params: params });
    }

}
