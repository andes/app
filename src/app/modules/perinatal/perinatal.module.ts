import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ListadoPerinatalComponent } from './components/listado-perinatal.component';
import { PerinatalRouting } from './perinatal.routing';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        PerinatalRouting,
        InfiniteScrollModule
    ],
    declarations: [
        ListadoPerinatalComponent
    ]
})
export class PerinatalModule { }
