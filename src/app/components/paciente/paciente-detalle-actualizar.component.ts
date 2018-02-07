import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from '../../interfaces/IProvincia';
import { IFinanciador } from '../../interfaces/IFinanciador';
import { LocalidadService } from '../../services/localidad.service';
import { ProvinciaService } from '../../services/provincia.service';
import { BarrioService } from '../../services/barrio.service';
import { PaisService } from '../../services/pais.service';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'paciente-detalle-actualizar',
    templateUrl: 'paciente-detalle-actualizar.html',
    styleUrls: ['paciente-detalle.scss']
})
export class PacienteDetalleActualizarComponent implements OnInit {

    // Constructor
    constructor(
        public paisService: PaisService,
        public provinciaService: ProvinciaService,
        public localidadService: LocalidadService,
        public barrioService: BarrioService,
    ) { }
    /**
     * Recibe un paciente por parámetro
     *
     * @type {IPaciente}
     * @memberof PacienteDetalleActualizarComponent
     */
    @Input() paciente: IPaciente;

    provincias: IProvincia[] = [];
    obrasSociales: IFinanciador[] = [];
    pacientesSimilares = [];
    barriosNeuquen: any[];
    localidadesNeuquen: any[];
    tipoComunicacion: any[];

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    viveEnNeuquen = false;
    viveProvNeuquen = false;

    ngOnInit() {
        // Set País Argentina
        this.paisService.get({
            nombre: 'Argentina'
        }).subscribe(arg => {
            this.paisArgentina = arg[0];
        });

        // Cargamos todas las provincias
        this.provinciaService.get({}).subscribe(rta => {
            this.provincias = rta;
        });

        this.provinciaService.get({
            nombre: 'Neuquén'
        }).subscribe(Prov => {
            this.provinciaNeuquen = Prov[0];
        });

        this.localidadService.get({
            nombre: 'Neuquén'
        }).subscribe(Loc => {
            this.localidadNeuquen = Loc[0];
        });

        // Se cargan los enumerados
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    }


    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                'pais': pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.localidadService.get({ provincia: provincia.id }).subscribe(result => {
                this.localidadesNeuquen = result;
            });
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            this.barrioService.get({
                'localidad': localidad.id,
            }).subscribe(result => {
                this.barriosNeuquen = [...result];
            });
        }
    }

    /**
     * Change del plex-bool viveProvNeuquen
     * carga las localidades correspondientes a Neuquén
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeProvNeuquen(event) {
        if (event.value) {
            this.loadLocalidades(this.provinciaNeuquen);
        } else {
            this.viveEnNeuquen = false;
            this.localidadesNeuquen = [];
        }

    }
    /**
     * Change del plex-bool viveNQN
     * carga los barrios de Neuquén
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadNeuquen(event) {
        if (event.value) {
            this.loadBarrios(this.localidadNeuquen);
        } else {
            this.barriosNeuquen = [];
        }
    }

    addContacto() {
        let nuevoContacto = Object.assign({}, {
            tipo: 'celular',
            valor: '',
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        });
        this.paciente.contacto.push(nuevoContacto);
    }

}
