import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IContacto } from '../../../interfaces/IContacto';
import * as enumerados from './../../../utils/enumerados';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { BarrioService } from '../../../services/barrio.service';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IDireccion } from '../../../core/mpi/interfaces/IDireccion';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { ILocalidad } from '../../../interfaces/ILocalidad';

@Component({
    selector: 'update-contacto-direccion',
    templateUrl: 'update-contacto-direccion.html'
})

export class UpdateContactoDireccionComponent implements OnInit {

    @Input()
    get pac(): IPaciente {
        return this.paciente;
    }
    set pac(value: IPaciente) {
        this.paciente = value;
        this.loadPaciente();
    }

    paciente: IPaciente;
    arrayContactos: IContacto[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    localidadRequerida = true;
    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    disableGuardar = true;
    public soloLectura = false;
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
        this.soloLectura = !this.auth.check('mpi:paciente:patchAndes');

        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.tipoComunicacion.splice(this.tipoComunicacion.length - 1, 1);  // eliminamos 'Email'

        this.loadPaciente();

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

    private loadPaciente() {
        if (this.paciente && this.paciente.contacto && this.paciente.contacto.length) {
            this.arrayContactos = this.paciente.contacto;
        } else {
            this.arrayContactos = [this.contacto];
        }
        if (this.paciente && this.paciente.direccion && this.paciente.direccion.length) {
            let direccionOriginal = this.paciente.direccion[0];
            if (direccionOriginal.valor) {
                this.direccion.valor = direccionOriginal.valor;
            }
            if (direccionOriginal.ubicacion && direccionOriginal.ubicacion.provincia) {
                this.direccion.ubicacion.provincia = direccionOriginal.ubicacion.provincia;
                this.changeProvincia(this.direccion.ubicacion.provincia);
            }
            if (direccionOriginal.ubicacion && direccionOriginal.ubicacion.localidad) {
                this.direccion.ubicacion.localidad = direccionOriginal.ubicacion.localidad;
            }
        }
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
        this.arrayContactos[indice].tipo = keyTipo.id;
        this.disableGuardar = false;
    }

    removeContacto(i) {
        if (i >= 0) {
            this.arrayContactos.splice(i, 1);
            this.disableGuardar = false;
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

    changeProvincia(provincia) {
        this.localidadRequerida = false;
        if (provincia && provincia.id) {
            this.direccion.ubicacion.localidad = null;
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
                if (this.localidades && this.localidades.length) {
                    this.localidadRequerida = true;
                }
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
            this.paciente.direccion[0] = this.direccion;

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

