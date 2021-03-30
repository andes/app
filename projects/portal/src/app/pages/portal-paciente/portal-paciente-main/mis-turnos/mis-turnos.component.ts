import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../../services/prestaciones.service';
import { Router } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
    selector: 'pdp-mis-turnos',
    templateUrl: './mis-turnos.component.html',
})
export class MisTurnosComponent implements OnInit {

    public selectedId;

    public turnos$: Observable<any>;

    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private router: Router,
        private auth: Auth) { }

    ngOnInit(): void {
        // Servicios
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        this.turnos$ = this.prestacionService.getTurnos(idPaciente);
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

    selected(turno) {
        this.mostrarSidebar();
        turno.selected = !turno.selected;
        this.prestacionService.resetOutlet();
        this.cambiaFoco();
        this.nuevoValor();
        setTimeout(() => {
            this.selectedId = turno.id;
            this.router.navigate(['home', { outlets: { detalleTurno: [this.selectedId] } }]);
        }, 500);
    }
}

