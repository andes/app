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
            this.areasLaboratorio = this.agrupar(resultados[0].Data);

        });
    }

    public agrupar(elementos) {
        const setAreas = new Set(elementos.map(d => d.area));
        const areasStr = Array.from(setAreas);

        const areas = [];
        const toItem = (e) => ({
            nombre: e.item,
            esTitulo: e.esTitulo === 'True' ? true : false,
            resultado: e.Resultado || e.resultado,
            unidadMedida: e.UnidadMedida || e.unidadMedida,
            metodo: e.Metodo,
            valorReferencia: e.valorReferencia,
            firma: e.esTitulo === 'True' ? '' : e.userValida
        });

        areasStr.forEach(area => {
            const detallesArea = elementos.filter(d => d.area === area);
            const setGrupos = new Set(detallesArea.map(d => d.grupo));
            const grupos = Array.from(setGrupos);
            const item = {
                area,
                grupos: grupos.map(g => {
                    const detallesAreaGrupo = detallesArea.filter(da => da.grupo === g);
                    const res: any = {};
                    res.grupo = g;
                    if (detallesAreaGrupo.length === 1 && detallesAreaGrupo[0].grupo === g) {
                        res.items = [toItem(detallesAreaGrupo[0])];
                    } else {
                        res.items = detallesAreaGrupo.map(toItem);
                    }

                    return res;
                })
            };
            areas.push(item);
        });
        return areas;
    }

    descargarLab() {
        this.servicioDocumentos.descargarLaboratorio({
            protocolo: this.protocolo,
            usuario: this.auth.usuario.nombreCompleto
        }, 'Laboratorio').subscribe();
    }
}
