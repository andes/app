import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppFormsCrudComponent } from './components/forms-crud/forms-crud.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { FormsResolver } from './resolver/forms.resolver';

const routes: Routes = [
    { path: '', component: FormsListComponent, pathMatch: 'full' },
    { path: 'create', component: AppFormsCrudComponent },
    {
        path: ':id',
        component: AppFormsCrudComponent,
        resolve: {
            event: FormsResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class FormsRouting {}
