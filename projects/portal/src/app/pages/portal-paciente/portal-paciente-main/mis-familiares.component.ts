import { Component, OnInit } from '@angular/core';
import { PacientePortalService } from '../../../services/paciente-portal.service';
import { Router } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { map } from 'rxjs/operators';
import { PrestacionService } from '../../../services/prestacion.service';

@Component({
    selector: 'pdp-mis-familiares',
    templateUrl: './mis-familiares.html',
})
export class MisFamiliaresComponent implements OnInit {

    public selectedId;
    public familiar$;
    public familiares$;
    public paciente;

    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private pacienteService: PacientePortalService,
        private prestacionService: PrestacionService,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit(): void {
        this.paciente = this.auth.mobileUser.pacientes[0];
        this.familiares$ = this.pacienteService.getById(this.paciente.id).pipe(
            map(pac => {
                const res = pac.relaciones.map(rel => {
                    rel.id = rel.referencia;
                    delete rel.referencia;
                    return rel;
                });
                return res;
            })
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }

    selected(familiar) {
        this.nuevoValor();
        this.cambiaFoco();
        this.selectedId = familiar.id;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.router.navigate(['home', { outlets: { detalleFamiliar: [this.selectedId] } }]);
        }, 500);
    }
}

