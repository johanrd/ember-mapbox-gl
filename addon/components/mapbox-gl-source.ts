import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';

import { MapboxGlLayerComponentSignature } from './mapbox-gl-layer';

import {
  Map,
  AnySourceData,
  AnySourceImpl
} from 'mapbox-gl';

export interface MapboxGlSourceComponentArgs {
  map: Map;
  options: AnySourceData;
  sourceId?: string;
}

export interface MapboxGlSourceComponentSignature {
  Args : MapboxGlSourceComponentArgs
  Blocks : {
    id: string;
    layer: MapboxGlLayerComponentSignature
  }
}

/**
  Adds a data source to the map. The API matches the mapbox [source docs](https://www.mapbox.com/mapbox-gl-js/api/#sources).

  Example:
  ```hbs
    <MapboxGl as |map|>
      <map.source @options={{hash
          type='geojson'
          data=(hash
            type='FeatureCollection'
            features=(array
              (hash
                type='Feature'
                geometry=(hash
                  type='Point'
                  coordinates=(array -96.7969879 32.7766642)
                )
              )
            )
          )
        }}>
      </map.source>
    </MapboxGl>
  ```
*/

export default class MapboxGLSourceComponent extends Component<MapboxGlSourceComponentSignature> {
  @tracked sourceId: string;

  constructor(owner: unknown, args: MapboxGlSourceComponentArgs) {
    super(owner, args);
    this.sourceId = args.sourceId || guidFor(this);
    args.map.addSource(this.sourceId, args.options);
  }

  @action
  updateSource() {
    const { options, map } = this.args ;
    const source = this.args.map.getSource(this.sourceId) as AnySourceImpl;
    if ('setData' in source && 'data' in options && options.data) {
      if (typeof options.data === 'object' && 'type' in options.data && options.data.type !== 'Feature' && options.data.type !== 'FeatureCollection') {
        options.data = {
          type: 'Feature',
          properties: {},
          geometry: options.data,
        };
      }
      source.setData(options.data);
    }
    if ('setCoordinates' in source && 'coordinates' in options && options.coordinates) {
      source.setCoordinates(options.coordinates);
    }
    return map;
  }

  willDestroy() {
    super.willDestroy();
    scheduleOnce('afterRender', this.args.map, this.args.map.removeSource, this.sourceId);
  }
}
