import { Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { tap, publishReplay, refCount, switchMap } from 'rxjs/operators';
const shiroTrie = require('shiro-trie');

interface IOrganizacion {
    id: string;
    nombre: string;
}

interface IUsuario {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    nombreCompleto: string;
    username: string;
}

export enum Estado { inProgress, active, logout }

export interface ISession {
    id: string;
    account_id: string;
    organizacion: IOrganizacion;
    permisos: string[];
    profesional: string;
    type: string;
    feature: {
        [key: string]: any
    };
    usuario: IUsuario;
}
@Injectable()
export class Auth {
    private token$ = new Subject<string>();
    private session$: Observable<ISession>;

    private shiro = shiroTrie.new();
    public estado: Estado;
    public usuario: IUsuario;
    public organizacion: IOrganizacion;
    public profesional: string;
    public orgs = [];
    private permisos: string[];


    constructor(private server: Server) {

        this.session$ = this.token$.pipe(
            switchMap(() => {
                return this.server.get('/auth/sesion');
            }),
            tap((payload: any) => {
                this.usuario = payload.usuario;
                this.organizacion = payload.organizacion;
                this.profesional = payload.profesional;
                this.permisos = payload.permisos;
                this.estado = Estado.active;
                this.initShiro();
            }),
            publishReplay(1),
            refCount()
        );

    }

    private initShiro() {
        this.shiro.reset();
        this.shiro.add(this.permisos);
    }

    getToken() {
        return window.sessionStorage.getItem('jwt');
    }

    setToken(token: string) {
        window.sessionStorage.setItem('jwt', token);
        this.token$.next(token);
    }


    login(usuario: string, password: string): Observable<any> {
        return this.server.post('/auth/login', { usuario: usuario, password: password }, { params: null, showError: false }).pipe(
            tap((data) => {
                window.sessionStorage.setItem('jwt', data.token);
                this.estado = Estado.inProgress;
            })
        );
    }

    logout() {
        this.estado = Estado.logout;
        this.usuario = null;
        this.organizacion = null;
        this.permisos = null;
        window.sessionStorage.removeItem('jwt');
    }

    check(string: string): boolean {
        return this.shiro.check(string);
    }

    getPermissions(string: string): string[] {
        return this.shiro.permissions(string);
    }

    loggedIn() {
        return this.estado === Estado.active;
    }

    inProgress() {
        return this.estado === Estado.inProgress;
    }

    session() {
        return this.session$;
    }

    organizaciones(): Observable<any> {
        return this.server.get('/auth/organizaciones').pipe(
            tap((data) => {
                this.orgs = data;
            })
        );
    }

    setOrganizacion(org: any): Observable<any> {
        return this.server.post('/auth/v2/organizaciones', { organizacion: org._id }).pipe(
            tap((data) => {
                this.setToken(data.token);
            })
        );
    }



}