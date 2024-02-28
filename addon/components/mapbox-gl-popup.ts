import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { Map, Marker, PopupOptions, Popup } from 'mapbox-gl';
import { MapboxGlOnComponentSignature } from './mapbox-gl-on';

export interface MapboxGlPopupComponentArgs {
  map: Map;
  marker: Marker;
  lngLat: [number, number] | null;
  initOptions: Record<string, any> | null;
}
export interface MapboxGlPopupComponentSignature {
  Args: MapboxGlPopupComponentArgs
  Blocks: {
    default: {
      on: MapboxGlOnComponentSignature
    }
  }
}

export default class MapboxGlPopupComponent extends Component<MapboxGlPopupComponentSignature> {
  @tracked popup: Popup | undefined | null;
  @tracked domContent: HTMLElement | undefined;

  // @service config;

  constructor(owner: unknown, args: MapboxGlPopupComponentArgs) {
    super(owner, args);

    this.domContent = document.createElement('div');
    const { initOptions, marker, map, lngLat } = args;

    const config = getOwner(this)?.factoryFor('config:environment')?.class;
    //@ts-ignore
    const { popup }: { popup: PopupOptions } = config['mapbox-gl'] || {};

    const options = {
      ...popup,
      ...initOptions,
    };
    this.popup = new Popup(options).setDOMContent(this.domContent);

    if (marker === undefined) {
      this.popup.addTo(map);
      if (lngLat) this.popup.setLngLat(lngLat);
    } else {
      marker.setPopup(this.popup);
    }
  }

  @action
  updatePopupLngLat() {
    const lngLat = this.args.lngLat;

    if (lngLat) {
      if (this.popup?.isOpen()) {
        this.popup?.setLngLat(lngLat);
      } else {
        this.popup?.remove();
        this.popup?.addTo(this.args.map);
        this.popup?.setLngLat(lngLat);
      }
    }
  }

  willDestroy() {
    super.willDestroy();

    const marker = this.args.marker;

    if (marker) {
      marker.getPopup().remove();
    }

    if (this.popup) {
      this.popup.remove();
    }
  }
}
