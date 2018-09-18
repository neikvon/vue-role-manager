const path = require('path')
const pkg = require(path.join(process.cwd(), 'package.json'))

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * Authors: ${pkg.author}
 * Date:    ${datetimeFormat(new Date())}
*/`

function datetimeFormat (dt) {
  const year = dt.getFullYear()
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  const date = (dt.getDate() + '').padStart(2, '0')
  const hour = (dt.getHours() + '').padStart(2, '0')
  const minute = (dt.getMinutes() + '').padStart(2, '0')
  const second = (dt.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}

module.exports = {
  src: 'src',
  dist: 'dist',

  // Bundles config
  // Type of output: amd, cjs, es, iife, umd
  // https://rollupjs.org/guide/en#big-list-of-options
  builds: [
    {
      entry: 'index.js',
      dest: 'vue-role-manager.umd.js',
      format: 'umd',
      name: 'VueRoleManager',
      banner
    },
    {
      entry: 'index.js',
      dest: 'vue-role-manager.umd.min.js',
      format: 'umd',
      name: 'VueRoleManager',
      uglify: true,
      banner
    },
    {
      entry: 'index.js',
      dest: 'vue-role-manager.esm.js',
      format: 'es',
      banner
    },
    {
      entry: 'index.js',
      dest: 'vue-role-manager.common.js',
      format: 'cjs',
      banner
    }
  ],
  // builds: {},

  sourcemap: true,

  // Docs: https://buble.surge.sh/guide/#options
  buble: {
    // Docs: https://buble.surge.sh/guide/#list-of-transforms
    transforms: {
      arrow: true,
      classes: true,
      defaultParameter: true,
      destructuring: true,
      forOf: true,
      generator: true,
      letConst: true,
      parameterDestructuring: true,
      spreadRest: true,
      templateString: true
    },
    objectAssign: 'Object.assign'
  },

  eslint: {
    enable: true,
    options: {
      extends: 'eslint-config-standard',
      parser: 'babel-eslint',
      parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module',
        ecmaFeatures: {
          experimentalObjectRestSpread: true
        }
      },
      env: {
        node: true
      },
      // http://eslint.org/docs/user-guide/configuring
      rules: {
        // rules docs: https://standardjs.com/rules.html
        semi: ['error', 'never'],
        indent: ['error', 2]
      }
      // fix: true,
      // emitError: true,
      // emitWarning: true
    }
  },

  // docs: https://github.com/mishoo/UglifyJS2/tree/harmony#minify-options
  uglify: {
    toplevel: true,
    output: {
      comments: (node, comment) =>
        /\/*!|@preserve|@license|@cc_on/i.test(comment.value)
    }
  },

  // docs: https://github.com/egoist/rollup-plugin-postcss#options
  postcss: {
    extract: true
  },

  // docs: https://github.com/rollup/rollup-plugin-replace#options
  replace: {
    XXX: 'xxx'
  },

  // docs: https://github.com/rollup/rollup-plugin-alias#rollup-plugin-alias
  alias: {},

  copy: {
    // 'static/x': 'dist/static/x',
  }
}
