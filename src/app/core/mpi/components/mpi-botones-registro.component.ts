import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'mpi-botones-registro',
    templateUrl: 'mpi-botones-registro.html',
    styleUrls: ['mpi-botones-registro.scss']
})
export class BotonesRegistroComponent implements OnInit {
    private toggler = false;
    routes;
    @Input() disabled: boolean;
    @Input() hostComponent = '';


    ngOnInit(): void {
        this.routes = [
            { label: 'BEBÉ', route: `/apps/mpi/bebe/${this.hostComponent}` },
            { label: 'EXTRANJERO', route: `/apps/mpi/extranjero/${this.hostComponent}` },
            { label: 'CON DNI ARGENTINO', route: `/apps/mpi/paciente/con-dni/${this.hostComponent}` },
            { label: 'SIN DNI ARGENTINO', route: `/apps/mpi/paciente/sin-dni/${this.hostComponent}` },
        ];
    }

    toggleMenu() {
        this.toggler = !this.toggler;
        return this.toggler;
    }
}

