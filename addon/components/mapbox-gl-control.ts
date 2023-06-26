import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Control, IControl, Map } from 'mapbox-gl';

export interface MapboxGlControlComponentArgs {
  map: Map;
  control: IControl | Control;
  position: Parameters<Map['addControl']>['1'];
}

export interface MapboxGlControlComponentSignature {
  Args : MapboxGlControlComponentArgs
}

export default class MapboxGlControlComponent extends Component<MapboxGlControlComponentSignature> {
  @tracked control: MapboxGlControlComponentArgs['control'] | undefined;

  constructor(owner: unknown, args: MapboxGlControlComponentArgs) {
    super(owner, args);
    
    const { control, position, map } = args;
    this.control = control;
    map.addControl(control, position);

  }

  willDestroy() {
    super.willDestroy();

    if (this.control) {
      this.args.map.removeControl(this.control);
    }
  }
}