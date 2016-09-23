import React, { Component } from 'react';
import Codemirror from 'react-codemirror';
import 'codemirror/mode/pug/pug';
import 'codemirror/mode/xml/xml';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import back from './back.png';
import ls from 'local-storage';
import lex from 'pug-lexer';
import parse from 'pug-parser';
import wrap from 'pug-runtime/wrap';
import generateCode from 'pug-code-gen';
import htmlparser2 from 'htmlparser2';

import 'flag-icon-css/css/flag-icon.css';

const countries = [
  'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar',
  'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be',
  'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq',
  'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd',
  'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr',
  'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm',
  'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'fi',
  'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf',
  'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs',
  'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu',
  'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it',
  'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn',
  'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk',
  'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me',
  'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq',
  'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na',
  'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu',
  'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm',
  'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs',
  'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si',
  'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv',
  'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk',
  'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua',
  'ug', 'um', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi',
  'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw'
];

const int = n => Math.round(parseFloat(n));

const trimPath = path =>
  path
    .replace(/(\d)[^\da-zA-Z]+([a-zA-Z])/g, '$1$2')
    .replace(/([a-zA-Z])[^\da-zA-Z]+(\d)/g, '$1$2')
    .replace(/[,\s]+/g, ' ')
    .replace(
      /(m|M|l|L|t|T)([\d.]+)\s([\d.]+)/g,
      (m, type, x, y) => `${type}${int(x)} ${int(y)}`
    )
    .replace(
      /(a|A)([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)/g,
      (m, type, rx, ry, rot, laf, sf, x, y) =>
        `${type}${int(rx)} ${int(ry)} ${rot} ${laf} ${sf} ${int(x)} ${int(y)}`
    )
    .replace(
      /(c|C)([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)/g,
      (m, type, x1, y1, x2, y2, x, y) =>
        `${type}${x1} ${y1} ${x2} ${y2} ${int(x)} ${int(y)}`
    )
    .replace(
      /(s|S|q|Q)([\d.]+)\s([\d.]+)\s([\d.]+)\s([\d.]+)/g,
      (m, type, x2, y2, x, y) =>
        `${type}${x2} ${y2} ${int(x)} ${int(y)}`
    )
    .replace(
      /(h|H|v|V)([\d.]+)/g,
      (m, type, x) => `${type}${int(x)}`
    );

const parseAttr = (name, val) =>
  name === 'd' ?
    `"${trimPath(val)}"` :
    (/^[.\d]+$/.test(val) ? val : `"${val}"`);

const processNode = node =>
  node.type === 'attribute' && node.name === 'd' ?
    { ...node, val: trimPath(node.val)} :
    node;

const xmlify = pug => {  
  try {
    const ast = lex(pug).map(processNode);
    const funcStr = generateCode(parse(ast), {
      compileDebug: false,
      pretty: true,
      inlineRuntimeFunctions: false,
      templateName: 'xmlify'
    });

    return {
      pug,
      svg: wrap(funcStr, 'xmlify')()
        .replace(/<([^\s]+)([^>]*)><\/(\1)>/g, '<$1$2 />')
        .trim(),
      error: undefined
    };
  } catch(e) {
    return {
      pug,
      error: e.message
    };
  }
}

const pugify = svg => {
  let ast = [];
  let offset = 0;

  const parser = new htmlparser2.Parser({
    onopentag: (name, attrs) => {
      ast.push({
        offset,
        name,
        attrs: Object.keys(attrs).map(n => `${n}=${parseAttr(n, attrs[n])}`)
      });

      offset++;
    },
    onclosetag: (name) => {
      offset--;
    },
    oncomment: data => {
      ast.push({
        comment: data,
        offset
      })
    }
  });

  try {
    parser.parseComplete(svg);

    const pug = ast.reduce((str, node) => {
      str += '  '.repeat(node.offset);

      if (!node.name) {
        return `${str}//${node.comment.replace(/\n/g, ' ')}\n`;
      }

      str += node.name;

      if (node.attrs.length) {
        str += `(${node.attrs.join(' ')})`;
      }

      return str + '\n';
    }, '');

    return {
      svg,
      pug,
      error: undefined
    };
  } catch (e) {
    return {
      svg,
      error: e.message
    };
  }
}

const DEFAULT_SVG = `
svg(width="100%" height="100%" viewbox="0 0 120 90" fill='transparent' style='display: block')
  rect(fill='red' width=120 height=30)
  rect(fill='blue' y=30 width=120 height=30)
  rect(fill='white' y=60 width=120 height=30)
`.trim();

class App extends Component {
  constructor(props) {
    super(props);
    const pug = ls('pug') || DEFAULT_SVG;
    this.state = {
      pug,
      svg: '',
      ...xmlify(pug),
      country: 'ad'
    };
  }

  componentDidMount() {
    this.refs.pugEditor.codeMirror.setSize('100%', '100%');
    this.refs.svgEditor.codeMirror.setSize('100%', '100%');
  }

  render() {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div
            style={{
              flex: '0 0 50%',
              background: '#272822',
              padding: '0 1rem',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              boxSizing: 'border-box',
              flex: '0 0 50%',
              padding: '1rem 0',
              borderBottom: '2px solid #444444'
            }}>
              <Codemirror
                ref='pugEditor'
                value={this.state.pug}
                onChange={this.handlePugInput}
                options={{
                  mode: 'pug',
                  theme: 'monokai',
                  lineWrapping: true,
                  tabSize: 2,
                  extraKeys: {
                    Tab: function(cm) {
                      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                      cm.replaceSelection(spaces);
                    }
                  }
                }}
              />
            </div>
            <div style={{
              boxSizing: 'border-box',
              flex: '0 1 50%',
              padding: '1rem 0',
              position: 'relative'
            }}>
              <Codemirror
                ref='svgEditor'
                value={this.state.svg}
                onChange={this.handleSvgInput}
                options={{
                  mode: 'xml',
                  theme: 'monokai',
                  lineWrapping: true,
                  tabSize: 2,
                  extraKeys: {
                    Tab: function(cm) {
                      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                      cm.replaceSelection(spaces);
                    }
                  }
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                color: '#FFFFFF'
              }}>{this.state.svg.length}</div>
            </div>
          </div>
          <div
            style={{
              flex: '0 0 50%',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url('${back}')`
            }}
          >
            {this.state.error && this.renderError(this.state.error)}
            {!this.state.error && this.renderFlags(16, 12, 0, true)}
            {!this.state.error && this.renderFlags(6, 4.5, 3)}
            {!this.state.error && this.renderFlags(2, 1.5, 2)}
            {!this.state.error && this.renderFlags(1, 0.75, 1.5)}
          </div>
        </div>
      </div>
    );
  }

  renderError(error) {
    return (
      <div style={{ margin: '5rem' }}>
        {error}
      </div>
    );
  }

  renderFlags(w, h, top, select) {
    return (
      <div style={{ display: 'flex', marginTop: `${top}rem` }}>
        <div style={{
          flex: '0 0 50%',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <div
            style={{
              flex: '0 0 auto',
              width: `${w}rem`,
              height: `${h}rem`,
              boxShadow: '0 0 0 1px #000000'
            }}
            dangerouslySetInnerHTML={{ __html: this.state.svg }}
          />
        </div>
        <div style={{
          flex: '0 0 50%',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <div
            className={`flag-icon flag-icon-${this.state.country}`}
            style={{
              flex: '0 0 auto',
              width: `${w}rem`,
              height: `${h}rem`,
              boxShadow: '0 0 0 1px #000000'
            }}
          />
          {select &&
            <div style={{ flex: '0 0 auto', marginTop: '0.5rem' }}>
              <select
                onChange={e => this.setState({ country: e.target.value })}
                style={{ fontSize: 18, borderColor: '#CCC' }}
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          }
        </div>
      </div>
    );
  }

  handlePugInput = pug => {
    ls('pug', pug);
    this.setState(xmlify(pug));
  };

  handleSvgInput = svg => {
    const state = pugify(svg);
    if (state.pug) {
      ls('pug', state.pug);
    }
    this.setState(state);
  };
}

export default App;
