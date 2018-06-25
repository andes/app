import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { ObraSocialService } from './../../services/obraSocial.service';
import { ProfeService } from './../../services/profe.service';
import { ArrayType } from '@angular/compiler/src/output/output_ast';
import { NgModel } from '@angular/forms';
import { PacienteService } from './../../services/paciente.service';

@Component({
    selector: 'puco',
    templateUrl: 'puco.html',
    // styleUrls: ['puco.css']
})

export class PucoComponent implements OnInit, OnDestroy {

    public loading = false;
    public errorSearchTerm = false; // true si se ingresan caracteres alfabeticos
    public usuarios: ArrayType[];
    private resPuco: ArrayType[];
    private resProfe: ArrayType[];
    private timeoutHandle: number; ;
    @Input() autofocus: Boolean = true;

    // termino a buscar ..
    public searchTerm: String = '';

    // ultima request que se almacena con el subscribe
    private lastRequest: ISubscription;

    constructor(
        private obraSocialService: ObraSocialService,
        private profeService: ProfeService,
        private auth: Auth,
        private plex: Plex) { }

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
        // Se limpian los resultados de la busqueda anterior
        this.usuarios = [];

        if (this.searchTerm && /^([0-9])*$/.test(this.searchTerm.toString())) {

            this.loading = true;
            this.errorSearchTerm = false;
            let search = this.searchTerm.trim();

            this.timeoutHandle = window.setTimeout(() => {
                this.timeoutHandle = null;

                Observable.forkJoin([
                    this.obraSocialService.get({ dni: search }),
                    this.profeService.get({ dni: search })]).subscribe(t => {
                        this.loading = false;
                        this.resPuco = t[0];
                        this.resProfe = t[1];

                        if (this.resPuco) {
                            this.usuarios = this.resPuco;
                        }
                        if (this.resProfe) {
                            if (this.resPuco) {
                                this.usuarios = this.resPuco.concat(this.resProfe);
                            } else {
                                this.usuarios = this.resProfe;
                            }
                        }
                    });
            }, err => {
                this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
            }, 200);
        } else {
            if (this.searchTerm) {
                this.errorSearchTerm = true;
                // this.searchTerm = this.searchTerm.substr(0, this.searchTerm.length - 1);
            }
        }
    }
}
