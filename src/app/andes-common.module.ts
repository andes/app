import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { NgDragDropModule } from 'ng-drag-drop';
import { DirectiveLibModule } from './directives/directives.module';
import { MPILibModule } from './modules/mpi/mpi-lib.module';

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
        DirectiveLibModule
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
        NgDragDropModule,
        SharedModule
    ],
})
export class AndesCommonModule { }
