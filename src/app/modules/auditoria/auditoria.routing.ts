
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { AuditoriaModule } from './auditoria.module';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';

import { AuditoriaComponent } from './component/auditoria.component';

export const AuditoriaRoutes: Routes = [
    { path: '', component: AuditoriaComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        InfiniteScrollModule,
        AuditoriaModule,
        MPILibModule,
        RouterModule.forChild(AuditoriaRoutes)
    ],
    providers: [],
    declarations: [
        AuditoriaComponent
    ]
})
export class AuditoriaRouting { }
