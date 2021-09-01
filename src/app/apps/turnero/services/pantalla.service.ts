import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { tap } from 'rxjs/operators';

@Injectable()
export class PantallaService {

    private baseURL = '/modules/turnero/pantalla'; // URL to web api

    public pantallas = [];

    constructor(private server: Server, public auth: Auth) { }

    list(params = null) {
        return this.server.get(this.baseURL, { params }).subscribe((data) => {
            this.pantallas = data;
        });
    }

    save(pantalla) {
        if (pantalla.id) {
            return this.server.patch(this.baseURL + '/' + pantalla.id, pantalla).pipe(
                tap((p) => {
                    const index = this.pantallas.findIndex((value) => value.id === pantalla.id);
                    if (index >= 0) {
                        this.pantallas.splice(index, 1, p);
                        this.pantallas = [...this.pantallas];
                    }
                }));
        } else {
            return this.server.post(this.baseURL, pantalla).pipe(
                tap((p) => {
                    this.pantallas = [...this.pantallas, p];
                }));
        }
    }

    retoken(pantalla) {
        return this.server.post(this.baseURL + '/' + pantalla.id + '/retoken', {}).pipe(
            tap((p) => {
                const index = this.pantallas.findIndex((value) => value.id === pantalla.id);
                if (index >= 0) {
                    this.pantallas.splice(index, 1, p);
                    this.pantallas = [...this.pantallas];
                }
            }));
    }

    remove(pantalla) {
        return this.server.delete(this.baseURL + '/' + pantalla.id).pipe(
            tap(() => {
                const index = this.pantallas.findIndex((value) => value.id === pantalla.id);
                if (index >= 0) {
                    this.pantallas.splice(index, 1);
                    this.pantallas = [...this.pantallas];
                }
            }));
    }

}
