import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PlexModule } from '@andes/plex';
import { GestorUsuariosRouting } from './gestor-usuarios.routing';
import { PerfilListComponent } from './views/perfiles-list.component';
import { PerfilDetailComponent } from './components/perfiles-detail.component';
import { ArbolPermisosItemComponent } from './components/arbol-permisos/arbol-permisos-item.component';
import { ArbolPermisosComponent } from './components/arbol-permisos/arbol-permisos.component';
import { UsuariosListComponent } from './views/usuarios-list.view';
import { UsuariosEditComponent } from './views/usuarios-edit.view';
import { UsuarioDetalleComponent } from './components/usuario-detalle/usuario-detalle.component';


@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        GestorUsuariosRouting
    ],
    declarations: [
        PerfilListComponent,
        PerfilDetailComponent,
        ArbolPermisosComponent,
        ArbolPermisosItemComponent,
        UsuariosListComponent,
        UsuariosEditComponent,
        UsuarioDetalleComponent
    ],
    exports: [],
})
export class GestorUsuariosModule {

}


