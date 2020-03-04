import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { CommonNovedadesService } from '../../common-novedades.service';
import { IRegistroNovedades } from '../../../../interfaces/novedades/IRegistroNovedades.interface';
import { environment } from '../../../../../environments/environment';
import { AdjuntosService } from '../../../../modules/rup/services/adjuntos.service';
import { RegistroNovedadesService } from '../../../../services/novedades/registro-novedades.service';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
})
export class DetalleNovedadComponent implements OnInit {
    novedad$: IRegistroNovedades;
    private fileToken;
    private modulo;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private registroNovedades: RegistroNovedadesService,
        public adjuntos: AdjuntosService,
        private commonNovedadesService: CommonNovedadesService) {
        let novedad;
        if (this.router.getCurrentNavigation().extras.state) {
            novedad = this.router.getCurrentNavigation().extras.state.novedad;
        }
        if (this.router.getCurrentNavigation().extras.state) {
            this.modulo = this.router.getCurrentNavigation().extras.state.modulo;
        }
        this.adjuntos.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
            if (novedad) {
                this.novedad$ = novedad;
            } else {
                this.loadFirstNovedad();
            }
        });

    }

    public loadFirstNovedad() {
        const params: any = {
        };
        if (this.modulo) {
            params.search = this.modulo;
        };
        this.registroNovedades.getAll(params).subscribe(
            registros => {
                this.novedad$ = registros[0];
            },
            (err) => {
            }
        );
    }

    ngOnInit() {
        this.commonNovedadesService.getSelectedNovedad().subscribe((nuevaNovedad) => {
            this.novedad$ = nuevaNovedad;
        });
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
