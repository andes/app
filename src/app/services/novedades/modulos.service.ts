import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { Auth } from '@andes/auth';
import { IModulo } from 'src/app/interfaces/novedades/IModulo.interface';

@Injectable()
export class ModulosService extends ResourceBaseHttp {
    protected url = '/core/tm/modulos';
    constructor(protected server: Server, protected auth: Auth) {
        super(server);
    }


    controlarPermisos(unModulo) {
        if (unModulo.permisos) {
            if (unModulo.permisos.find(p => this.auth.getPermissions(p).length > 0)) {
                return true;
            }
        }
        return false;
    }

}
