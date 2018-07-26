import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;


    constructor(private router: Router) { }

    ngAfterViewInit() {
        // this.organizacion = this.auth.organizacion;
    }

    toRUP() {
        this.router.navigate(['estadisticas/ambulatorio']);
    }

    toCITAS() {
        this.router.navigate(['estadisticas/citas']);
    }

}
