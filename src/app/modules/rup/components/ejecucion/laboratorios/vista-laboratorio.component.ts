import { Component, Input, OnInit } from '@angular/core';
import { LaboratorioService } from 'projects/portal/src/app/services/laboratorio.service';
import { DocumentosService } from '../../../../../services/documentos.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'vista-laboratorio',
    templateUrl: 'vista-laboratorio.html',
    styleUrls: ['vista-laboratorio.scss'],
})

export class VistaLaboratorioComponent implements OnInit {

    constructor(
        private laboratorioService: LaboratorioService,
        private servicioDocumentos: DocumentosService,
        private auth: Auth) { }

    public areasLaboratorio = [];
    public laboratorios: any = {};
    public resultados;

    public keysGrupos;
    public keysTitulos;

    @Input() protocolo;
    @Input() index: number;

    ngOnInit(): void {
        const id = this.protocolo.data.idProtocolo;
        this.laboratorioService.getByProtocolo(id).subscribe((resultados) => {
            if (resultados && Array.isArray(resultados) && resultados.length > 0) {
                this.areasLaboratorio = resultados;
            } else {
                this.areasLaboratorio = [];
            }
        });
    }

    descargarLab() {
        this.servicioDocumentos.descargarLaboratorio({
            protocolo: this.protocolo,
            usuario: this.auth.usuario.nombreCompleto
        }, 'Laboratorio').subscribe();
    }
}
