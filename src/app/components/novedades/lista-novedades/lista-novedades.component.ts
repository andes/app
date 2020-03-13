import { CommonNovedadesService } from './../common-novedades.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// Mock-data
import { NovedadesService } from '../../../services/novedades/novedades.service';
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
    private modulo;

    constructor(
        private registroNovedades: NovedadesService,
        public adjuntos: AdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
        private commonNovedadesService: CommonNovedadesService
    ) {
        this.adjuntos.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
        if (this.router.getCurrentNavigation().extras.state) {
            this.modulo = this.router.getCurrentNavigation().extras.state.modulo;
        }
    }

    ngOnInit() {
        this.loadNovedades();
    }

    verDetalleNovedad() {
        this.router.navigate(['novedades']);
    }

    public loadNovedades() {
        let params: any = {
        };
        if (this.modulo) {
            params.search = this.modulo;
        }
        this.registroNovedades.get(params).subscribe(
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
