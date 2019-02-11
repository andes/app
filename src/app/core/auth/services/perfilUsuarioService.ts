import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IPerfilUsuario } from './../interfaces/IPerfilUsuario';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PerfilUsuarioService {
    readonly perfilUrl = '/core/auth/perfiles';

    constructor(private server: Server) {
    }

    get(params?): Observable<IPerfilUsuario[]> {
        return this.server.get(this.perfilUrl, { params: params });
    }
    putPerfil(perfil: IPerfilUsuario) {
        return this.server.put(this.perfilUrl + '/' + perfil.id, perfil);
    }
    postPerfil(perfil: IPerfilUsuario) {
        return this.server.post(this.perfilUrl, perfil);
    }
    delete(id: any): Observable<any[]> {
        return this.server.delete(this.perfilUrl + '/' + id, id);
    }
}
