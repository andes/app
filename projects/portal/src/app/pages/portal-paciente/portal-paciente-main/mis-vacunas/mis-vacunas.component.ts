import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../../services/prestaciones.service';
import { Router } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
@Component({
    selector: 'pdp-mis-vacunas',
    templateUrl: './mis-vacunas.component.html',
})
export class MisVacunasComponent implements OnInit {

    public selectedId;
    public vacunas$: Observable<any>;
    sidebarValue: number;
    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private router: Router,
        private auth: Auth) { }

    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // Servicios
        this.vacunas$ = this.prestacionService.getVacunas(idPaciente);
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }
    mostrarSidebar() {
        this.prestacionService.actualizarSidebar(true);
    }

    selected(vacuna) {
        this.mostrarSidebar();
        vacuna.selected = !vacuna.selected;
        this.prestacionService.resetOutlet();
        this.cambiaFoco();
        this.nuevoValor();
        setTimeout(() => {
            this.selectedId = vacuna.id;
            this.router.navigate(['home', { outlets: { detalleVacuna: [this.selectedId] } }]);
        }, 500);
    }
}

