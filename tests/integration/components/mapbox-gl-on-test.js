import { next } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mapbox gl on', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.actions = {};
    this.send = (actionName, ...args) =>
      this.actions[actionName].apply(this, args);
  });

  test('it renders', async function (assert) {
    const done = assert.async();

    const event = {};

    this.set('eventSource', {
      on(eventName, cb) {
        assert.strictEqual(eventName, 'onzoom', 'subscribes to event name');

        next(cb, event);
      },

      off() {},
    });

    this.onEvent = (ev) => {
      assert.strictEqual(ev, event, 'sends event to the action');
      done();
    };

    await render(
      hbs`<MapboxGlOn @event='onzoom' @action={{this.onEvent}} @eventSource={{this.eventSource}}/>`
    );
  });

  test('it takes a layerId to target', async function (assert) {
    assert.expect(5);
    const done = assert.async();

    const event = {};

    this.set('eventSource', {
      on(eventName, source, cb) {
        assert.strictEqual(eventName, 'onzoom', 'subscribes to event name');
        assert.strictEqual(source, 'layer1', 'passes on layer');

        next(cb, event);
      },

      off(eventName, source) {
        assert.strictEqual(eventName, 'onzoom', 'unsubscribes to event name');
        assert.strictEqual(source, 'layer1', 'passes on layer');
      },
    });

    this.onEvent = (ev) => {
      assert.strictEqual(ev, event, 'sends event to the action');
      done();
    };

    await render(
      hbs`<MapboxGlOn @event='onzoom' @layerId='layer1' @action={{this.onEvent}} @eventSource={{this.eventSource}}/>`
    );
  });
});
