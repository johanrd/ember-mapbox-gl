import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, TestContext} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import MapboxGl from 'mapbox-gl';

interface Context extends TestContext {
  control?: MapboxGl.NavigationControl;
}

module('Integration | Component | mapbox gl control', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with a position', async function (this: Context, assert) {
    this.control = new MapboxGl.NavigationControl()

    await render(hbs`
      <MapboxGl as |map|>
        <map.control @control={{this.control}} @position='top-right'/>
        <div id='loaded-sigil'></div>
      </MapboxGl>
    `);

    await waitFor('#loaded-sigil');
    assert.dom('.mapboxgl-ctrl-zoom-in').exists();
  });
});
