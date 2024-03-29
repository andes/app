import { Component, Input, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
// Servicios
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
    contactosTelefonicos: IContacto[] = [];
    contactosEmail: IContacto[] = [];
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
    patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;

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
        this.tipoComunicacion.splice(this.tipoComunicacion.length - 1, 1); // eliminamos 'Email'

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
        if (this.paciente?.contacto?.length) {
            this.contactosTelefonicos = this.paciente.contacto.filter(c => c.tipo !== 'email');
            this.contactosEmail = this.paciente.contacto.filter(c => c.tipo === 'email');
        }
        if (!this.paciente?.contacto?.length || !this.contactosTelefonicos.length) {
            this.contactosTelefonicos = [this.contacto];
        }

        if (this.paciente?.direccion?.length) {
            const direccionOriginal = this.paciente.direccion[0];
            if (direccionOriginal.valor) {
                this.direccion.valor = direccionOriginal.valor;
            }
            if (direccionOriginal?.ubicacion?.provincia) {
                this.direccion.ubicacion.provincia = direccionOriginal.ubicacion.provincia;
                this.changeProvincia(this.direccion.ubicacion.provincia);
            }
            if (direccionOriginal?.ubicacion?.localidad) {
                this.direccion.ubicacion.localidad = direccionOriginal.ubicacion.localidad;
            }
        }
    }

    addContacto(key, valor) {
        const indexUltimo = this.contactosTelefonicos.length - 1;

        if (this.contactosTelefonicos[indexUltimo].valor) {
            const nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.contactosTelefonicos.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    changeTipoContacto(indice, keyTipo) {
        if (keyTipo) {
            this.contactosTelefonicos[indice].tipo = keyTipo.id;
            this.disableGuardar = false;
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.contactosTelefonicos.splice(i, 1);
            this.disableGuardar = false;
        }
    }

    // Chequea si existen contactos vacíos y los elimina.
    eliminarContactosVacios() {
        let indice = 0;

        while (indice < this.contactosTelefonicos.length) {
            if (!this.contactosTelefonicos[indice].valor) {
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
            this.paciente.contacto = this.contactosTelefonicos.concat(this.contactosEmail);

            if (this.paciente.direccion?.length) {
                this.paciente.direccion[0] = this.direccion;
            } else {
                this.paciente.direccion = [this.direccion];
            }
            this.pacienteService.save(this.paciente).subscribe();

            this.disableGuardar = true;
            this.plex.toast('success', 'Los cambios han sido guardados.', 'Información');

            if (!this.paciente.contacto.length) {
                this.contactosTelefonicos = [this.contacto];
            }
        } else {
            this.plex.toast('warning', 'Verifique los datos ingresados por favor.', 'Aviso');
        }
    }
}

