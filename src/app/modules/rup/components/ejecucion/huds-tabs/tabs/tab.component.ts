import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
      background: white;
    }   
  `],
  template: `
    <div [hidden]="!active" class="pane pl-0 pr-0">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input() tabTitle: String = '';
  @Input() active = false;
  @Input() class: String = '';
}
