import { NgModule } from '@angular/core';
import { PerfilesHttp } from './services/perfiles.http';
import { PermisosService } from './services/permisos.service';
import { UsuariosHttp } from './services/usuarios.http';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';

@NgModule({
    providers: [
        PerfilesHttp,
        PermisosService,
        UsuariosHttp,
        GrupoPoblacionalService
    ]
})
export class GestorUsuariosProvidersModule {
}
