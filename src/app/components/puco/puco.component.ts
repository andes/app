import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { ObraSocialService } from './../../services/obraSocial.service';
import { ArrayType } from '@angular/compiler/src/output/output_ast';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'puco',
    templateUrl: 'puco.html',
    // styleUrls: ['puco.css']
})

export class PucoComponent implements OnInit, OnDestroy {

    public loading = false;
    public usuarios: ArrayType[];
    private timeoutHandle: number;
    @Input() autofocus: Boolean = true;

    // termino a buscar ..
    public searchTerm: String = '';

    // ultima request que se almacena con el subscribe
    private lastRequest: ISubscription;

    constructor(private obraSocialService: ObraSocialService, private auth: Auth, private plex: Plex) {
    }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
    }
    ngOnInit() {
    }

    buscar(): void {

        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        let search = this.searchTerm.trim();
        if (/^([0-9])*$/.test(search)) {
            this.timeoutHandle = window.setTimeout(() => {

                let apiMethod = Observable.forkJoin([
                    this.obraSocialService.getPuco({ dni: search }),
                    this.obraSocialService.getProFe({ dni: search })]).subscribe(t => {
                        let resultadosPuco = t[0];
                        let resultadosProFE = t[1];
                        this.usuarios = resultadosPuco.concat(resultadosProFE);
                        let idTimeOut = this.timeoutHandle;

                        if (this.lastRequest) {
                            this.lastRequest.unsubscribe();
                        }
                    });

            }, err => {
                this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
            }, 600);
        }
    }
}
