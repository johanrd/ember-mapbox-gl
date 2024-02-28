import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { Map, MarkerOptions, LngLatLike, Marker } from 'mapbox-gl';

import { MapboxGlOnComponentSignature } from './mapbox-gl-on';
import { MapboxGlPopupComponentSignature } from './mapbox-gl-popup';

export interface MapboxGlMarkerComponentArgs {
  map: Map;
  initOptions?: MarkerOptions;
  lngLat: LngLatLike;
}
export interface MapboxGlMarkerComponentSignature {
  Args: MapboxGlMarkerComponentArgs
  Blocks: {
    default: {
      popup: MapboxGlOnComponentSignature;
      on: MapboxGlPopupComponentSignature;
    }
  }
}

export default class MapboxGlMarkerComponent extends Component<MapboxGlMarkerComponentSignature> {
  @tracked domContent = document.createElement('div');
  @tracked marker: Marker | undefined;

  constructor(owner: unknown, args: MapboxGlMarkerComponentArgs) {
    super(owner, args);

    assert(
      '`map` argument is required for `MapboxGlMarker` component',
      args.map
    );
    assert(
      '`lngLat` argument is required for `MapboxGlMarker` component',
      args.lngLat
    );

    this.addMarker();
  }

  get markerOptions(): MarkerOptions {
    const config = getOwner(this)?.factoryFor('config:environment')?.class;

    const { marker }: { marker: MarkerOptions } =
      //@ts-ignore
      config['mapbox-gl'] || {};
    const options: MarkerOptions = { ...marker, ...this.args.initOptions };

    return options;
  }

  @action
  addMarker() {
    this.marker = new Marker(this.domContent, this.markerOptions)
      .setLngLat(this.args.lngLat)
      .addTo(this.args.map);
  }

  @action
  updateMarker() {
    assert(
      '`lngLat` argument is required for `MapboxGlMarker` component',
      this.args.lngLat
    );

    this.marker?.setLngLat(this.args.lngLat);
  }

  @action
  removeMarker() {
    this.marker?.remove();
  }

  willDestroy() {
    super.willDestroy();
    this.removeMarker();
  }
}
