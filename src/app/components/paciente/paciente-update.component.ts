import {
    IDireccion
} from './../../interfaces/IDireccion';
import {
    FinanciadorService
} from './../../services/financiador.service';
import {
    IBarrio
} from './../../interfaces/IBarrio';
import {
    ILocalidad
} from './../../interfaces/ILocalidad';
import {
    IPais
} from './../../interfaces/IPais';
import {
    IFinanciador
} from './../../interfaces/IFinanciador';
import {
    Observable
} from 'rxjs/Rx';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';

import {
    BarrioService
} from './../../services/barrio.service';
import {
    LocalidadService
} from './../../services/localidad.service';
import {
    ProvinciaService
} from './../../services/provincia.service';
import {
    PaisService
} from './../../services/pais.service';
import {
    PacienteService
} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';

import {
    IPaciente
} from './../../interfaces/IPaciente';
import {
    IProvincia
} from './../../interfaces/IProvincia';

@Component({
    selector: 'paciente-update',
    templateUrl: 'paciente-update.html'
})
export class PacienteUpdateComponent implements OnInit {

    @Output() data: EventEmitter < IPaciente > = new EventEmitter < IPaciente > ();
    @Input('selectedPaciente') pacienteHijo: IPaciente;

    updateForm: FormGroup;
    estados = [];
    sexos = [];
    generos = [];
    relacionTutores = [];
    estadosCiviles = [];
    tiposContactos = [];
    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    todasProvincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    todasLocalidades: ILocalidad[] = [];
    showCargar: boolean = false;
    error: boolean = false;
    mensaje: string = "";


    barrios: IBarrio[] = [];
    obrasSociales: IFinanciador[] = [];
    pacRelacionados = [];
    direccion = [];
    myPais: IPais;
    myProvincia: any;
    myLocalidad: any;

    constructor(private formBuilder: FormBuilder, private PaisService: PaisService,
        private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService,
        private BarrioService: BarrioService, private pacienteService: PacienteService,
        private financiadorService: FinanciadorService) {}

    ngOnInit() {

        //CArga de combos
        this.PaisService.get().subscribe(resultado => this.paises = resultado);
        this.ProvinciaService.get("").subscribe(resultado => this.todasProvincias = resultado);
        this.LocalidadService.get("").subscribe(resultado => this.todasLocalidades = resultado);
        this.financiadorService.get().subscribe(resultado => this.obrasSociales = resultado);

        this.showCargar = false;
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();
        this.relacionTutores = enumerados.getRelacionTutor();

        this.updateForm = this.formBuilder.group({
            id: [this.pacienteHijo.id],
            nombre: [this.pacienteHijo.nombre],
            apellido: [this.pacienteHijo.apellido],
            alias: [this.pacienteHijo.alias],
            documento: [this.pacienteHijo.documento],
            fechaNacimiento: [this.pacienteHijo.fechaNacimiento],
            estado: [this.pacienteHijo.estado],
            sexo: [this.pacienteHijo.sexo],
            genero: [this.pacienteHijo.genero],
            estadoCivil: [this.pacienteHijo.estadoCivil],
            contacto: this.formBuilder.array([]),
            direccion: this.formBuilder.array([]),
            financiador: this.formBuilder.array([]),
            relaciones: this.formBuilder.array([]),
            activo: [true]
        });

        this.pacienteHijo.contacto.forEach(element => {
            this.addContacto(element);
        });

        this.pacienteHijo.financiador.forEach(element => {
            this.addFinanciador(element);
        });

        this.pacienteHijo.direccion.forEach(element => {
            this.addDireccion(element);
        });

        this.pacienteHijo.relaciones.forEach(element => {
            this.addRelacion(element);
        });

    }

