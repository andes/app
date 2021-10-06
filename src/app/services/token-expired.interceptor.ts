import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable()
export class TokenExpiredInterceptor implements HttpInterceptor {
    constructor(
        private plex: Plex,
        private router: Router,
        private auth: Auth
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err) => {
                if (err.status === 401 && err.error === 'Unauthorized') {
                    // Falta un feature de plex para mejorar la UI
                    this.plex.info('danger','', 'La sesión a finalizado!').then((a) => {
                        this.auth.logout();
                        this.router.navigate(['login']).then(() => {
                            window.location.reload();
                        });
                    });
                    return of(null);
                }
                return throwError(err);
            })
        );
    }
}
