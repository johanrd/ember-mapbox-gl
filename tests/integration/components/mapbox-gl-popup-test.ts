import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil, find, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import MapboxGl from 'mapbox-gl';
interface Context extends TestContext {
  map: MapboxGl.Map;
  didInsertMap: ([map]: [MapboxGl.Map]) => void;
  onClose: () => void;
}

module('Integration | Component | mapbox gl popup', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(0);

    await render(hbs`
      <MapboxGl as |map|>
        <map.popup/>
      </MapboxGl>
    `);
  });

  test('popup events can be subscribed to from the template', async function (this: Context, assert) {
    this.onClose = () => assert.step('onClose');

    this.didInsertMap = ([map]) => {
      this.map = map;
    };

    await render(hbs`
      <MapboxGl as |map|>
        {{did-insert this.didInsertMap map.instance}}
        <map.popup @lngLat={{array 10.949715 59.608604}} as |popup|>
          <popup.on @event='close' @action={{this.onClose}}/>
          Hi
        </map.popup>
      </MapboxGl>
    `);

    await waitUntil(() => find('.mapboxgl-popup-content'), { timeout: 5000 });

    assert
      .dom('.mapboxgl-popup-content')
      .containsText('Hi', 'popup content is rendered');

    // popups close when the map is clicked
    this.map.fire('click');

    assert.verifySteps(['onClose']);
  });

  test('it handles re-renders on map clicks after closing', async function (assert) {
    this.set('lngLat', [10.949715, 59.608604]);

    await render(hbs`
      <MapboxGl as |map|>
        <map.popup @lngLat={{this.lngLat}} as |popup|>
          Hi
        </map.popup>
      </MapboxGl>
    `);

    await waitUntil(() => find('.mapboxgl-popup-content'), { timeout: 5000 });

    await click('.mapboxgl-popup-close-button');

    this.set('lngLat', [10.949715, 59.608605]);

    assert
      .dom('.mapboxgl-popup-content')
      .containsText('Hi', 'popup content is rendered again');
  });
});
