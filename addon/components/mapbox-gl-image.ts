import Component from '@glimmer/component';
import { action } from '@ember/object';
import { bind } from '@ember/runloop';
import MapboxGl from 'mapbox-gl';
import { tracked } from '@glimmer/tracking';

export interface MapboxGlImageComponentArgs {
  map: MapboxGl.Map;
  url: Parameters<MapboxGl.Map['loadImage']>['0'];
  name: Parameters<MapboxGl.Map['addImage']>['0'];
  options?: Parameters<MapboxGl.Map['addImage']>['2'];
  width?: HTMLImageElement['width'];
  height?: HTMLImageElement['height'];
  onLoad?: () => void;
  onError?: (err: any) => void;
}

export interface MapboxGlImageComponentSignature {
  Args: MapboxGlImageComponentArgs
}

function noop(){};

export class SvgLoadError extends Error {
  event: Event;

  constructor(message: string, event: Event) {
    super(message);
    this.event = event;
  }
}

export default class MapboxGlImageComponent extends Component<MapboxGlImageComponentSignature> {

  @tracked _lastName?: string;

  get onError() {
    return this.args.onError || noop;
  }
  get onLoad() {
    return this.args.onLoad || noop;
  }

  get isSvg(): boolean {
    const url = this.args.url;
    if (!url || typeof url !== 'string') {
      return false;
    }
    return /\.svg$/.test(url);
  }

  constructor(owner: any, args: MapboxGlImageComponentArgs) {
    super(owner, args);
    this.loadImage();
  }

  @action
  loadImage() {

    // If the component already has added an image to the map, remove it
    if (this._lastName && this.args.map.hasImage(this._lastName)) {
      this.args.map.removeImage(this._lastName);
    }

    const { width, height, url } = this.args;
    if (!url) {
      return;
    }

    if (this.isSvg) {
      const img = new Image();
      if (width) {
        img.width = width;
      }

      if (height) {
        img.height = height;
      }

      img.onload = bind(this, this._onImage, url, null, img);
      img.onerror = bind(this, this._onSvgErr, url);
      img.src = url;
    } else {
      this.args.map.loadImage(url, bind(this, this._onImage, url));
    }
  }

  @action
  _onImage(url: string, err: any, image?: any) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    if (this.args.url !== url) {
      // image has changed since we started loading
      return;
    }

    if (err) {
      return this.onError(err);
    }

    const { name, options } = this.args;

    this.args.map.addImage(name, image, options);

    this._lastName = name;

    this.onLoad();
  }

  @action
  _onSvgErr(url: string, event: Event) {
    const error = new SvgLoadError("Failed to load svg", event);
    this._onImage(url, error);
  }

  willDestroy() {
    super.willDestroy();
    if (this.args.name && this.args.map.hasImage(this.args.name)) {
      this.args.map.removeImage(this.args.name);
    }
  }
}