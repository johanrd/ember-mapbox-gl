import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clearRender, render, waitFor, TestContext } from '@ember/test-helpers';
import setupMap from '../../helpers/create-map';
import { hbs } from 'ember-cli-htmlbars';
import Sinon from 'sinon';

import type { MapboxGlComponentArgs } from 'ember-mapbox-gl/components/mapbox-gl';
import type { MapboxGlSourceComponentArgs } from 'ember-mapbox-gl/components/mapbox-gl-source';
import { GeoJSONSource, GeoJSONSourceRaw, Layer, VideoSource } from 'mapbox-gl';
import 'qunit-dom';

interface Context extends MapboxGlComponentArgs, MapboxGlSourceComponentArgs, TestContext {
  sandbox: Sinon.SinonSandbox;
  data: GeoJSONSourceRaw['data'];
}

module('Integration | Component | mapbox gl source', function (hooks) {
  setupMap(hooks);
  setupRenderingTest(hooks);

  hooks.before(function (this: Context) {
    this.sandbox = Sinon.createSandbox();
  });

  hooks.afterEach(function (this: Context) {
    this.sandbox.restore();
  });

  test('it creates a sourceId if one is not provided', async function (this: Context, assert) {

    this.options = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271729, 39.18174077994108],
            },
          },
        ],
      },
    };

    const addSourceSpy = this.sandbox.spy(this.map, 'addSource');
    const removeSourceSpy = this.sandbox.spy(this.map, 'removeSource');

    await render(
      hbs`<MapboxGlSource @map={{this.map}} @options={{this.options}}/>`
    );

    assert.ok(addSourceSpy.calledOnce, 'addSource called once');
    assert.ok(addSourceSpy.firstCall.args[0], 'a sourceId is added');

    await clearRender();

    assert.ok(removeSourceSpy.calledOnce, 'removeSource called once');
    assert.strictEqual(
      removeSourceSpy.firstCall.args[0],
      addSourceSpy.firstCall.args[0],
      'correct sourceId is removed'
    );
  });

  test('it accepts source options as an options object', async function (this: Context, assert) {
    this.options = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271729, 39.18174077994108],
            },
          },
        ],
      },
    };

    const addSourceSpy = this.sandbox.spy(this.map, 'addSource');
    const removeSourceSpy = this.sandbox.spy(this.map, 'removeSource');

    this.sourceId = 'evewvrwvwrvw';

    await render(
      hbs`<MapboxGlSource @map={{this.map}} @sourceId={{this.sourceId}} @options={{this.options}}/>`
    );

    assert.ok(addSourceSpy.calledOnce, 'addSource called once');
    assert.strictEqual(
      addSourceSpy.firstCall.args[0],
      this.sourceId,
      'correct sourceId is added'
    );
    assert.deepEqual(
      addSourceSpy.firstCall.args[1],
      this.options,
      'correct source options'
    );

    await clearRender();

    assert.ok(removeSourceSpy.calledOnce, 'removeSource called once');
    assert.strictEqual(
      removeSourceSpy.firstCall.args[0],
      this.sourceId,
      'correct sourceId is removed'
    );
  });

  test('it passes updated data on to the source via the options property', async function (this: Context, assert) {

    this.options = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271729, 39.18174077994108],
            },
          },
        ],
      },
    };

    const addSourceSpy = this.sandbox.spy(this.map, 'addSource');

    this.sourceId = 'evewvrwvwrvw';

    await render(
      hbs`<MapboxGlSource @map={{this.map}} @sourceId={{this.sourceId}} @options={{this.options}}/>`
    );

    assert.ok(addSourceSpy.calledOnce, 'addSource called once');
    assert.strictEqual(
      addSourceSpy.firstCall.args[0],
      this.sourceId,
      'correct sourceId is added'
    );
    assert.deepEqual(
      Object.assign({}, addSourceSpy.firstCall.args[1]), // clone so comparison against ember empty object matches
      this.options,
      'correct source options'
    );

    const setDataSpy = this.sandbox.spy(this.map.getSource(this.sourceId) as GeoJSONSource, 'setData');

    const updatedSourceRaw : GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271729, 39.18174077994108],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271728, 39.18174077994107],
            },
          },
        ],
      }
    };

    this.set('options', updatedSourceRaw);

    assert.ok(setDataSpy.calledOnce, 'source#setData called once');
    assert.deepEqual(
      setDataSpy.firstCall.args[0] as GeoJSONSourceRaw['data'],
      this.options.data,
      'correct data is updated'
    );
  });

  test('it passes updated coordinates on to the source via the options property', async function (this: Context, assert) {
    const updatedCoordinates = [
      [-76.54335737228394, 39.18579907229748],
      [-76.52803659439087, 39.1838364847587],
      [-76.5295386314392, 39.17683392507606],
      [-76.54520273208618, 39.17876344106642],
    ];

    this.sourceId = 'evewvrwvwrvw';

    this.options = {
      type: 'video',
      urls: [],
      coordinates: [
        [-76.54, 39.18],
        [-76.52, 39.18],
        [-76.52, 39.17],
        [-76.54, 39.17],
      ],
    };

    const addSourceSpy = this.sandbox.spy(this.map, 'addSource');

    await render(
      hbs`<MapboxGlSource @map={{this.map}} @sourceId={{this.sourceId}} @options={{this.options}}/>`
    );

    assert.ok(addSourceSpy.calledOnce, 'addSource called once');
    assert.strictEqual(
      addSourceSpy.firstCall.args[0],
      this.sourceId,
      'correct sourceId is added'
    );
    assert.deepEqual(
      addSourceSpy.firstCall.args[1],
      this.options,
      'correct source options'
    );

    const setCoordinatesSpy = this.sandbox.spy(
      this.map.getSource(this.sourceId) as VideoSource,
      'setCoordinates'
    );

    this.set('options', { ...this.options, coordinates: updatedCoordinates });

    assert.ok(
      setCoordinatesSpy.calledOnce,
      'source#setCoordinates called once'
    );
    assert.deepEqual(
      setCoordinatesSpy.firstCall.args[0],
      updatedCoordinates,
      'correct coordinates is updated'
    );
  });

  test('it passes on its sourceId to its layers', async function (this: Context, assert) {
    this.data = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [-76.53063297271729, 39.18174077994108],
          },
        },
      ],
    }

    const addLayerSpy = this.sandbox.spy(this.map, 'addLayer');

    this.sourceId = 'guvvguvguugvu';

    await render(hbs`
      <MapboxGlSource @map={{this.map}} @sourceId={{this.sourceId}} @options={{hash type='geojson' data=this.data}} as |source|>
        <source.layer @layer={{hash type='symbol' layout=(hash icon-image='rocket-15')}}/>
      </MapboxGlSource>
    `);

    assert.ok(addLayerSpy.calledOnce, 'addLayer called once');
    assert.strictEqual(
      (addLayerSpy.firstCall.args[0] as Layer).source,
      this.sourceId,
      'correct sourceId is used'
    );
  });

  test('it cleans up sources before its containing map is removed when the map goes away', async function (this: Context, assert) {
    // a TypeError would be thrown during this test if it doesn't work
    this.options = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [-76.53063297271729, 39.18174077994108],
            },
          },
        ],
      },
    };

    this.sourceId = 'evewvrwvwrvw';

    let addSourceSpy: Sinon.SinonSpy | undefined;
    let removeSourceSpy: Sinon.SinonSpy | undefined;

    this.mapLoaded = (map) => {
      addSourceSpy = this.sandbox.spy(map, 'addSource');
      removeSourceSpy = this.sandbox.spy(map, 'removeSource');
    };

    await render(hbs`
      <MapboxGl @mapLoaded={{this.mapLoaded}} as |map|>
        <map.source @sourceId={{this.sourceId}} @options={{this.options}}/>
        <div id='loaded-sigil'></div>
      </MapboxGl>
    `);

    await waitFor('#loaded-sigil');

    assert.ok(addSourceSpy?.calledOnce, 'addSource called once');
    assert.strictEqual(
      addSourceSpy?.firstCall.args[0],
      this.sourceId,
      'correct sourceId is added'
    );
    assert.deepEqual(
      addSourceSpy?.firstCall.args[1],
      this.options,
      'correct source options'
    );

    await clearRender();

    assert.ok(removeSourceSpy?.calledOnce, 'removeSource called once');
    assert.strictEqual(
      removeSourceSpy?.firstCall.args[0],
      this.sourceId,
      'correct sourceId is removed'
    );
  });

  test('it yields the sourceId', async function (this: Context, assert) {
    this.data = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [-76.53063297271729, 39.18174077994108],
          },
        },
      ],
    }
    
    await render(
      hbs`
        <MapboxGlSource @sourceId='test-source-id' @map={{this.map}} @options={{hash type='geojson' data=this.data}} as |source|>
          <div id='source'>
            {{source.id}}
          </div>
        </MapboxGlSource>
      `
    );

    assert.dom('#source').hasText('test-source-id');
  });
});
