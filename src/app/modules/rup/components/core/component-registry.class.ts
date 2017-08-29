import { Component } from '@angular/core';
import { PesoComponent } from '../elementos/peso.component';

export class ComponentRegistry {
    private static components: { [key: string]: Object } = {
        'PesoComponent': PesoComponent
    };

    public static get(key: string): Object {
        return this.components[key];
    }
};
