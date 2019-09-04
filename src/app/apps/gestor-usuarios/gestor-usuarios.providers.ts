import { NgModule } from '@angular/core';
import { PerfilesHttp } from './services/perfiles.http';
import { Permisos2Service } from './services/permisos.service';
import { UsuariosHttp } from './services/usuarios.http';

@NgModule({
    providers: [
        PerfilesHttp,
        Permisos2Service,
        UsuariosHttp
    ]
})
export class GestorUsuariosProvidersModule {
}
