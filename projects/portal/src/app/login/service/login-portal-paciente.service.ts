
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';
import { tap } from 'rxjs/operators';
@Injectable()
export class LoginService {
    private authUrl = '/modules/mobileApp';
    constructor(private server: Server

    ) {

    }

    login(credentials): Observable<any> {
        return this.server.post(this.authUrl + '/login', credentials, {}).pipe(
            tap((data) => {
                window.sessionStorage.setItem('jwt', data.token);
            })


        );

    }
}




