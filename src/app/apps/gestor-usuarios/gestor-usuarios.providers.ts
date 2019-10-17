import { NgModule } from '@angular/core';
import { PerfilesHttp } from './services/perfiles.http';
import { PermisosService } from './services/permisos.service';
import { UsuariosHttp } from './services/usuarios.http';

@NgModule({
    providers: [
        PerfilesHttp,
        PermisosService,
        UsuariosHttp
    ]
})
export class GestorUsuariosProvidersModule {
}
