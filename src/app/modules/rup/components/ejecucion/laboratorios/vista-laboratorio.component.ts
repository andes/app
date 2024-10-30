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

    public gruposLaboratorio;
    public laboratorios: any = {};
    public resultados;

    public keysGrupos;
    public keysTitulos;

    @Input() protocolo;
    @Input() index: number;

    ngOnInit(): void {
        const id = this.protocolo.data.idProtocolo;

        this.laboratorioService.getByProtocolo(id).subscribe((resultados) => {
            this.gruposLaboratorio = this.groupByTitulo(resultados[0].Data);

            this.keysGrupos = Object.keys(this.gruposLaboratorio);

            this.keysGrupos.forEach(grupo => {
                this.keysTitulos = { ...this.keysTitulos, [grupo]: Object.keys(this.gruposLaboratorio[grupo]) };
            });
        });
    }

    public groupByTitulo(elementos: any): { [key: string]: any[] } {
        const resultado = {};

        elementos.forEach(elemento => {
            if (elemento.esTitulo === 'True') {
                if (!resultado[elemento.grupo]) {
                    resultado[elemento.grupo] = {};
                }

                if (!resultado[elemento.grupo][elemento.item]) {
                    resultado[elemento.grupo][elemento.item] = [];
                }
            } else {
                if (resultado[elemento.grupo]) {
                    for (const titulo in resultado[elemento.grupo]) {
                        resultado[elemento.grupo][titulo].push(elemento);
                    }
                }
            }
        });

        return resultado;
    }

    descargarLab() {
        this.servicioDocumentos.descargarLaboratorio({
            protocolo: this.protocolo,
            usuario: this.auth.usuario.nombreCompleto
        }, 'Laboratorio').subscribe();
    }
}
