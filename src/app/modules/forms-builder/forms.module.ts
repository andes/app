import { PlexModule } from '@andes/plex';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxObserveModule } from 'ngx-observe';
import { AppFormsCrudComponent } from './components/forms-crud/forms-crud.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { FormsRouting } from './forms.routing';
import { FormsResolver } from './resolver/forms.resolver';
import { FormResourcesService } from './services/resources.service';
import { SelectStaticComponent } from './components/select-static/select-static.component';

@NgModule({
    // prettier-ignore
    declarations: [
        AppFormsCrudComponent,
        FormsListComponent,
        SelectStaticComponent
    ],
    // prettier-ignore
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgxObserveModule,
        PlexModule,
        FormsRouting,
        ScrollingModule
    ],
    // prettier-ignore
    providers: [
        FormsResolver,
        FormResourcesService
    ],
    bootstrap: []
})
export class FormBuilderModule { }
