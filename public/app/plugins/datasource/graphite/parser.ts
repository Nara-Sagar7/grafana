
import {Lexer} from './lexer';
import _ from 'lodash';

export function Parser(expression) {
  this.expression = expression;
  this.lexer = new Lexer(expression);
  this.tokens = this.lexer.tokenize();
  this.index = 0;
}

Parser.prototype = {

  getAst: function () {
    return this.start();
  },

  start: function () {
    try {
      return this.functionCall() || this.metricExpression();
    } catch (e) {
      return {
        type: 'error',
        message: e.message,
        pos: e.pos
      };
    }
  },

  curlyBraceSegment: function() {
    if (this.match('identifier', '{') || this.match('{')) {

      var curlySegment = "";

      while (!this.match('') && !this.match('}')) {
        curlySegment += this.consumeToken().value;
      }

      if (!this.match('}')) {
        this.errorMark("Expected closing '}'");
      }

      curlySegment += this.consumeToken().value;

      // if curly segment is directly followed by identifier
      // include it in the segment
      if (this.match('identifier')) {
        curlySegment += this.consumeToken().value;
      }

      return {
        type: 'segment',
        value: curlySegment
      };
    } else {
      return null;
    }
  },

  metricSegment: function() {
    var curly = this.curlyBraceSegment();
    if (curly) {
      return curly;
    }

    if (this.match('identifier') || this.match('number')) {
      // hack to handle float numbers in metric segments
      var parts = this.consumeToken().value.split('.');
      if (parts.length === 2) {
        this.tokens.splice(this.index, 0, { type: '.' });
        this.tokens.splice(this.index + 1, 0, { type: 'number', value: parts[1] });
      }

      return {
        type: 'segment',
        value: parts[0]
      };
    }

    if (!this.match('templateStart')) {
      this.errorMark('Expected metric identifier');
    }

    this.consumeToken();

    if (!this.match('identifier')) {
      this.errorMark('Expected identifier after templateStart');
    }

    var node = {
      type: 'template',
      value: this.consumeToken().value
    };

    if (!this.match('templateEnd')) {
      this.errorMark('Expected templateEnd');
    }

    this.consumeToken();
    return node;
  },

  metricExpression: function() {
    if (!this.match('templateStart') && !this.match('identifier') && !this.match('number') && !this.match('{')) {
      return null;
    }

    var node = {
      type: 'metric',
      segments: [],
      dataview: {name: 'avg', variable: ''}
    };

    node.segments.push(this.metricSegment());

    while (this.match('.')) {
      this.consumeToken();

      var segment = this.metricSegment();
      if (!segment) {
        this.errorMark('Expected metric identifier');
      }

      node.segments.push(segment);
    }

    // hacky way to check if, on splitting on colon, the last segment is a dataview.
    // Amends last segment value if so.

    var lastsegvalue = node.segments[node.segments.length-1].value;
    var lastseg = lastsegvalue.split(':');
    if (lastseg.length > 1) {
      var finalview = lastseg[lastseg.length-1];
      var dataviews: any[] = [/avg/,/sumrate/,/(sum)(\d+)/,/sum/,/min/,/max/,/obvs/,/obvsrate/,/(\d{1,2})(pct)/];

      for (var i = 0; i < dataviews.length; i++) {
        var result = dataviews[i].exec(finalview);
        if (result) {
          console.log(result);
          node.dataview.name = /[a-zA-Z]+/.exec(result[0])[0];
          if (result.length > 1) {
            node.dataview.name += 'X';
            var variable = parseInt(result[1]) || parseInt(result[2]);
            node.dataview.variable = variable.toString();
          };
          lastsegvalue = lastsegvalue.slice(0,lastsegvalue.length - (finalview.length+1));
          node.segments[node.segments.length-1].value = lastsegvalue;
          break;
        };

      };
    }
    console.log(node);
    return node;
  },

  functionCall: function() {
    if (!this.match('identifier', '(')) {
      return null;
    }

    var node: any = {
      type: 'function',
      name: this.consumeToken().value,
    };

    // consume left parenthesis
    this.consumeToken();

    node.params = this.functionParameters();

    if (!this.match(')')) {
      this.errorMark('Expected closing parenthesis');
    }

    this.consumeToken();

    return node;
  },

  boolExpression: function() {
    if (!this.match('bool')) {
      return null;
    }

    return {
      type: 'bool',
      value: this.consumeToken().value === 'true',
    };
  },

  functionParameters: function () {
    if (this.match(')') || this.match('')) {
      return [];
    }

    var param =
      this.functionCall() ||
      this.numericLiteral() ||
      this.seriesRefExpression() ||
      this.boolExpression() ||
      this.metricExpression() ||
      this.stringLiteral();

    if (!this.match(',')) {
      return [param];
    }

    this.consumeToken();
    return [param].concat(this.functionParameters());
  },

  seriesRefExpression: function() {
    if (!this.match('identifier')) {
      return null;
    }

    var value = this.tokens[this.index].value;
    if (!value.match(/\#[A-Z]/)) {
      return null;
    }

    var token = this.consumeToken();

    return {
      type: 'series-ref',
      value: token.value
    };
  },

  numericLiteral: function () {
    if (!this.match('number')) {
      return null;
    }

    return {
      type: 'number',
      value: parseFloat(this.consumeToken().value)
    };
  },

  stringLiteral: function () {
    if (!this.match('string')) {
      return null;
    }

    var token = this.consumeToken();
    if (token.isUnclosed) {
      throw { message: 'Unclosed string parameter', pos: token.pos };
    }

    return {
      type: 'string',
      value: token.value
    };
  },

  errorMark: function(text) {
    var currentToken = this.tokens[this.index];
    var type = currentToken ? currentToken.type : 'end of string';
    throw {
      message: text + " instead found " + type,
      pos: currentToken ? currentToken.pos : this.lexer.char
    };
  },

  // returns token value and incre
  consumeToken: function() {
    this.index++;
    return this.tokens[this.index - 1];
  },

  matchToken: function(type, index) {
    var token = this.tokens[this.index + index];
    return (token === undefined && type === '') ||
      token && token.type === type;
  },

  match: function(token1, token2) {
    return this.matchToken(token1, 0) &&
      (!token2 || this.matchToken(token2, 1));
  },
};

