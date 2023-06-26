import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { Map, Popup, Marker } from 'mapbox-gl';
import { scheduleOnce } from '@ember/runloop';

export interface MapboxGlOnComponentArgs {
  eventSource: Map | Popup | Marker
  event: string
  layerId: string
  action: (...args: any[]) => void
}
export interface MapboxGlOnComponentSignature {
  Args : MapboxGlOnComponentArgs
}

export default class MapboxGlOnComponent extends Component<MapboxGlOnComponentSignature> {
  @tracked _prevEvent: string | undefined;
  @tracked _prevLayerId: string | undefined;
  @tracked eventSource: Map | Popup | Marker | undefined;
  _boundOnEvent: (...args: any[]) => void;

  constructor(owner: unknown, args: MapboxGlOnComponentArgs) {
    super(owner, args);
    this.eventSource = this.args.eventSource;
    this._boundOnEvent = this._onEvent.bind(this);
    const { eventSource, layerId, event: _event, action: _action } = this.args;
    const { _prevEvent, _prevLayerId } = this;

    assert(
      `mapbox-gl-event requires event to be a string, was ${this.args.event}`,
      typeof this.args.event === 'string'
    );

    assert('mapbox-gl-event requires an eventSource', isPresent(eventSource));
    assert('mapbox-gl-event requires an action', isPresent(_action));

    if (_event !== _prevEvent || layerId !== _prevLayerId) {
      if (_prevEvent) {
        if (_prevLayerId) {
          // @ts-ignore
          eventSource.off(_prevEvent, _prevLayerId, this._boundOnEvent);
        } else {
          eventSource.off(_prevEvent, this._boundOnEvent);
        }
      }

      if (layerId) {
        // @ts-ignore
        eventSource.on(_event, layerId, this._boundOnEvent);
      } else {
        eventSource.on(_event, this._boundOnEvent);
      }

      scheduleOnce('actions', this, function () {
        this._prevEvent = _event;
        this._prevLayerId = layerId;
      });
    }
  }

  willDestroy() {
    super.willDestroy();
    const { eventSource, _prevEvent, _prevLayerId } = this;
    if (eventSource && _prevEvent) {
      if (_prevLayerId) {
        // @ts-ignore
        eventSource.off(_prevEvent, _prevLayerId, this._boundOnEvent);
      } else {
        eventSource.off(_prevEvent, this._boundOnEvent);
      }
    }
  }

  _onEvent(...args: any[]) {
    if (this.args.action) {
      this.args.action(...args);
    }
  }
}
