import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token: string = localStorage.getItem('huds-token');
        console.log('interceptor: ', token);
        let request = req;
        if (token && req.url.indexOf('rup/prestaciones')) {
            request = req.clone({
                setHeaders: {
                    authorization: `huds-token ${token}`
                }
            });
        }
        return next.handle(request); /*.pipe(
            catchError((err: HttpErrorResponse) => {
                return throwError(err);
            })
        );*/
    }
}
