import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { LaboratorioService } from 'src/app/services/laboratorio.service';
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
        private cd: ChangeDetectorRef,
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
        this.laboratorioService.getProtocoloById(id).subscribe((resultados) => {
            if (resultados && Array.isArray(resultados) && resultados.length > 0) {
                this.areasLaboratorio = resultados;
                this.chequearResultado(this.areasLaboratorio);
            } else {
                this.areasLaboratorio = [];
            }
            this.cd.markForCheck();
        });
    }

    descargarLab() {
        this.servicioDocumentos.descargarLaboratorio({
            protocolo: this.protocolo,
            usuario: this.auth.usuario.nombreCompleto
        }, 'Laboratorio').subscribe();
    }
    chequearResultado(areasLaboratorio) {
        areasLaboratorio?.forEach(area =>
            area.grupos?.forEach(grupo => {
                if (grupo.item) {
                    this.limpiarSiEsDerivacion(grupo.item);
                }
                grupo.items?.forEach(item => this.limpiarSiEsDerivacion(item));
            })
        );
    }

    private limpiarSiEsDerivacion(item: any): void {
        const PATRON_DERIVACION = /^\s*(derivado|recibido en)/i;
        const resultado = item?.resultado || '';

        if (PATRON_DERIVACION.test(resultado)) {
            item.unidadMedida = '';
            item.valorReferencia = '';
            item.metodo = '';
            item.fechaHoraValida = '';
            item.firma = '';
        }
    }

}
