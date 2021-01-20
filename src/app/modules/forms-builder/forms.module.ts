import { FormResourcesService } from './services/resources.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { NgxObserveModule } from 'ngx-observe';
import { FormsRouting } from './forms.routing';
import { AppFormsCrudComponent } from './components/forms-crud/forms-crud.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { RouterModule } from '@angular/router';
import { FormsResolver } from './resolver/forms.resolver';

@NgModule({
    // prettier-ignore
    declarations: [
        AppFormsCrudComponent,
        FormsListComponent
    ],
    // prettier-ignore
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgxObserveModule,
        PlexModule,
        FormsRouting
    ],
    // prettier-ignore
    providers: [
        FormsResolver,
        FormResourcesService
    ],
    bootstrap: []
})
export class FormBuilderModule { }
