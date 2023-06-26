import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clearRender, render, TestContext} from '@ember/test-helpers';
import { Promise } from 'rsvp';
import setupMap from '../../helpers/create-map';
import { hbs } from 'ember-cli-htmlbars';
import Sinon from 'sinon';
import { all, defer as createDeferred } from 'rsvp';

import { MapboxGlImageComponentArgs } from 'ember-mapbox-gl/components/mapbox-gl-image';

interface Context extends MapboxGlImageComponentArgs, TestContext {
  sandbox: Sinon.SinonSandbox;
}

module('Integration | Component | mapbox gl image', function (hooks) {
  setupMap(hooks);
  setupRenderingTest(hooks);

  hooks.before(function (this: Context) {
    this.sandbox = Sinon.createSandbox();
  });

  hooks.afterEach(function (this: Context) {
    this.sandbox.restore();
  });

  test('it ignores undefined image', async function (this: Context, assert) {
    const loadImageSpy = this.sandbox.spy(this.map, 'loadImage');

    await render(hbs`<MapboxGlImage @map={{this.map}}/>`);

    assert.false(loadImageSpy.calledOnce, 'loadImage not called');
  });

  test('it adds the image to the map', async function (this: Context, assert) {
    const loadImageSpy = this.sandbox.spy(this.map, 'loadImage');
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');
    const removeImageSpy = this.sandbox.spy(this.map, 'removeImage');

    const defer = createDeferred();

    this.setProperties({
      name: 'logo',
      url: '/assets/mapbox-logo.png',
      options: {},
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );

    assert.ok(loadImageSpy.called, 'loadImage called');
    assert.strictEqual(
      loadImageSpy.firstCall.args[0],
      this.url,
      'loads correct image'
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
    assert.strictEqual(
      addImageSpy.firstCall.args[2],
      this.options,
      'adds with correct options'
    );

    await clearRender();

    assert.ok(removeImageSpy.calledOnce, 'removeImage called');
    assert.strictEqual(
      removeImageSpy.firstCall.args[0],
      this.name,
      'removes correct name'
    );
  });

  test('it only adds the latest image if image is updated before the previous image finishes loading', async function (this: Context, assert) {
    const loadImageSpy = this.sandbox.spy(this.map, 'loadImage');
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');

    const defer = createDeferred();

    this.setProperties({
      name: 'logo',
      url: '/assets/creativecommons-128.png',
      options: {},
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );
    
    assert.ok(loadImageSpy.calledOnce, 'loadImage called');
    assert.strictEqual(
      loadImageSpy.firstCall.args[0],
      this.url,
      'loads correct image'
    );

    // this.set('image', '/assets/mapbox-logo.png');
    this.set('url', '/assets/mapbox-logo.png');

    assert.ok(loadImageSpy.calledTwice, 'loadImage called');
    assert.strictEqual(
      loadImageSpy.secondCall.args[0],
      this.url,
      'loads correct image'
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
    assert.strictEqual(
      addImageSpy.firstCall.args[2],
      this.options,
      'adds with correct options'
    );
    await clearRender();
  });

  test("it doesn't load the image if the component is destroyed before the image has loaded", async function (this: Context, assert) {
    // on the first call, store the args, and then after clearRender trigger the real call
    const loadImageStub = this.sandbox.stub(this.map, 'loadImage');
    let loadImageArgs : [url: string, callback: (error?: Error | undefined, result?: HTMLImageElement | ImageBitmap | undefined) => void] | undefined
    loadImageStub.onFirstCall().callsFake((...args) => {
      loadImageArgs = args;
    });
    loadImageStub.callThrough();

    const addImageSpy = this.sandbox.spy(this.map, 'addImage');

    this.setProperties({
      name: 'logo',
      url: '/assets/creativecommons-128.png',
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @map={{this.map}}/>`
    );

    assert.ok(loadImageStub.calledOnce, 'loadImage called');
    assert.strictEqual(
      loadImageStub.firstCall.args[0],
      this.url,
      'loads correct image'
    );

    await clearRender();
    if (loadImageArgs) this.map.loadImage(...loadImageArgs);

    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.notOk(addImageSpy.calledOnce, 'addImage not called');
  });

  test('it allows the image to be updated', async function (this: Context, assert) {
    const loadImageSpy = this.sandbox.spy(this.map, 'loadImage');
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');
    const removeImageSpy = this.sandbox.spy(this.map, 'removeImage');

    let defer = createDeferred();

    this.setProperties({
      name: 'logo',
      url: '/assets/mapbox-logo.png',
      options: {},
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );

    assert.ok(loadImageSpy.calledOnce, 'loadImage called');
    assert.strictEqual(
      loadImageSpy.firstCall.args[0],
      this.url,
      'loads correct image'
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
    assert.strictEqual(
      addImageSpy.firstCall.args[2],
      this.options,
      'adds with correct options'
    );

    defer = createDeferred();

    this.setProperties({
      name: 'updated-logo',
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    assert.ok(removeImageSpy.calledOnce, 'removeImage called');
    assert.strictEqual(
      removeImageSpy.firstCall.args[0],
      'logo',
      'removes old name'
    );

    assert.ok(loadImageSpy.calledTwice, 'loadImage called for updated image');
    assert.strictEqual(
      loadImageSpy.secondCall.args[0],
      this.url,
      'loads correct updated image'
    );

    await defer.promise;

    assert.ok(addImageSpy.calledTwice, 'addImage called for updated image');
    assert.strictEqual(
      addImageSpy.secondCall.args[0],
      this.name,
      'adds updated as correct name'
    );
    assert.strictEqual(
      addImageSpy.secondCall.args[2],
      this.options,
      'adds updated with correct options'
    );

    await clearRender();

    assert.ok(removeImageSpy.calledTwice, 'removeImage called for updated');
    assert.strictEqual(
      removeImageSpy.secondCall.args[0],
      this.name,
      'removes updated name'
    );
  });

  test('it allows options to not be passed', async function (this: Context, assert) {
    const loadImageSpy = this.sandbox.spy(this.map, 'loadImage');
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');

    const defer = createDeferred();

    this.setProperties({
      name: 'logo',
      url: '/assets/mapbox-logo.png',
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );

    assert.ok(loadImageSpy.calledOnce, 'loadImage called');
    assert.strictEqual(
      loadImageSpy.firstCall.args[0],
      this.url,
      'loads correct image'
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
  });

  test('it allows svgs to be added', async function (this: Context, assert) {
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');

    const defer = createDeferred();

    this.setProperties({
      name: 'marker',
      url: '/assets/marker.svg',
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
    assert.ok(addImageSpy.firstCall.args[1] instanceof Image, 'adds image');
  });

  test('it allows svgs to be added with custom width and height', async function (this: Context, assert) {
    const addImageSpy = this.sandbox.spy(this.map, 'addImage');

    const defer = createDeferred();

    this.setProperties({
      name: 'marker-custom-width',
      url: '/assets/marker.svg',
      width: 64,
      height: 64,
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    await render(
      hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @width={{this.width}} @height={{this.height}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
    );

    await defer.promise;

    assert.ok(addImageSpy.calledOnce, 'addImage called');
    assert.strictEqual(
      addImageSpy.firstCall.args[0],
      this.name,
      'adds as correct name'
    );
    assert.ok(addImageSpy.firstCall.args[1] instanceof Image, 'adds image');
    assert.strictEqual(
      (addImageSpy.firstCall.args[1] as HTMLImageElement).width,
      this.width,
      'image has width'
    );
    assert.strictEqual(
      (addImageSpy.firstCall.args[1] as HTMLImageElement).height,
      this.height,
      'image has height'
    );
  });

  test('it sends out an error if provided a bad svg', async function (this: Context, assert) {
    const defer = createDeferred();

    this.setProperties({
      name: 'bad-marker',
      url: '/assets/bad-marker.svg',
      onLoad: defer.resolve,
      onError: defer.reject,
    });

    try {
      await all([
        render(
          hbs`<MapboxGlImage @name={{this.name}} @url={{this.url}} @options={{this.options}} @map={{this.map}} @onLoad={{this.onLoad}} @onError={{this.onError}}/>`
        ),
        defer.promise,
      ]);
      assert.ok(false, 'should have gotten error');
    } catch (err: any) {
      assert.strictEqual(
        err.message,
        'Failed to load svg',
        'correct err message'
      );
      assert.ok(err.event, 'should have original error event attached');
    }
  });
});
