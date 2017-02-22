# corespring-match

[![Build Status](https://travis-ci.org/PieElements/corespring-match.svg?branch=develop)](https://travis-ci.org/PieElements/corespring-match)

A [pie](https://pielabs.github.io/pie-docs/) match component.

![match.png](match.png)

## Usage

To use this pie, you need to configure it within an Assessment Item. This means that you'll need to add it to the `index.html` and `config.json` files.

```html
<corespring-match pie-id="1"></corespring-match>
```

```javascript
{
  "elements" : {
    "corespring-match": "PieElements/corespring-match"
    "version" : "1.0.0"
  },
  "models": [
    {
      "id": "1",
      // more configuration...
    }
  ]
}
```

### Pie Demo 
There is a demo in `docs/demo` that you can run to see an example of it's usage.

To preview it in that context you'll need the [pie](/PieLabs/pie-cli) tool.

```shell
npm install -g pie 
cd corespring-match/docs/demo
pie serve #will build and serve the pie... then go to http://localhost:4000
```

## Test 

```shell 
npm test # run client and controller tests
npm run client-test # run client tests
npm run controller-test # run controller tests
```
## Release

```shell
gulp release
git checkout master
npm publish
```