import { Component, Input } from '@angular/core';

@Component({
    selector: 'mpi-botones-registro',
    templateUrl: 'mpi-botones-registro.html',
    styleUrls: ['mpi-botones-registro.scss']
})
export class BotonesRegistroComponent {
    private toggler = false;
    @Input() disabled: boolean;
    routes = [
        { label: 'BEBÉ', route: '/apps/mpi/bebe' },
        { label: 'EXTRANJERO', route: '/apps/mpi/extranjero' },
        { label: 'ARGENTINO CON DNI', route: '/apps/mpi/paciente' },
        { label: 'ARGENTINO SIN DNI', route: '/apps/mpi/paciente' },
    ];

    toggleMenu() {
        this.toggler = !this.toggler;
        return this.toggler;
    }
}

