import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from './auth.service';

@NgModule({
    imports: [CommonModule],
    declarations: [],
    providers: [Auth]
})
export class AuthModule { }
