import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-documentos',
    templateUrl: './mis-documentos.component.html',
})
export class MisDocumentosComponent implements OnInit {

    public selectedId;
    public documento$;
    public documentos$;

    sidebarValue = 12;
    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.documentos$ = this.prestacionService.getDocumentos();

        // Mostrar listado (profesionales, historia, labs)
        this.documento$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getDocumento(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(12);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }

    selected(documento) {
        this.nuevoValor();
        this.cambiaFoco();

        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = documento.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleDocumento: [this.selectedId] } }]);
        }, 500);
    }
}

