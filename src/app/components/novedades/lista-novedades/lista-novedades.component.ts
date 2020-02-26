import { CommonNovedadesService } from './../common-novedades.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// Mock-data
import { RegistroNovedadesService } from '../../../services/novedades/registro-novedades.service';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';


@Component({
    selector: 'lista-novedades',
    templateUrl: './lista-novedades.component.html',
})
export class ListaNovedadesComponent implements OnInit {
    selectedId: number;
    public listadoNovedades = [];
    public fileToken;

    constructor(
        private registroNovedades: RegistroNovedadesService,
        public adjuntos: AdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
        private commonNovedadesService: CommonNovedadesService
    ) {
        this.adjuntos.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    ngOnInit() {
        this.loadNovedades();
    }

    verDetalleNovedad() {
        this.router.navigate(['novedades']);
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
    }

}
