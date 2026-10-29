import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { DndModule } from 'ngx-drag-drop';
import { DirectiveLibModule } from './directives/directives.module';
import { MPILibModule } from './modules/mpi/mpi-lib.module';
import { AndesAppSharedModule } from './shared/andes-app-shared.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        ScrollingModule,
        CdkTableModule,
        HammerModule,
        DirectiveLibModule,
        AndesAppSharedModule
    ],
    exports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        HammerModule,
        CdkTableModule,
        DirectiveLibModule,
        MPILibModule,
        ScrollingModule,
        DndModule,
        SharedModule,
        AndesAppSharedModule
    ],
})
export class AndesCommonModule { }
