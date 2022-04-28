import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-select-static',
    templateUrl: './select-static.component.html'
})
export class SelectStaticComponent implements OnInit {
    @Input() fieldStatic: any;

    public columns = [
        {
            key: 'nombre',
            label: 'Nombre'
        },
        {
            key: 'acciones',
            label: 'Acciones'
        }
    ];
    public nuevoItem = {
        id: '',
        nombre: ''
    };

    constructor() { }

    ngOnInit(): void { }

    addItem() {
        this.nuevoItem.id = this.nuevoItem.nombre.length > 16 ? this.nuevoItem.nombre.replace(/ /g, '').slice(0, 16).toLowerCase()
            : this.nuevoItem.nombre.replace(/ /g, '').toLowerCase();
        this.fieldStatic.items.push(this.nuevoItem);
        this.nuevoItem = {
            id: '',
            nombre: ''
        };
    }

    deleteItem(item) {
        const index = this.fieldStatic.items.findIndex(elem => elem.id === item.id);
        if (index >= 0) {
            this.fieldStatic.items.splice(index, 1);
        }
    }
}
