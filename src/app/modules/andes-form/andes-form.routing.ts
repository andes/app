import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { FormConfigComponent } from './components/form-config/form-config.component';

const routes: Routes = [
    { path: '', component: FormsListComponent, pathMatch: 'full' },
    { path: 'create', component: FormConfigComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class AndesFormsRouting {}
