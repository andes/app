import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-familiares',
    templateUrl: './mis-familiares.component.html',
})
export class MisFamiliaresComponent implements OnInit {

    public selectedId;
    public familiar$;
    public familiares$;

    sidebarValue = 12;
    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.familiares$ = this.prestacionService.getFamiliares();

        // Mostrar listado (familiares, historia, labs)
        this.familiar$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getFamiliar(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }


    selected(familiar) {
        this.nuevoValor();
        familiar.selected = !familiar.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = familiar.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleFamiliar: [this.selectedId] } }]);
        }, 500);
    }
}

