import { Promise } from 'rsvp';
//@ts-ignore
import Config from '../../config/environment';
import { TestContext } from '@ember/test-helpers';
import QUnit from 'qunit';
import MapboxGl from 'mapbox-gl';
import { schedule } from '@ember/runloop';

interface Context extends TestContext {
  map: MapboxGl.Map;
}

const ALLOWED_ERRORS = ['The operation was aborted', 'Failed to fetch'];

export default function setupMap(hooks: NestedHooks) {
  hooks.beforeEach(async function (this: Context) {
    MapboxGl.accessToken = Config['mapbox-gl'].accessToken;

    await new Promise<void>((resolve) => {
      this.map = new MapboxGl.Map({
        container: document
          .querySelector(Config.APP.rootElement)
          .appendChild(document.createElement('div')),
        style: Config['mapbox-gl'].map.style,
      });

      this.map.once('data', () => resolve());
      const onErr = (ev: MapboxGl.ErrorEvent) => {
        const err = {
          message: ev.error?.message || 'unknown mapbox error',
          event: ev,
          stack: ev.error?.stack,
        };

        if (ALLOWED_ERRORS.includes(err.message)) {
          console.error(err.message, ev.error);
        } else {
          QUnit.onUncaughtException(err);
        }
      };

      this.map.on('error', onErr);
    });
  });

  hooks.afterEach(function (this: Context) {

    schedule('destroy', () => {
      this.map.remove();
      document
        .querySelector(Config.APP.rootElement)
        .querySelectorAll('.mapboxgl-map')
        .forEach((element: HTMLElement) => element.remove());
    });
  });
}