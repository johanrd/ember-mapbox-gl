import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import Mapbox, { Map, MapboxOptions } from 'mapbox-gl';
//@ts-ignore
import MapboxLoader from '../-private/mapbox-loader';
//@ts-ignore
import config from '../config/environment';


import { MapboxGlCallComponentSignature } from './mapbox-gl-call';
import { MapboxGlOnComponentSignature } from './mapbox-gl-on';
import { MapboxGlPopupComponentSignature } from './mapbox-gl-popup';
import { MapboxGlControlComponentSignature } from './mapbox-gl-control';
import { MapboxGlImageComponentSignature } from './mapbox-gl-image';
import { MapboxGlSourceComponentSignature } from './mapbox-gl-source';
import { MapboxGlLayerComponentSignature } from './mapbox-gl-layer';
import { MapboxGlMarkerComponentSignature } from './mapbox-gl-marker';


/**
  Component that creates a new [mapbox-gl-js instance](https://www.mapbox.com/mapbox-gl-js/api/#map):

  ```hbs
  <MapboxGL @initOptions={{this.initOptions}} @mapLoaded={{this.mapLoaded}} as |map|>

  </MapboxGL>
  ```
*/

export interface MapboxGlComponentArgs {
  /**
     * An options hash to pass on to the [mapbox-gl-js instance](https://www.mapbox.com/mapbox-gl-js/api/).
     * This is only used during map construction, and updates will have no effect.
     */
  initOptions?: MapboxOptions;

  /**
   * An action function to call when the map has finished loading.
   * Note that the component does not yield until the map has loaded,
   * so this is the only way to listen for the mapbox load event.
   */
  mapLoaded: (map: Map) => void;

  mapLib?: typeof Mapbox;
}

export interface MapboxGlComponentSignature {
  Args: MapboxGlComponentArgs
  Blocks: {
    default: {
      call: MapboxGlCallComponentSignature;
      control: MapboxGlControlComponentSignature;
      image: MapboxGlImageComponentSignature;
      layer: MapboxGlLayerComponentSignature;
      marker: MapboxGlMarkerComponentSignature;
      on: MapboxGlOnComponentSignature;
      popup: MapboxGlPopupComponentSignature;
      source: MapboxGlSourceComponentSignature;
      instance: Map;
    };
    inverse: [error: Error];
  };
}

export default class MapboxGl extends Component<MapboxGlComponentSignature> {
  layout = null;

  _mapLib: typeof Mapbox = Mapbox;

  @tracked _loader: MapboxLoader | undefined;

  //@ts-ignore
  constructor(owner: unknown, args: MapboxGlComponentArgs) {
    super(owner, args);
    this._mapLib = args.mapLib || Mapbox;
    this._loader = new MapboxLoader();
  }

  @action
  registerElement(element: HTMLElement) {
    const config = getOwner(this)?.factoryFor('config:environment')?.class;

    const { accessToken, map }: { accessToken: string; map: MapboxOptions } =
      //@ts-ignore
      config['mapbox-gl'] || {};
    const options: MapboxOptions = { ...map, ...this.args.initOptions };
    options.container = element;
    this._loader?.load(accessToken, options, this.args.mapLoaded, this._mapLib);
  }

  @action
  willDestroyElement() {
    this._loader?.cancel();
  }
}
