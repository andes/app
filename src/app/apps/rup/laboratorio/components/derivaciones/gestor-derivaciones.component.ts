import { Router } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { Auth } from '@andes/auth';


@Component({
    selector: 'gestor-derivaciones',
    templateUrl: 'gestor-derivaciones.html'
})

export class LaboratorioDerivacionesComponent implements OnInit {
    accionIndex = 0;
    constructor(
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        if (!this.auth.getPermissions('laboratorio:derivacion:?').length) {
            this.router.navigate(['./inicio']);
        }
    }

    onTabChange($event) {
    }
}

