import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
let shiroTrie = require('shiro-trie');

@Component({
    selector: 'arbolPermisos',
    templateUrl: 'arbolPermisos.html'
})

export class ArbolPermisosComponent implements OnInit {

    private shiro = shiroTrie.new();
    private state = false;

    @Input() item: any;
    @Input() parentPermission: String = '';
    @Input() userPermissions: String[] = [];

    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    constructor(private plex: Plex) { }

    public ngOnInit() {
        this.initShiro();
        if (this.item.type && this.item.type === 'boolean') {
            this.state = this.shiro.check(this.makePermission() + ':?');
        }
    }

    private initShiro() {
        this.shiro.reset();
        this.shiro.add(this.userPermissions);
    }

    private makePermission() {
        return this.parentPermission + (this.parentPermission.length ? ':' : '') + this.item.key;
    }

    public generateString(): String[] {
        let results = [];
        if (this.item.child) {
            this.childsComponents.forEach(child => {
                results = [...results, ...child.generateString()];
            });
            return results;
        } else {
            if (this.state) {
                return [this.makePermission()];
            }
        }
        return [];
    }

}
