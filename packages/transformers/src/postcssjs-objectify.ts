//@ts-nocheck
const pattern = /-(\w|$)/g;

const callback = (dashChar, char) => char.toUpperCase();



const camelCaseCSS = property => {
  property = property.toLowerCase();

  // NOTE :: IE8's "styleFloat" is intentionally not supported
  if (property === "float") {
    return "cssFloat";
  }
  // Microsoft vendor-prefixes are uniquely cased
  else if (property.startsWith("-ms-")) {
    return property.substr(1).replace(pattern, callback);
  }
  else {
    return property.replace(pattern, callback);
  }
};

function atRule(node) {
  if (typeof node.nodes === 'undefined') {
    return true
  } else {
    return process(node)
  }
}

function objectify(node) {
  var name
  var result = {}

  node.each(function (child) {
    if (child.type === 'atrule') {
      name = '@' + child.name
      if (child.params) name += ' ' + child.params
      if (typeof result[name] === 'undefined') {
        result[name] = atRule(child)
      } else if (Array.isArray(result[name])) {
        result[name].push(atRule(child))
      } else {
        result[name] = [result[name], atRule(child)]
      }
    } else if (child.type === 'rule') {
      var body = process(child)
      if (result[child.selector]) {
        for (var i in body) {
          result[child.selector][i] = body[i]
        }
      } else {
        result[child.selector] = body
      }
    } else if (child.type === 'decl') {
      if (child.prop.startsWith('--')) {
        name = child.prop
      } else {
        name = camelCaseCSS(child.prop)
      }
      var value = child.value
      if (child.important) value += ' !important'
      if (typeof result[name] === 'undefined') {
        result[name] = value
      } else if (Array.isArray(result[name])) {
        result[name].push(value)
      } else {
        result[name] = [result[name], value]
      }
    }
  })
  return result
}

module.exports = objectify
