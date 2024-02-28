import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import MapboxGl from 'mapbox-gl';
import mapboxglSupported from '@mapbox/mapbox-gl-supported';

class MapboxLoaderCancelledError extends Error {}
class MapboxSupportError extends Error {
  isMapboxSupportError = true;
}
class MapboxError extends Error {
  event: any;

  constructor(ev: ErrorEvent) {
    super(ev.error?.message ?? 'unknown mapbox error');
    this.event = ev;
  }
}

export default class MapboxLoader {
  @tracked map?: MapboxGl.Map;
  @tracked error?: Error;
  @tracked isLoaded = false;

  _mapLib: typeof MapboxGl = MapboxGl;
  _accessToken?: string;
  _mapOptions?: MapboxGl.MapboxOptions;
  _extOnMapLoaded: ((map: MapboxGl.Map) => void) | undefined;
  _isCancelled: boolean = false;
  _isLoading: boolean = false;

  load(
    accessToken: string,
    options: MapboxGl.MapboxOptions,
    onMapLoaded: (map: MapboxGl.Map) => void,
    mapLib?: typeof MapboxGl
  ) {
    if (this.isLoaded || this._isLoading || this._isCancelled) {
      return;
    }
    this._mapLib = mapLib || MapboxGl;
    this._isLoading = true;
    this._accessToken = accessToken;
    this._mapOptions = options;
    this._extOnMapLoaded = onMapLoaded;

    this._onModule()
      .then(() => this._onMapLoaded())
      .then(() => this._onComplete())
      .catch((err) => this._onError(err));
  }

  @action
  cancel() {
    this._isCancelled = true;

    if (this.map !== null) {
      // some map users may be late doing cleanup (seen with mapbox-draw-gl),
      // so don't remove the map until the next tick
      setTimeout(() => this.map?.remove(), 0);
    }
  }

  _onModule() {
    if (this._isCancelled) {
      throw new MapboxLoaderCancelledError();
    }
    this._mapLib.accessToken =
      this._accessToken ||
      'pk.eyJ1Ijoia3R1cm5leSIsImEiOiJjajFudmQ2Z2owMDBiMnlyd3FtZDl2dDlkIn0.5uUKBumz-7IWM_2PQ6cXQw';

    if (!mapboxglSupported.supported()) {
      throw new MapboxSupportError(
        'mapbox-gl not supported in current browser'
      );
    }

    const map = (this.map = new this._mapLib.Map(this._mapOptions));

    return new Promise<void>((resolve, reject) => {
      const listeners = {
        onLoad: () => {
          map.off('load', listeners.onLoad);
          map.off('error', listeners.onError);
          resolve();
        },
        onError: (ev: ErrorEvent) => {
          map.off('load', listeners.onLoad);
          map.off('error', listeners.onError);

          reject(new MapboxError(ev));
        },
      };

      map.on('load', listeners.onLoad);
      map.on('error', listeners.onError);
    });
  }

  _onMapLoaded() {
    if (this._isCancelled) {
      throw new MapboxLoaderCancelledError();
    }

    if (typeof this._extOnMapLoaded === 'function' && this.map) {
      return this._extOnMapLoaded(this.map);
    }

    return null;
  }

  _onComplete() {
    this._isLoading = false;

    if (this._isCancelled) {
      return;
    }

    this.isLoaded = true;
  }

  _onError(err: Error) {
    this._isLoading = false;

    if (err instanceof MapboxLoaderCancelledError) {
      return;
    }

    if (this._isCancelled) {
      console.error(err); // eslint-disable-line no-console
      return;
    }

    this.error = err;
  }
}
