import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { assert } from '@ember/debug';
import type { Map, Layer } from 'mapbox-gl';

export interface MapboxGlLayerComponentArgs {
  map: Map;
  layer: Layer;
  before?: Parameters<Map['addLayer']>[1];
  sourceId?: string;
}

export interface MapboxGlLayerComponentSignature {
  Args: MapboxGlLayerComponentArgs
  Blocks: {
    id: string;
  }
}

export default class MapboxGlLayerComponent extends Component<MapboxGlLayerComponentSignature> {

  constructor(owner: unknown, args: MapboxGlLayerComponentArgs) {
    super(owner, args);

    assert('`map` argument is required for `MapboxGlLayer` component', args.map);
    assert('`layer` argument is required for `MapboxGlLayer` component', args.layer);

    this.addLayer();
  }

  getEnvironmentConfig(layerType: string) {
    const config = getOwner(this)?.factoryFor('config:environment')?.class;
    //@ts-ignore
    return (config['mapbox-gl'] ?? {})[layerType];
  }

  @action
  addLayer() {
    // @ts-ignore
    this.args.map.addLayer(this.layer, this.args.before);
  }

  get layer() : Layer {
    return {
      ...this.args.layer,
      id: this.args.layer.id ?? guidFor(this),
      type: this.args.layer.type ?? 'line',
      source: this.args.layer.source ?? this.args.sourceId,
    }
  }

  @action
  updateLayer() {
    const layer = this.layer;

    for (const k in layer.layout ) {
      this.args.map.setLayoutProperty(layer.id, k, layer.layout[k as keyof typeof layer.layout]);
    }

    for (const k in layer.paint) {
      this.args.map.setPaintProperty(layer.id, k, layer.paint[k as keyof typeof layer.layout]);
    }

    if ('filter' in layer) {
      this.args.map.setFilter(layer.id, layer.filter);
    }

    if (layer.minzoom && layer.maxzoom) {
      this.args.map.setLayerZoomRange(layer.id, layer.minzoom, layer.maxzoom);
    }
  }

  willDestroy() {
    super.willDestroy();
    this.args.map?.removeLayer(this.layer.id);
  }
}