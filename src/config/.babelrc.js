module.exports =  {
  plugins: [
    "@babel/plugin-syntax-object-rest-spread",
    "@babel/plugin-syntax-class-properties",
    "@babel/plugin-syntax-flow",
    "@babel/plugin-syntax-jsx",
    "./dist/babel-plugin-flow-to-typescript-react/index.js",
    "babel-plugin-flow-to-typescript"
  ]
}
