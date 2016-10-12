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
    Validators,
    REACTIVE_FORM_DIRECTIVES
} from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';

import {
    ProfesionalService
} from './../../services/profesional.service';
import {
    PaisService
} from './../../services/pais.service';
import {
    ProvinciaService
} from './../../services/provincia.service';
import {
    LocalidadService
} from './../../services/localidad.service';
import {
    EspecialidadService
} from './../../services/especialidad.service';

import {
    IProfesional
} from './../../interfaces/IProfesional';
import {
    IMatricula
} from './../../interfaces/IMatricula';
import {
    IPais
} from './../../interfaces/IPais';
import {
    IProvincia
} from './../../interfaces/IProvincia';
import {
    ILocalidad
} from './../../interfaces/ILocalidad';
import {
    IEspecialidad
} from './../../interfaces/IEspecialidad';
import * as enumerados from './../../utils/enumerados';


@Component({
    selector: 'profesional-update',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/profesional/profesional-update.html'
})
export class ProfesionalUpdateComponent implements OnInit {

    @Input('selectedProfesional') ProfesionalHijo: IProfesional;
    @Output() data: EventEmitter < IProfesional > = new EventEmitter < IProfesional > ();

    sexos: any[];
    generos: any[];
    tipoComunicacion: any[];
    estadosCiviles: any[];

    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    todasProvincias: IProvincia[] = [];
    todasLocalidades: ILocalidad[] = [];
    todasEspecialidades: IEspecialidad[] = [];

    updateForm: FormGroup;

    myPais: IPais;
    myProvincia: IProvincia;
    myLocalidad: ILocalidad;

    //Definición de Variables a cargar    
    fechaNacimientoActual: string;
    fechaFallecidoActual: string;
    especialidadesActuales: IEspecialidad[] = [];
    matricula: IMatricula;

    constructor(private formBuilder: FormBuilder,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private profesionalService: ProfesionalService,
        private especialidadService: EspecialidadService) {}

    ngOnInit() {
        //Carga arrays
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.tipoComunicacion = enumerados.getTipoComunicacion();
        this.estadosCiviles = enumerados.getEstadoCivil();

        this.paisService.get().subscribe(resultado => this.paises = resultado);
        this.provinciaService.get().subscribe(resultado => this.todasProvincias = resultado);
        this.localidadService.get().subscribe(resultado => this.todasLocalidades = resultado);
        this.especialidadService.get().subscribe(resultado => {
            this.todasEspecialidades = resultado
        })

        //Cargo los valores actuales [Ojo que no esta funcionando el tema de fechas]
        this.fechaNacimientoActual = this.dateToText(this.ProfesionalHijo.fechaNacimiento);
        this.fechaFallecidoActual = this.dateToText(this.ProfesionalHijo.fechaFallecimiento);


        this.updateForm = this.formBuilder.group({
            id: [this.ProfesionalHijo.id],
            nombre: [this.ProfesionalHijo.nombre, Validators.required],
            apellido: [this.ProfesionalHijo.apellido, Validators.required],
            documento: [this.ProfesionalHijo.documento, Validators.required],
            contacto: this.formBuilder.array([]),
            fechaNacimiento: [this.ProfesionalHijo.fechaNacimiento], //this.fechaNac, Validators.required
            fechaFallecimiento: [this.ProfesionalHijo.fechaFallecimiento], //this.fechaFall
            sexo: [this.ProfesionalHijo.sexo],
            genero: [this.ProfesionalHijo.genero],
            direccion: this.formBuilder.array([ //Vamos a suponer para simplificar una única dirección
                this.formBuilder.group({
                    valor: [this.ProfesionalHijo.direccion[0].valor],
                    codigoPostal: [this.ProfesionalHijo.direccion[0].codigoPostal],
                    ubicacion: this.formBuilder.group({
                        pais: [this.ProfesionalHijo.direccion[0].ubicacion.pais],
                        provincia: [this.ProfesionalHijo.direccion[0].ubicacion.provincia],
                        localidad: [this.ProfesionalHijo.direccion[0].ubicacion.localidad]
                    }),
                    ranking: [this.ProfesionalHijo.direccion[0].ranking],
                    activo: [this.ProfesionalHijo.direccion[0].activo]
                })
            ]),
            estadoCivil: [this.ProfesionalHijo.estadoCivil],
            foto: [''], //Queda pendiente para agregar un path o ver como se implementa
            rol: [this.ProfesionalHijo.rol, Validators.required],
            especialidad: this.formBuilder.array([]),
            matriculas: this.formBuilder.array([])
        });


        //Cargo arrays selecciondaos
        this.loadEspecialidades();
        this.loadMatriculas();
        this.loadContactos();
        //---- lo dejamos para despues this.loadDirecciones()
    }


