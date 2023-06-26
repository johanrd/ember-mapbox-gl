import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mapbox gl call', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls the function on the object', async function (assert) {
    assert.expect(3);
    const expectedArgs = ['a', 1, 'z'];
    const expectedResp = 'hello';
    const obj = {
      func(...args: any[]) {
        assert.deepEqual(args, expectedArgs, 'should pass on args');
        assert.strictEqual(this, obj, 'should set the context to the obj');
        return expectedResp;
      },
    };

    this.set('obj', obj);
    this.set('args', expectedArgs);
    this.set('onResp', (resp: any) => {
      assert.strictEqual(
        resp,
        expectedResp,
        'should call the onResp action with the obj.func result'
      );
    });

    await render(
      hbs`<MapboxGlCall @obj={{this.obj}} @func='func' @positionalArguments={{this.args}} @onResp={{this.onResp}} />`
    );
  });
});
