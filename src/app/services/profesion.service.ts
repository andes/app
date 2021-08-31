import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';


@Injectable()
export class ProfesionService {
    profesionesURL = '/core/tm/profesiones';

    constructor(private server: Server) {
    }

    get(): Observable<any[]> {
        return this.server.get(this.profesionesURL);
    }
}
