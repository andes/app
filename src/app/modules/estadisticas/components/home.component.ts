import { Component, HostBinding, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    constructor(private router: Router, private plex: Plex, private route: ActivatedRoute) { }

    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Dashboard' }
        ]);
    }

    toRUP() {
        this.router.navigate(['ambulatorio'], { relativeTo: this.route });
    }

    toCITAS() {
        this.router.navigate(['citas'], { relativeTo: this.route });
    }

}
