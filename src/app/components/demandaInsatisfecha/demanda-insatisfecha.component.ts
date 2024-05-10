
import { Component, OnInit } from '@angular/core';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';


@Component({
    selector: 'demanda-insatisfecha',
    templateUrl: 'demanda-insatisfecha.html'
})
export class DemandaInsatisfechaComponent implements OnInit {
    public listaEspera = [];
    public itemSelected = null;
    public filtros: any = {};
    public selectorPrestacion;
    public selectorMotivo;
    public selectedPaciente;

    public motivos = [
        { id: 1, nombre: 'No existe la oferta en el efector' },
        { id: 2, nombre: 'No hay turnos disponibles' },
        { id: 3, nombre: 'Oferta rechazada por el paciente' }
    ];

    public columns = [
        {
            key: 'paciente',
            label: 'Paciente'
        },
        {
            key: 'prestacion',
            label: 'Prestación'
        },
        {
            key: 'fecha',
            label: 'Fecha'
        },
        {
            key: 'motivo',
            label: 'Motivo'
        },
        {
            key: 'estado',
        }
    ];

    public tabIndex = 0;
    public pacienteFields = ['sexo', 'fechaNacimiento', 'cuil', 'financiador', 'numeroAfiliado', 'direccion'];

    constructor(private listaEsperaService: ListaEsperaService) { }

    ngOnInit(): void {
        this.getDemandas({ estado: 'pendiente' });
    }

    private getDemandas(filtros) {
        this.listaEsperaService.get(filtros).subscribe((listaEspera: any[]) => {
            this.listaEspera = listaEspera;

            this.listaEspera.forEach(item => {
                item.motivos = item.demandas.map(({ motivo }) => motivo);
            });
        });
    }

    public seleccionarDemanda(demanda) { this.itemSelected = demanda; }

    public refreshSelection({ value }, tipo) {
        if (tipo === 'paciente') {
            this.filtros = { ...this.filtros, paciente: value };
        }

        if (tipo === 'fechaDesde') {
            this.filtros = { ...this.filtros, fechaDesde: value };
        }

        if (tipo === 'fechaHasta') {
            this.filtros = { ...this.filtros, fechaHasta: value };
        }

        if (tipo === 'prestacion') {
            this.filtros = { ...this.filtros, prestacion: value?.term };
        }

        if (tipo === 'motivo') {
            this.filtros = { ...this.filtros, motivo: value?.nombre };
        }

        this.getDemandas(this.filtros);
    }

    public cerrar() { this.itemSelected = null; }

    public cambiarTab(index) { }
}
