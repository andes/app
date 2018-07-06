import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class PantallaService {

    private baseURL = '/modules/turnero/pantalla';  // URL to web api

    public get selected () {
        if (!this._select) {
            this._select = this.pantallas.find((item) => item.id === this._selectID);
            if (this._select) {
                this._select = JSON.parse(JSON.stringify(this._select));
                if (!this._select.espaciosFisicos) {
                    this._select.espaciosFisicos = [];
                }
                return this._select;
            }
            return null;
        }
        return this._select;
    }
    public pantallas = [];

    private _selectID = null;
    private _select = null;

    constructor(private server: Server, public auth: Auth) { }

    select(id) {
        this._select = null;
        this._selectID = id;
    }

    list (params = null) {
        return this.server.get(this.baseURL, { params }).subscribe((data) => {
            this.pantallas = data;
        });
    }

    get (id) {
        return this.server.get(this.baseURL + id);
    }

    save (pantalla) {
        if (pantalla.id) {
            return this.server.patch(this.baseURL + '/' + pantalla.id, pantalla).do((p) => {
                let index = this.pantallas.findIndex((value) => value.id === pantalla.id );
                if (index >= 0) {
                    this.pantallas.splice(index, 1, p);
                    this.pantallas = [...this.pantallas];
                }
            });
        } else {
            return this.server.post(this.baseURL, pantalla).do((p) => {
                this.pantallas = [...this.pantallas, p];
            });
        }
    }

    retoken (pantalla) {
        return this.server.post(this.baseURL + '/' + pantalla.id + '/retoken' , {}).do((p) => {
            let index = this.pantallas.findIndex((value) => value.id === pantalla.id );
            if (index >= 0) {
                this.pantallas.splice(index, 1, p);
                this.pantallas = [...this.pantallas];
            }
        });
    }

    remove (pantalla) {
        return this.server.delete(this.baseURL + '/' + pantalla.id).do(() => {
            let index = this.pantallas.findIndex((value) => value.id === pantalla.id );
            if (index >= 0) {
                this.pantallas.splice(index, 1);
                this.pantallas = [...this.pantallas];
            }
        });
    }


    getEspacios (params: any) {
        return this.server.get('/modules/turnos/espacioFisico', { params: params, showError: true });
    }

}
