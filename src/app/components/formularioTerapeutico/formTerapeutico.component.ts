import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';
import { getSistemaFTP, IMedicamentoFTP, IOpcionFTP, ISistemaFTP, normalizarTexto, opcionesDistintas, SISTEMAS_FTP } from './formularioTerapeutico.constantes';

@Component({
    selector: 'app-formTerapeutico',
    templateUrl: './formTerapeutico.html',
    styleUrls: ['./formTerapeutico.scss']
})
export class FormTerapeuticoComponent implements OnInit {

    public columnas = [
        {
            key: 'sistema',
            label: 'Sistema',
            sorteable: true,
            sort: (a: IMedicamentoFTP, b: IMedicamentoFTP) => a.sistema.codigo.localeCompare(b.sistema.codigo)
        },
        {
            key: 'funcion',
            label: 'Función',
            sorteable: true,
            sort: (a: IMedicamentoFTP, b: IMedicamentoFTP) => (a.funcion || '').localeCompare(b.funcion || '')
        },
        {
            key: 'grupoFarmacologico',
            label: 'Grupo farmacológico',
            sorteable: true,
            sort: (a: IMedicamentoFTP, b: IMedicamentoFTP) => (a.grupoFarmacologico || '').localeCompare(b.grupoFarmacologico || '')
        },
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            sort: (a: IMedicamentoFTP, b: IMedicamentoFTP) => a.descripcion.localeCompare(b.descripcion)
        },
        {
            key: 'conceptoSnomed',
            label: 'Concepto SNOMED'
        }
    ];

    public sistemas: ISistemaFTP[] = SISTEMAS_FTP;
    public sistemaSeleccionado = '';

    public funciones: IOpcionFTP[] = [];
    public grupos: IOpcionFTP[] = [];

    // Filtros
    public funcion: IOpcionFTP = null;
    public grupoFarmacologico: IOpcionFTP = null;
    public medicamento = '';
    public conceptoSnomed = '';

    public cargando = false;
    public medicamentoSeleccionado: IMedicamentoFTP = null;
    public listado$ = new BehaviorSubject<IMedicamentoFTP[]>([]);

    private medicamentos: IMedicamentoFTP[] = [];

    constructor(
        private router: Router,
        private plex: Plex,
        public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService
    ) { }

    ngOnInit() {
        this.cargarMedicamentos();
    }

    cargarMedicamentos() {
        this.cargando = true;
        this.servicioFormTerapeutico.getListado().subscribe({
            next: (medicamentos) => {
                this.medicamentos = medicamentos;
                this.cargando = false;
                this.actualizarOpciones();
                this.filtrar();
            },
            error: () => this.cargando = false
        });
    }

    seleccionarSistema(sistema: ISistemaFTP) {
        this.sistemaSeleccionado = this.sistemaSeleccionado === sistema.id ? '' : sistema.id;
        this.funcion = null;
        this.grupoFarmacologico = null;
        this.actualizarOpciones();
        this.filtrar();
    }

    onFuncionChange() {
        this.grupoFarmacologico = null;
        this.actualizarOpciones();
        this.filtrar();
    }

    filtrar() {
        const texto = normalizarTexto(this.medicamento);
        const snomed = normalizarTexto(this.conceptoSnomed);
        const resultado = this.medicamentos.filter(med =>
            (!this.sistemaSeleccionado || med.sistema.id === this.sistemaSeleccionado) &&
            (!this.funcion || med.funcion === this.funcion.id) &&
            (!this.grupoFarmacologico || med.grupoFarmacologico === this.grupoFarmacologico.id) &&
            (!texto || normalizarTexto(med.descripcion).includes(texto) || normalizarTexto(med.principioActivo).includes(texto)) &&
            (!snomed || (med.concepto?.conceptId || '').includes(snomed) || normalizarTexto(med.concepto?.term).includes(snomed))
        );
        this.listado$.next(resultado);
        if (this.medicamentoSeleccionado && !resultado.includes(this.medicamentoSeleccionado)) {
            this.medicamentoSeleccionado = null;
        }
    }

    seleccionarMedicamento(medicamento: IMedicamentoFTP) {
        this.medicamentoSeleccionado = this.medicamentoSeleccionado === medicamento ? null : medicamento;
    }

    cerrarDetalle() {
        this.medicamentoSeleccionado = null;
    }

    nuevo() {
        this.router.navigate(['formularioTerapeutico', 'nuevo']);
    }

    editar(medicamento: IMedicamentoFTP) {
        this.router.navigate(['formularioTerapeutico', medicamento._id, 'editar']);
    }

    eliminar(medicamento: IMedicamentoFTP) {
        this.plex.confirm(`Se eliminará "${medicamento.descripcion}" del formulario terapéutico.`, '¿Eliminar medicamento?').then(confirmado => {
            if (!confirmado) {
                return;
            }
            this.servicioFormTerapeutico.put({ ...medicamento, borrado: true }).subscribe(() => {
                this.plex.toast('success', 'El medicamento se eliminó correctamente', 'Formulario terapéutico', 2000);
                this.medicamentos = this.medicamentos.filter(med => med !== medicamento);
                this.medicamentoSeleccionado = null;
                this.actualizarOpciones();
                this.filtrar();
            });
        });
    }

    sistemaDe(medicamento: IMedicamentoFTP): ISistemaFTP {
        return getSistemaFTP(medicamento?.sistema?.id);
    }

    volver() {
        this.router.navigate(['inicio']);
    }

    private actualizarOpciones() {
        const delSistema = this.medicamentos.filter(med => !this.sistemaSeleccionado || med.sistema.id === this.sistemaSeleccionado);
        this.funciones = opcionesDistintas(delSistema.map(med => med.funcion));
        const deLaFuncion = delSistema.filter(med => !this.funcion || med.funcion === this.funcion.id);
        this.grupos = opcionesDistintas(deLaFuncion.map(med => med.grupoFarmacologico));
    }
}
