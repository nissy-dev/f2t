const t = require('@babel/types')

function buildPlugin(visitors) {
  const visitorMap = {}
  for (const visitor of visitors) visitorMap[visitor.name] = visitor

  return () => ({
    name: 'babel-plugin-flow-to-typescript-react',
    visitor: visitorMap,
    manipulateOptions(_opts, parserOpts) {
      parserOpts.plugins.push('flow')
    },
  })
}

const typeNameMap = {
  Node: 'ReactNode',
}
const rename = name => typeNameMap[name] || name

const addReactPrefixVisitor = {
  JSXIdentifier(path) {
    if (!this.shouldReplaceIdentifiers.includes(path.node.name)) {
      return
    }

    path.node.name = `React.${path.node.name}`
  },
  Identifier(path) {
    if (path.findParent(t.isImportSpecifier)) {
      return
    }
    if (!this.shouldReplaceIdentifiers.includes(path.node.name)) {
      return
    }
    path.node.name = rename(path.node.name)

    path.node.name = `React.${path.node.name}`
  },
  QualifiedTypeIdentifier(path) {
    if (path.node.qualification.name !== 'React') {
      return
    }
    path.node.id.name = rename(path.node.id.name)
  },
}

function ImportDeclaration(path) {
  if (path.node.source.value === 'react') {
    path.node.specifiers = path.node.specifiers.map(
      s =>
        s.type === 'ImportDefaultSpecifier'
          ? t.ImportNamespaceSpecifier(t.Identifier('React'))
          : s
    )
    const shouldReplaceIdentifiers = path.node.specifiers
      .filter(s => s.type === 'ImportSpecifier')
      .map(s => s.local.name)
    path
      .findParent(t.isProgram)
      .traverse(addReactPrefixVisitor, { shouldReplaceIdentifiers })
    path.node.specifiers = path.node.specifiers.filter(
      s => s.type === 'ImportNamespaceSpecifier'
    )
  }
}

module.exports = buildPlugin([ImportDeclaration])
