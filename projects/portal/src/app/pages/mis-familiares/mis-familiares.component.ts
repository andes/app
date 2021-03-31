import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'pdp-mis-familiares',
    templateUrl: './mis-familiares.component.html'
})
export class PDPMisFamiliaresComponent {

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute
    ) {

    }

    gotTo() {
        this.router.navigate(['1234'], { relativeTo: this.activeRoute });
    }

}
