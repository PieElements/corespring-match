 
  //auto generated on: Wed Mar 08 2017 16:59:03 GMT-0500 (EST)
  
  module.exports = {
  "module": {
    "rules": [
      {
        "test": /.*\/highlight\.js\/styles\/default\.css$/,
        "use": [
          "raw-loader"
        ]
      },
      {
        "test": /\.css$/,
        "use": [
          "style-loader",
          "css-loader"
        ],
        "exclude": [
          /.*highlight\.js.*/
        ]
      },
      {
        "test": /\.(jsx)?$/,
        "use": [
          {
            "loader": "babel-loader",
            "options": {
              "babelrc": false,
              "presets": [
                "babel-preset-react"
              ]
            }
          }
        ]
      },
      {
        "test": /\.less$/,
        "use": [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      }
    ]
  },
  "resolveLoader": {
    "modules": [
      "node_modules",
      "/Users/bburton/Workspace/corespring-match/docs/demo/node_modules",
      "/Users/bburton/Workspace/pie-cli/node_modules"
    ]
  },
  "context": "/Users/bburton/Workspace/corespring-match/docs/demo",
  "entry": "./.all-in-one.entry.js",
  "output": {
    "filename": "./pie-item.js",
    "path": "/Users/bburton/Workspace/corespring-match/docs/demo"
  },
  "resolve": {
    "modules": [
      "node_modules",
      "/Users/bburton/Workspace/corespring-match/docs/demo/controllers/node_modules",
      "/Users/bburton/Workspace/pie-cli/node_modules"
    ],
    "extensions": [
      ".js",
      ".jsx"
    ]
  }
};
  