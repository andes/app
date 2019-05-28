import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html',
    styleUrls: ['./prestamos-hc.scss']
})

export class PrestamosHcComponent implements OnInit {

    recargaPrestamos: any = false;
    recargaSolicitudes: any = false;
    listaCarpetas: any;
    public carpetas;
    public imprimirSolicitudes: any = false;
    public autorizado = false;

    constructor(public auth: Auth, private router: Router) { }

    ngOnInit() {
        this.autorizado = this.auth.check('prestamos:?');
        if (!this.autorizado) {
            this.redirect('inicio');
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    imprimirCarpetas(carpetas) {
        this.carpetas = carpetas;
        this.imprimirSolicitudes = true;
    }

    cancelarImprimir() {
        this.imprimirSolicitudes = false;
    }
}
