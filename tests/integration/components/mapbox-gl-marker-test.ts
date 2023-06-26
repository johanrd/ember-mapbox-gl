import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mapbox gl marker', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(0);

    this.set('lngLat', [0, 0]);

    await render(hbs`
      <MapboxGl as |map|>
        <map.marker @lngLat={{this.lngLat}}/>
      </MapboxGl>
    `);
  });
});
