import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NovedadesService } from '../../services/novedades/novedades.service';
import { AdjuntosService } from '../../modules/rup/services/adjuntos.service';
import { CommonNovedadesService } from './common-novedades.service';
import { Router } from '@angular/router';

@Component({
    selector: 'novedades',
    templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {
    public listadoNovedades = [];
    public fileToken;
    public novedadSeleccionada;

    constructor(
        private registroNovedades: NovedadesService,
        public adjuntos: AdjuntosService,
        private router: Router,
        private commonNovedadesService: CommonNovedadesService) {
        this.adjuntos.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }


    ngOnInit() {
        this.loadNovedades();
    }

    public loadNovedades() {
        const params: any = {
        };
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



}