    filtrarProvincias(indiceSelected: number) {
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) {
            return p.pais.id == idPais
        });
        this.localidades = [];
    }

    filtrarLocalidades(indiceSelected: number) {
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {
            return p.provincia.id == idProvincia
        });
    }


    private dateToText(myDate: Date): string {
        if (myDate) {
            var fecha1: string = myDate.toString();
            var fecha2 = new Date(Date.parse(fecha1));
            var mes = fecha2.getMonth() + 1;
            var fechaSal = fecha2.getDate().toString() + "/" + mes.toString() + "/" + fecha2.getFullYear().toString();
            return fechaSal;
        } else return "";
    }

    private textToDate(myDate): Date {
        var fecha2 = new Date(Date.parse(myDate));
        return fecha2;
    }


    /*************************PARA REVISAR ********************************************************************/
    // setDireccion(objDireccion: any) {
    //     //OJO revisar en el create el tema de los paises, localidades, etc no los guarda como obj solo el id
    //     debugger;
    //     return this.formBuilder.group({
    //         valor: [objDireccion.valor],
    //         codigoPostal: [objDireccion.codigoPostal],
    //         ubicacion: this.formBuilder.group({
    //             pais: [objDireccion.ubicacion.pais],
    //             provincia: [objDireccion.ubicacion.provincia],
    //             localidad: [objDireccion.ubicacion.localidad]
    //         }),
    //         ranking: [objDireccion.ranking],
    //         activo: [objDireccion.activo]
    //     })
    // }

    // loadDirecciones() {
    //     var cantDirecciones = this.ProfesionalHijo.direccion.length;
    //     const control = < FormArray > this.updateForm.controls['direccion'];
    //     debugger;
    //     if (cantDirecciones > 0) {
    //         for (var i = 0; i < cantDirecciones; i++) {
    //             var objDireccion: any = this.ProfesionalHijo.direccion[i];
    //             control.push(this.setDireccion(objDireccion)) 
    //         }
    //     }


    // }
    /*****************************************************PARA REVISAR ********************************************************************/



     /*Código de contactos*/

    initContacto(rank: Number) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: [''],
            valor: [''],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        const control = <FormArray> this.updateForm.controls['contacto'];
        control.push(this.initContacto(control.length + 1));
    }

    removeContacto(indice: number){
        const control = <FormArray> this.updateForm.controls['contacto'];
        control.removeAt(indice);
    }


    setContacto(cont: any) {
        debugger;
        return this.formBuilder.group({
            tipo: [cont.tipo],
            valor: [cont.valor],
            ranking: [cont.ranking],
            ultimaActualizacion: [cont.ultimaActualizacion],
            activo: [cont.activo]
        })
    }

    loadContactos() {

        var cantidadContactosActuales = this.ProfesionalHijo.contacto.length;
        const control = < FormArray > this.updateForm.controls['contacto'];

        if (cantidadContactosActuales > 0) {
            for (var i = 0; i < cantidadContactosActuales; i++) {
                var contacto: any = this.ProfesionalHijo.contacto[i];
                control.push(this.setContacto(contacto))
            }
        }
    }

    iniEspecialidad() {
        return this.formBuilder.group({
            nombre: []
        });
    }

    setEspecialidad(myId: String, myName: String) {
        return this.formBuilder.group({
            id: [myId],
            nombre: [myName],
        })
    }

     addEspecialidad(){
        var e = (document.getElementById("ddlEspecialidades")) as HTMLSelectElement;
        var indice = e.selectedIndex;
        var id = this.todasEspecialidades[indice].id;
        var nombre = this.todasEspecialidades[indice].nombre;
        
        const control = <FormArray>this.updateForm.controls['especialidad'];
        control.push(this.setEspecialidad(id,nombre));
    }

    removeEspecialidad(i: number) {
        const control = < FormArray > this.updateForm.controls['especialidad'];
        control.removeAt(i);
    }

    loadEspecialidades() {
        var cantidadEspecialidadesActuales = this.ProfesionalHijo.especialidad.length;
        const control = < FormArray > this.updateForm.controls['especialidad'];
        //Si tiene al menos una especialidad
        if (cantidadEspecialidadesActuales > 0) {
            for (var i = 0; i < cantidadEspecialidadesActuales; i++) {
                var id: String = this.ProfesionalHijo.especialidad[i].id;
                var nombre: String = this.ProfesionalHijo.especialidad[i].nombre;
                control.push(this.setEspecialidad(id, nombre));
            }
        }
    }

    setMatricula(objMat: IMatricula) {
        return this.formBuilder.group({
            numero: [objMat.numero, Validators.required],
            descripcion: [objMat.descripcion],
            activo: [objMat.activo],
            fechaInicio: [objMat.fechaInicio],
            fechaVencimiento: [objMat.fechaVencimiento],

        })
    }

    iniMatricula() {
        // Inicializa matrícula nueva
        return this.formBuilder.group({
            numero: ['', Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
            activo: [true]
        });
    }

    loadMatriculas() {
        var cantidadMatriculasActuales = this.ProfesionalHijo.matriculas.length;
        const control = < FormArray > this.updateForm.controls['matriculas'];
        //Si tienen al menos una matrículas
        if (cantidadMatriculasActuales > 0) {
            for (var i = 0; i < cantidadMatriculasActuales; i++) {
                var objMatricula: IMatricula;
                objMatricula = this.ProfesionalHijo.matriculas[i];
                control.push(this.setMatricula(objMatricula))
            }
        }
    }

    addMatricula() {
        // agrega formMatricula 

        const control = < FormArray > this.updateForm.controls['matriculas'];
        control.push(this.iniMatricula());
    }

    removeMatricula(i: number) {
        // elimina formMatricula
        const control = < FormArray > this.updateForm.controls['matriculas'];
        control.removeAt(i);
    }

    onSave(model: IProfesional, isvalid: boolean) {
        debugger;
        /*Vamos a tener que revisar que pasa con las fechas */
        if (isvalid) {
            let profOperation: Observable < IProfesional > ;
            profOperation = this.profesionalService.put(model);
            profOperation.subscribe(resultado => {
                this.data.emit(resultado);
            });

        } else {
            alert("Complete datos obligatorios");
        }

    }


    onCancel() {
        this.data.emit(null)
    }
}