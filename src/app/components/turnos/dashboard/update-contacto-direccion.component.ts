import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IContacto } from '../../../interfaces/IContacto';
import { IPaciente } from '../../../interfaces/IPaciente';
import * as enumerados from './../../../utils/enumerados';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { PacienteService } from '../../../services/paciente.service';
import { BarrioService } from '../../../services/barrio.service';
import { IDireccion } from '../../../interfaces/IDireccion';

@Component({
    selector: 'update-contacto-direccion',
    templateUrl: 'update-contacto-direccion.html'
})

export class UpdateContactoDireccionComponent implements OnInit {

    @Input() paciente: IPaciente;

    arrayContactos: IContacto[] = [];
    provincias: IProvincia[] = [];
    localidadesNeuquen: any[] = [];
    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    disableGuardar = true;

    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };

    direccion: IDireccion = {
        valor: '',
        codigoPostal: '',
        ubicacion: {
            pais: null,
            provincia: null,
            localidad: null,
            barrio: null,
        },
        ranking: 0,
        geoReferencia: null,
        ultimaActualizacion: new Date(),
        activo: true
    };

    tipoComunicacion: any;
    barriosNeuquen: any[];

    // Inicialización
    constructor(private pacienteService: PacienteService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barrioService: BarrioService,
        public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.tipoComunicacion.splice(this.tipoComunicacion.length - 1, 1);  // eliminamos 'Email'

        if (this.paciente.contacto.length) {
            this.arrayContactos = this.paciente.contacto;
        } else {
            this.arrayContactos = [this.contacto];
        }

        if (this.paciente.direccion[0].valor) {
            this.direccion = this.paciente.direccion[0];
        }

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
    }

    addContacto(key, valor) {
        let indexUltimo = this.arrayContactos.length - 1;

        if (this.arrayContactos[indexUltimo].valor) {
            let nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.arrayContactos.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    changeTipoContacto(indice, keyTipo) {
        // this.arrayContactos[indice].valor = '';
        this.arrayContactos[indice].tipo = keyTipo.id;
        this.disableGuardar = false;
    }

    removeContacto(i) {
        if (i >= 0) {
            this.arrayContactos.splice(i, 1);
        }
    }

    // Chequea si existen contactos vacíos y los elimina.
    eliminarContactosVacios() {
        let indice = 0;

        while (indice < this.arrayContactos.length) {
            if (!this.arrayContactos[indice].valor) {
                this.removeContacto(indice);
            } else {
                indice++;
            }
        }
    }

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
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

    save(valid) {
        if (valid.formValid) {
            this.eliminarContactosVacios();
            this.paciente.contacto = this.arrayContactos;
            this.paciente.direccion = [this.direccion];

            this.pacienteService.save(this.paciente).subscribe();

            this.disableGuardar = true;
            this.plex.toast('success', 'Los cambios han sido guardados.', 'Información');

            if (!this.paciente.contacto.length) {
                this.arrayContactos = [this.contacto];
            }
        } else {
            this.plex.toast('warning', 'Verifique los datos ingresados por favor.', 'Aviso');
        }
    }
}

