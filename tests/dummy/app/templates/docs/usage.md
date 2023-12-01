# Usage

<strong>Note:</strong> The example below uses [ember-composable-helpers](https://github.com/DockYard/ember-composable-helpers).

Add the following map options to `config/environment.js` to style the map, set a default zoom level, and to provide a default centerpoint:

```javascript
'mapbox-gl': {
  accessToken: 'ACCESS TOKEN HERE',
  map: {
    style: 'mapbox://styles/mapbox/basic-v9',
    zoom: 13,
    center: [ -96.7969879, 32.7766642 ]
  }
},
```

```javascript
import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MapController extends Controller {
  marker = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [ -96.7969879, 32.7766642 ] }
      }
    ]
  };

  @action
  mapClicked({ target: map, point }) {
    console.log(map, point);
  }
}
```

```handlebars
<MapboxGl class='map-container' @initOptions={{hash pitch=30}} as |map|>
  <map.on @event='click' @action={{this.mapClicked}}/>

  <map.source @options={{hash type='geojson' data=this.marker}} as |source|>
    <source.layer
      @layer={{hash
        type='circle'
        paint=(hash circle-color='#007cbf' circle-radius=10)
      }}
    />
  </map.source>
</MapboxGl>
```

The above example does the following:

* Creates an instance of a map
* Attaches a `mapClicked` action when anywhere on the map is clicked
* Generates a geojson map source (`marker`)
* Draws a blue circle on the map at the coordinates provided by `marker`
