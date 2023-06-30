import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, TestContext, pauseTest } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import maplibregl from 'maplibre-gl'
import mapboxgl from 'mapbox-gl';

interface Context extends TestContext {
  mapLib: typeof mapboxgl | typeof maplibregl
}

module('Integration | Component | mapbox gl', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (this: Context, assert) {
    assert.expect(0);

    // Template block usage:
    await render(hbs`
      <MapboxGl as |map|>
        <div id='loaded-sigil'></div>
      </MapboxGl>
    `);

    await waitFor('#loaded-sigil');
  });

  test('it renders with maplibre', async function (this: Context, assert) {

    this.mapLib = maplibregl
    assert.expect(0);

    // Template block usage:
    await render(hbs`
      <MapboxGl 
        @mapLib={{this.mapLib}} 
        @initOptions={{hash
          style="https://demotiles.maplibre.org/style.json"
          center=(array -74.5 40)
          zoom=9
        }}
      as |map|>
        <div id='loaded-sigil'></div>
      </MapboxGl>
    `);

    await waitFor('#loaded-sigil');
  });
});
