import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PerfilListComponent } from './views/perfiles-list.component';
import { PerfilDetailComponent } from './components/perfiles-detail.component';
import { UsuariosListComponent } from './views/usuarios-list.view';
import { UsuariosEditComponent } from './views/usuarios-edit.view';

let routes = [
    {
        path: 'perfiles',
        component: PerfilListComponent,
        children: [
            { path: ':id', component: PerfilDetailComponent }
        ]
    },
    { path: 'usuarios', component: UsuariosListComponent },
    { path: 'usuarios/:id', component: UsuariosEditComponent }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class GestorUsuariosRouting { }
