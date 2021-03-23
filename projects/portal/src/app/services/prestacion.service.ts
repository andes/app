import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()

export class PrestacionService {

    private previousUrl: string;
    private currentUrl: string;

    // Recupero ultima URL
    public getPreviousUrl() {
        return this.previousUrl;
    }

    // Modifica main ante evento
    private valorInicial = new BehaviorSubject<number>(12);
    valorActual = this.valorInicial.asObservable();

    // Cambia foco ante evento
    private focoInicial = new BehaviorSubject<string>('main');
    focoActual = this.focoInicial.asObservable();

    constructor(private router: Router) {
        this.currentUrl = this.router.url;
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            }
        });
    }


    // Navego a ultima URL
    goTo(path: string[]) {
        this.router.navigate(path);
    }

    actualizarValor(sidebarValue: number) {
        this.valorInicial.next(sidebarValue);
    }

    actualizarFoco(valorFoco: string) {
        this.focoInicial.next(valorFoco);
    }

    // Limpio los ruteos auxiliares
    resetOutlet() {
        this.router.navigate(['home', {
            outlets: {
                detalleHuds: null,
                detalleVacuna: null,
                detalleTurno: null,
                detalleFamiliar: null,
                detallePrescripcion: null,
                detalleLaboratorio: null,
                detalleProblema: null,
                detalleProfesional: null,
                detalleMensaje: null,
            }
        }]);
    }
}
