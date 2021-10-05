import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { publishReplay, refCount, skip, switchMap, tap } from 'rxjs/operators';
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
    username: number;
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
        [key: string]: any;
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
    public mobileUser: any;
    private feature: { [key: string]: boolean };


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
                this.feature = payload.feature;
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
        window.sessionStorage.clear();
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

    session(emitOnChange: boolean = false) {
        if (emitOnChange) {
            return this.session$.pipe(skip(1));
        }
        return this.session$;
    }

    private organizaciones$;
    organizaciones(): Observable<any> {
        if (!this.organizaciones$) {
            this.organizaciones$ = this.server.get('/auth/organizaciones').pipe(
                tap((data) => {
                    this.orgs = data;
                }),
                publishReplay(1),
                refCount()
            );
        }
        return this.organizaciones$;
    }

    setOrganizacion(org: any): Observable<any> {
        return this.server.post('/auth/v2/organizaciones', { organizacion: org._id }).pipe(
            tap((data) => {
                this.setToken(data.token);
            })
        );
    }

    // Metodo que invoca a la api para realizar el recovering de la password
    setValidationTokenAndNotify(usuario: Number): Observable<any> {
        return this.server.post('/auth/setValidationTokenAndNotify', { username: usuario }, { showError: false });
    }

    // Método que modifica la contraseña del usuario
    resetPassword(data): Observable<any> {
        return this.server.post('/auth/resetPassword', data, { showError: false });
    }

    featureFlag(name: string): boolean {
        return !!this.feature[name];
    }


    // #################### -------------- RUTAS MOBILE -------------- ####################

    /**
     * Resetea el password del portal de pacientes
     *
     * @param email Email del usuario al cambiar el password
     * @param password Password o codigo de verificación enviado por email (En caso de reseteo de password)
     * @param new_password Nueva password (En caso de reseteo de password)
     */
    mobileLogin(email: string, password: string, new_password?: string): Observable<any> {
        return this.server.post('/modules/mobileApp/login', { email, password, new_password }, { showError: false }).pipe(
            tap((data) => {
                window.sessionStorage.setItem('jwt', data.token);
                window.sessionStorage.setItem('user', JSON.stringify(data.user));
                this.mobileUser = data.user;
                this.estado = Estado.active;
            })
        );
    }

    /**
     * Generar un codigo para reestablecer contraseña y luego
     * enviar un email con el codigo generado
     *
     * @param email Email de la cuenta
     */
    sendCode(email, origen?): Observable<any> {
        return this.server.post('/modules/mobileApp/olvide-password', { email, origen, showError: false });
    }

    /**
         * Resetear el password de un usuario
         *
         * @param email Email del usuario al cambiar el password
         * @param codigo Codigo de verificación enviado por email
         * @param password Nuevo password
         * @param password2 Re ingreso de nuevo password
         */
    resetMobilePassword(email, codigo, password, password2) {
        return this.server.post('/modules/mobileApp/reestablecer-password', { email, codigo, password, password2 });
    }
}
