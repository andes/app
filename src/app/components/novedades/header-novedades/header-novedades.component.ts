import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Mock-data
import { environment } from '../../../../environments/environment';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { RegistroNovedadesService } from '../../../services/novedades/registro-novedades.service';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'header-novedades',
    templateUrl: './header-novedades.component.html'
})

export class HeaderNovedadesComponent implements OnInit {

    public listadoNovedades;
    selectedId: number;
    public fileToken;

    constructor(
        private route: ActivatedRoute,
        private registroNovedades: RegistroNovedadesService,
        public adjuntos: AdjuntosService,
        private router: Router,
        private commonNovedadesService: CommonNovedadesService
    ) {
        this.adjuntos.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
            this.loadNovedades();
        });
    }

    ngOnInit() {

    }

    public loadNovedades() {
        const params: any = {
        };
        this.registroNovedades.getAll(params).subscribe(
            registros => {
                this.listadoNovedades = registros;
            },
            (err) => {
            }
        );
    }

    public formatFecha(fecha: string) {
        return moment(fecha).format('DD/mm/YYYY');
    }

    public getFoto(novedad: any) {
        let imagenes = novedad.imagenes ? novedad.imagenes : [];
        if (imagenes.length > 0) {
            return this.createUrl(imagenes[0]);
        } else {
            return null;
        }
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return 'http:' + apiUri + '/modules/registro-novedades/store/' + doc.id + '?token=' + this.fileToken;
        }
    }

    public onSelectedNovedadChange(novedad) {
        this.commonNovedadesService.setSelectedNovedad(novedad);
        this.router.navigate(['novedades'], { state: { novedad: novedad } });
    }
}
