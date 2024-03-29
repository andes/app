import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server, cache } from '@andes/shared';
import { BehaviorSubject, zip } from 'rxjs';
import { switchMap, distinctUntilChanged, map, tap, merge } from 'rxjs/operators';
import { query } from '@angular/animations';

const shiroTrie = require('shiro-trie');


@Injectable()
export class PerfilesHttp {
    private searchParams = new BehaviorSubject(null);
    private searchParams$ = this.searchParams.asObservable().pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b) || b.reset)
    );

    private searchReset = new BehaviorSubject(null);
    private searchReset$ = this.searchReset.asObservable();

    public perfiles$;

    private selected = new BehaviorSubject(null);
    public selected$ = this.selected.asObservable();

    private url = '/modules/gestor-usuarios/perfiles'; // URL to web api

    constructor(private server: Server) {

        this.perfiles$ = this.searchParams$
            .pipe(
                merge(this.searchReset$),
                switchMap((query) => {
                    if (!query) {
                        query = { sort: 'nombre', activo: true };
                    }
                    return this.find(query);
                }),
                cache()
            );
    }

    search(query) {
        this.searchParams.next(query);
    }

    reset() {
        this.searchReset.next(0);
    }

    select(id) {
        return this.perfiles$.pipe(
            map((perfiles: any[]) => perfiles.find(p => p.id === id)),
            tap((perfil) => {
                this.selected.next(perfil);
            })
        );
    }

    // *****************************************************************
    save(perfil) {
        if (!perfil.id) {
            return this.create(perfil);
        } else {
            return this.update(perfil.id, perfil);
        }
    }


    get(id): Observable<any> {
        return this.server.get(`${this.url}/${id}`, { showError: false });
    }

    find(query = { activo: true }): Observable<any> {
        return this.server.get(this.url, { params: query });
    }

    create(body): Observable<any> {
        return this.server.post(this.url, body);
    }

    update(id, body): Observable<any> {
        return this.server.patch(`${this.url}/${id}`, body);
    }

    delete(id): Observable<any> {
        return this.server.delete(`${this.url}/${id}`);
    }

    validatePerfil(userPermisos, perfil) {
        const shiro = shiroTrie.new();
        shiro.add(userPermisos);
        return perfil.permisos.every(p => shiro.check(p));
    }

    validatePermiso(permisos, value) {
        const shiro = shiroTrie.new();
        shiro.add(permisos);
        return shiro.check(value);
    }
}