    iniDireccion(unaDireccion ? : IDireccion) {
        // Inicializa contacto
        debugger;
        if (unaDireccion) {
            if (unaDireccion.ubicacion) {
                if (unaDireccion.ubicacion.pais) {
                    this.myPais = unaDireccion.ubicacion.pais;
                    if (unaDireccion.ubicacion.provincia) {
                        this.provincias = this.todasProvincias.filter((p) => p.pais.id == this.myPais.id);
                        this.myProvincia = unaDireccion.ubicacion.provincia;
                        if (unaDireccion.ubicacion.localidad) {
                            this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == this.myProvincia.id);
                            this.myLocalidad = unaDireccion.ubicacion.localidad;
                        }
                    }
                }
            }

            return this.formBuilder.group({
                valor: [unaDireccion.valor],
                ubicacion: this.formBuilder.group({
                    pais: [this.myPais],
                    provincia: [this.myProvincia],
                    localidad: [this.myLocalidad]
                }),
                ranking: [unaDireccion.ranking],
                codigoPostal: [unaDireccion.codigoPostal],
                ultimaActualizacion: [unaDireccion.ultimaActualizacion],
                activo: [unaDireccion.activo]
            })
        } else {
            return this.formBuilder.group({
                valor: [''],
                ubicacion: this.formBuilder.group({
                    pais: [''],
                    provincia: [''],
                    localidad: ['']
                }),
                ranking: [],
                codigoPostal: [''],
                ultimaActualizacion: [''],
                activo: [true]
            })
        }
    }

    iniContacto(unContacto ? ) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();

        if (unContacto) {
            return this.formBuilder.group({
                tipo: [unContacto.tipo],
                valor: [unContacto.valor],
                ranking: [unContacto.ranking],
                ultimaActualizacion: [unContacto.ultimaActualizacion],
                activo: [unContacto.activo]
            })
        } else {
            const control = this.updateForm.value.contacto;
            return this.formBuilder.group({
                tipo: [''],
                valor: [''],
                ranking: [control.lenght],
                ultimaActualizacion: [''],
                activo: [true]
            })
        }
    }

    iniFinanciador(unFinanciador ? ) {
        // form Financiador u obra Social
        let cant = 0;
        let fecha = new Date();
        if(unFinanciador){
            return this.formBuilder.group({
                entidad: [unFinanciador.entidad],
                ranking: [unFinanciador.ranking],
                fechaAlta: [unFinanciador.fechaAlta],
                fechaBaja: [unFinanciador.fechaBaja],
                activo: [unFinanciador.activo]
            });
        }else{
            return this.formBuilder.group({
            entidad: [''],
            ranking: [''],
            fechaAlta: [''],
            fechaBaja: [''],
            activo: ['']
        });  
        }
    }

    iniRelacion(unaRelacion ? ) {
        debugger;
        if (unaRelacion) {
            return this.formBuilder.group({
                relacion: [unaRelacion.relacion],
                referencia: [unaRelacion.referencia],
                apellido: [unaRelacion.apellido],
                nombre: [unaRelacion.nombre],
                documento: [unaRelacion.documento]
            });
        } else {
            return this.formBuilder.group({
                relacion: [''],
                referencia: [''],
                apellido: [''],
                nombre: [''],
                documento: ['']
            });
        }
    }

    addContacto(unContacto ? ) {
        // agrega formMatricula 
        const control = < FormArray > this.updateForm.controls['contacto'];
        control.push(this.iniContacto(unContacto));
    }

    removeContacto(i: number) {
        // elimina formMatricula
        const control = < FormArray > this.updateForm.controls['contacto'];
        control.removeAt(i);
    }

    addDireccion(unaDireccion ? ) {
        debugger;
        // agrega formMatricula 
        const control = < FormArray > this.updateForm.controls['direccion'];
        control.push(this.iniDireccion(unaDireccion));
    }

    onSave(model: IPaciente, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let operacionPac: Observable < IPaciente > ;
            operacionPac = this.pacienteService.put(model);

            operacionPac.subscribe(resultado => {
              this.data.emit(resultado)
            });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        this.data.emit(null)
    }


    filtrarProvincias(indexPais: number, i: number) {
        debugger;
        // const control = <FormGroup> this.updateForm.value.direccion[i].ubicacion;
        // control.setValue({provincia:null});
        var pais = this.paises[(indexPais)];
        this.provincias = this.todasProvincias.filter((p) => p.pais.id == pais.id);
    }

    filtrarLocalidades(indexProvincia: number) {
        var provincia = this.provincias[(indexProvincia)];
        this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == provincia.id);
    }

    addFinanciador(unFinanciador ? ) {
        // agrega form Financiador u obra Social
        const control = < FormArray > this.updateForm.controls['financiador'];
        control.push(this.iniFinanciador(unFinanciador));
    }

    removeFinanciador(i: number) {
        // elimina form Financiador u obra Social
        const control = < FormArray > this.updateForm.controls['financiador'];
        control.removeAt(i);
    }

    addRelacion(unaRelacion ? ) {
        // agrega form Financiador u obra Social
        const control = < FormArray > this.updateForm.controls['relaciones'];
        control.push(this.iniRelacion(unaRelacion));
    }

    removeRelacion(i: number) {
        // elimina form Financiador u obra Social
        const control = < FormArray > this.updateForm.controls['relaciones'];
        control.removeAt(i);
    }

    buscarPacRelacionado() {
        this.error = false;
        //var formsRel = this.createForm.value.relaciones[i];
        var nombre = (document.getElementById("relNombre") as HTMLSelectElement).value;
        var apellido = (document.getElementById("relApellido") as HTMLSelectElement).value;
        var documento = (document.getElementById("relDocumento") as HTMLSelectElement).value;

        if ((nombre == "") && (apellido == "") && (documento == "")) {
            this.error = true;
            this.mensaje = "Debe completar al menos un campo de búsqueda";
            return;
        }

        this.pacienteService.getBySerch(apellido, nombre, documento, "", null, "")
            .subscribe(resultado => {
                debugger;
                if (resultado.length>0) {
                    this.pacRelacionados = resultado;
                    this.showCargar = false;
                    this.error = false;
                    this.mensaje = "";
                }else {
                    this.pacRelacionados = []
                    this.showCargar = true;
                    this.error = true;
                    this.mensaje = "No se encontraron datos precargados";
                }
            });
    }

    setRelacion(relacion: String, nombre: String, apellido: String, documento: String, referencia?: String) {
        var reOID = referencia? referencia:null;
        return this.formBuilder.group({
            relacion: [relacion],
            referencia: [reOID],
            apellido: [apellido],
            nombre: [nombre],
            documento: [documento]
        });
    }

    validar(paciente: IPaciente) {
        debugger;
        var relacion = (document.getElementById("relRelacion") as HTMLSelectElement).value;
        const control = < FormArray > this.updateForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, paciente.nombre, paciente.apellido, paciente.documento, paciente.id));

        (document.getElementById("relRelacion") as HTMLSelectElement).value = "";
        (document.getElementById("relNombre") as HTMLSelectElement).value = "";
        (document.getElementById("relApellido") as HTMLSelectElement).value = "";
        (document.getElementById("relDocumento") as HTMLSelectElement).value = "";
        this.showCargar = false;
        this.error = false;
        this.mensaje = "";
        this.pacRelacionados = []
    }

    cargarDatos() {
        debugger;
        this.error = false;
        this.mensaje = "";
        var relacion = (document.getElementById("relRelacion") as HTMLSelectElement).value;
        var nombre = (document.getElementById("relNombre") as HTMLSelectElement).value;
        var apellido = (document.getElementById("relApellido") as HTMLSelectElement).value;
        var documento = (document.getElementById("relDocumento") as HTMLSelectElement).value;

        if ((nombre == "") || (apellido == "") || (documento == "") || (relacion == "")) {
            this.error = true;
            this.mensaje = "Debe completar los datos solicitados";
            return;
        }

        const control = < FormArray > this.updateForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, nombre, apellido, documento, ""));

        (document.getElementById("relRelacion") as HTMLSelectElement).value = "";
        (document.getElementById("relNombre") as HTMLSelectElement).value = "";
        (document.getElementById("relApellido") as HTMLSelectElement).value = "";
        (document.getElementById("relDocumento") as HTMLSelectElement).value = "";

    }

}