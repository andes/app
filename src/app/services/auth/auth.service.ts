import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';
@Injectable()
export class AuthService {

    private authUrl = '/auth/';

    constructor(private server: Server) { }

    get(): Observable<any> {
        return this.server.get(this.authUrl + 'organizaciones');
    }

}

