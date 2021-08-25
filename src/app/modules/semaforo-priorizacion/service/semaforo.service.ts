import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { cacheStorage, Server } from '@andes/shared';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class SemaforoService {

    private baseURL = '/modules/semaforo';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    findByName(name) {
        return this.server.get(this.baseURL, { params: { name } })
            .pipe(
                map(res => res[0]),
                cacheStorage({ key: `semaforo-${name}` })
            );
    }
}
