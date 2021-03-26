import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../../services/prestaciones.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
@Component({
    selector: 'pdp-mis-laboratorios',
    templateUrl: 'mis-laboratorios.component.html',
})
export class MisLaboratoriosComponent implements OnInit {

    public selectedId;
    public laboratorio$: Observable<any>;
    public laboratorios$: Observable<any[]>;

    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();
    @Output() eventoSidebar = new EventEmitter<boolean>();
    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth) { }


    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // Servicios
        this.laboratorios$ = this.prestacionService.getLaboratorios(idPaciente);

        // mostrar listado
        this.laboratorio$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getLaboratorio(params.get('id'), idPaciente))
        );
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

    selected(laboratorio) {
        this.mostrarSidebar();
        this.prestacionService.resetOutlet();
        this.cambiaFoco();
        this.nuevoValor();
        setTimeout(() => {
            this.selectedId = laboratorio.cda_id;
            this.router.navigate(['home', { outlets: { detalleLaboratorio: [this.selectedId] } }]);
        }, 300);
    }
}
