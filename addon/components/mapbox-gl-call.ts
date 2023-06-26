import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { cancel, scheduleOnce } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';


export interface MapboxGlCallComponentArgs {
  obj: Record<string, unknown>;
  func: string;
  positionalArguments: unknown[];
  onResp?: (result: unknown) => void;
}
export interface MapboxGlCallComponentSignature {
  Args: MapboxGlCallComponentArgs
}

export default class MapboxGlCallComponent extends Component<MapboxGlCallComponentSignature> {
  private _scheduledCall?: EmberRunTimer;

  get onResp() {
    return this.args.onResp || (() => {})
  }

  constructor(owner: unknown, args: MapboxGlCallComponentArgs) {
    super(owner, args);
    this.scheduleCall();
  }

  @action
  scheduleCall() {
    const { obj, func, positionalArguments,  } = this.args;

    assert(
      'mapbox-gl-call obj is required',
      typeof obj === 'object' && !!obj
    );
    assert(
      'mapbox-gl-call func is required and must be a string',
      typeof func === 'string'
    );

    this._scheduledCall = scheduleOnce('afterRender', this, this.callFunction, obj, func, positionalArguments);

  }

  @action
  callFunction(obj: Record<string, unknown>, func: string, positionalArguments: unknown[]) {
    this._scheduledCall = undefined;

    assert(
      `mapbox-gl-call ${func} must be a function on ${obj}`,
      typeof obj[func] === 'function'
    );

    const method = obj[func] as (...args: unknown[]) => unknown;
    this.onResp?.(method.apply(obj, positionalArguments));
    
  }

  willDestroy() {
    super.willDestroy();
    if (this._scheduledCall) {
      cancel(this._scheduledCall);
    }
  }
  
}
