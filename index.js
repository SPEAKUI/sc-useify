var is = require( "sc-is" ),
  noop = function () {};

var use = function ( _objectOrFunction ) {
  var self, obj = _objectOrFunction;

  self = function ( _function ) {
    self.functions.push( _function );
    return self.obj;
  };

  self.obj = _objectOrFunction.prototype || _objectOrFunction;
  self.clear = function () {
    self.functions = [];
  }
  self.run = function () {
    run.apply( self, arguments );
  };

  self.clear();

  return self;
};

var run = function () {
  var self = this,
    currentFunction = 0,
    args = Array.prototype.slice.call( arguments ),
    callback = args[ args.length - 1 ];

  callback = is.fn( callback ) ? args.pop() : noop;

  var next = function () {
    var fn = self.functions[ currentFunction++ ],
      args = Array.prototype.slice.call( arguments );

    if ( !fn ) {
      callback.apply( self.obj, args );
    } else {
      args.push( next );
      fn.apply( self.obj, args );
    }

  };

  next.apply( self.obj, args );

}

var Useify = function ( _objectOrFunction ) {

  if ( is.object( _objectOrFunction ) ) {
    Object.defineProperty( _objectOrFunction, "use", {
      value: use( _objectOrFunction )
    } );
  } else if ( is.fn( _objectOrFunction ) ) {
    _objectOrFunction.prototype.use = _objectOrFunction.use = use( _objectOrFunction );
  }

};

module.exports = Useify;