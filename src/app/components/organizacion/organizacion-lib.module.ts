/**
 * Modulo Organizaciones
 * Este modulo es sencillo, para poder modularizar Internación.
 * Posiblemente queden más componentes para traer aca.
 * No debería estar acá situado.
 */

import { SharedModule } from '@andes/shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SectoresItemComponent } from './sectores-item/sectores-item.component';
import { GeorrefMapComponent } from '../../core/mpi/components/georref-map.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        SharedModule
    ],
    declarations: [
        SectoresItemComponent,
        GeorrefMapComponent // Lo mando acá hasta que venga shared como monorepo
    ],
    entryComponents: [
    ],
    exports: [
        SectoresItemComponent,
        GeorrefMapComponent
    ],
})
export class OrganizacionLibModule {
}
