import { HostBinding, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { CamasService } from '../../../../services/camas.service';

@Component({
    selector: 'camas',
    templateUrl: 'camasListado.html'
})
export class CamasListadoComponent implements OnInit {
    idOrganizacion: any;
    camaSeleccion: any;

    @HostBinding('class.plex-layout') layout = true;

    public camas: any;
    public createUpdate = false;
    constructor(
        public plex: Plex,
        public camasService: CamasService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            this.camasService.getCamas({ idOrganizacion: this.idOrganizacion }).subscribe(camas => {
                this.camas = camas;
            });
        });
    }

    /* TODO: verlo mas que un cancel es un volver atras
     */
    cancel() {
        this.router.navigate(['/tm/organizacion']);
    }

    /*Muestra el create-update para editar una cama
     */
    update(cama) {
        this.camaSeleccion = cama;
        this.createUpdate = true;
    }
    /*Muestra el create-update para crear uno nuevo
     */
    Create() {
        this.camaSeleccion = null;
        this.createUpdate = true;
    }
    /*Recibe el evento que emite el componente create-update
    cama al cancelar para que se muestre la lista de camas de nuevo o bien si
    se guardo devuelve el objeto para actualizar el listado.
    */
    createUpdateCama($event) {
        let indexCama = this.camas.findIndex(cama => cama.id === $event.id);
        if ($event && indexCama === -1) {
            this.camas.push($event);
            this.createUpdate = false;
        } else {
            this.createUpdate = false;
        }
    }
}
