import { CampaniaSaludService } from "./../services/campaniaSalud.service";
import { ICampaniaSalud } from "./../interfaces/ICampaniaSalud";
import { Plex, SelectEvent } from "@andes/plex";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import * as enumerados from '../../../utils/enumerados';

@Component({
    selector: 'campaniaForm',
    templateUrl: 'campania-create-update.html'
})
export class CampaniaFormComponent implements OnInit {
    @Input() campania: ICampaniaSalud;
    @Output() cancel = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<ICampaniaSalud>();
    sexos: any[]
    constructor(private plex: Plex, private campaniaSaludService: CampaniaSaludService) {

    }
    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        // if (!this.campania.activo)
        //     this.campania.activo = true;

    }

    onCancel() {
        this.cancel.emit();
    }

    save($event) {
        if ($event.formValid) {
            console.log(this.campania);

            // juan hizo esta "mersada" porque plex no funciona bien
            let dto: any = {};
            Object.assign(dto, this.campania);
            if (dto.target && dto.target.sexo) {
                dto.target.sexo = dto.target.sexo.id || dto.target.sexo;
            } // fin "mersada"

            (this.campania.id ? this.campaniaSaludService.putCampanias(dto)
                : this.campaniaSaludService.postCampanias(dto)).subscribe(res => {
                    this.plex.info('success', 'Los datos están correctos');
                    this.guardar.emit(this.campania);

                })
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }




    }



}