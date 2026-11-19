import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { SnomedService } from '../../../apps/mitos';
import { FormTerapeuticoService } from '../../../services/formTerapeutico/formTerapeutico.service';
import { getSistemaFTP, IMedicamentoFTP, IOpcionFTP, ISistemaFTP, opcionesDistintas, SISTEMAS_FTP } from '../formularioTerapeutico.constantes';

@Component({
    selector: 'app-crear-nuevo',
    templateUrl: './crear-nuevo.component.html',
    styleUrls: ['./crear-nuevo.component.css']
})
export class CrearNuevoComponent implements OnInit {

    public sistemas: ISistemaFTP[] = SISTEMAS_FTP;
    public sistema: ISistemaFTP = null;
    public funcion: IOpcionFTP = null;
    public grupoFarmacologico: IOpcionFTP = null;
    public especialidades = '';

    public funciones: IOpcionFTP[] = [];
    public grupos: IOpcionFTP[] = [];

    public medicamento: Partial<IMedicamentoFTP> = {
        descripcion: '',
        concepto: null,
        nivelComplejidad: '',
        carroEmergencia: '',
        requisitos: '',
        indicaciones: '',
        recomendaciones: ''
    };

    public editando = false;
    public guardando = false;

    private medicamentos: IMedicamentoFTP[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private plex: Plex,
        private snomed: SnomedService,
        private servicioFormTerapeutico: FormTerapeuticoService
    ) { }

    ngOnInit() {
        this.servicioFormTerapeutico.getListado().subscribe(medicamentos => {
            this.medicamentos = medicamentos;
            this.actualizarOpciones();
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.editando = true;
            this.servicioFormTerapeutico.getById(id).subscribe(medicamento => this.cargar(medicamento));
        }
    }

    onSistemaChange() {
        this.funcion = null;
        this.grupoFarmacologico = null;
        this.actualizarOpciones();
    }

    onFuncionChange() {
        this.grupoFarmacologico = null;
        this.actualizarOpciones();
    }

    buscarConceptos(event) {
        if (!event?.query) {
            return event.callback([]);
        }
        this.snomed.get({
            search: event.query,
            semanticTag: ['producto', 'fármaco de uso clínico']
        }).subscribe(conceptos => event.callback(conceptos));
    }

    guardar($event) {
        if (!$event.formValid || this.guardando) {
            return;
        }
        const sistemaCargado = this.medicamentos.find(med => med.sistema.id === this.sistema.id)?.sistema;
        const datos = {
            ...this.medicamento,
            sistema: sistemaCargado || { id: this.sistema.id, codigo: this.sistema.codigo, nombre: this.sistema.nombre },
            funcion: this.funcion.id,
            grupoFarmacologico: this.grupoFarmacologico?.id || '',
            especialidades: this.especialidades.split(',').map(especialidad => especialidad.trim()).filter(especialidad => !!especialidad),
            conceptId: this.medicamento.concepto?.conceptId
        };

        this.guardando = true;
        const peticion = this.editando ? this.servicioFormTerapeutico.put(datos) : this.servicioFormTerapeutico.post(datos);
        peticion.subscribe({
            next: () => {
                this.plex.toast('success', `El medicamento se ${this.editando ? 'actualizó' : 'cargó'} correctamente`, 'Formulario terapéutico', 2000);
                this.volver();
            },
            error: () => this.guardando = false
        });
    }

    volver() {
        this.router.navigate(['formularioTerapeutico']);
    }

    private cargar(medicamento: IMedicamentoFTP) {
        this.medicamento = { ...medicamento };
        this.sistema = getSistemaFTP(medicamento.sistema?.id) || null;
        this.funcion = medicamento.funcion ? { id: medicamento.funcion, nombre: medicamento.funcion } : null;
        this.grupoFarmacologico = medicamento.grupoFarmacologico ? { id: medicamento.grupoFarmacologico, nombre: medicamento.grupoFarmacologico } : null;
        this.especialidades = (medicamento.especialidades || []).join(', ');
        this.actualizarOpciones();
    }

    private actualizarOpciones() {
        const delSistema = this.medicamentos.filter(med => this.sistema && med.sistema.id === this.sistema.id);
        this.funciones = opcionesDistintas(delSistema.map(med => med.funcion));
        const deLaFuncion = delSistema.filter(med => this.funcion && med.funcion === this.funcion.id);
        this.grupos = opcionesDistintas(deLaFuncion.map(med => med.grupoFarmacologico));
    }

}
