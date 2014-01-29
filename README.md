# Useify
---

`Useify` is a middleware implementation that extends objects.

## Example

```javascript
// var Useify = require( "sc-useify" ),
//   should = require( "should" );

var myClass = {
  value: 0
};

// `Useify` the class
Useify( myClass );

// Adds the first middleware function.
myClass.use( function ( _one, _two, _next ) {

  // The context `this` is a reference to the context class. In this example it is `myClass`
  var aValue = this.value + _one + _two;

  // Trigger the callback when this functions tasks are complete. Pass a dynmaic amount of
  // arguments to the next function.
  _next( aValue );

} );

// Adds the second middleware function. Note that the first argument is the paramater from the
// previous middleware function. The last argument should always be the callback to the next
// middleware function.
myClass.use( function ( _three, _next ) {

  _next( _three, 4 );

} ).use( function ( _three, _four, _next ) { // `use` can be chained

  _next( _three + _four + 5 );

} );

// Runs the middleware queue of functions. The last argument of `run` is a callback that is 
// triggered after the queue is emptied.
myClass.use.run( 1, 2, function ( _sum ) {

  should( _sum ).equal( 12 );
  _done();

} );
```

## API
---

### Useify(object)

Add `Useify` to an object

### object.use([params...], [fn])

Adds a middleware function to the queue. A dynamic amount of params can be passed from the previous middleware function. The callback must be the last paramater. `use` is chainable.

### object.use.run([params...], [fn])

Runs the queue of middleware functions in the order they were added. A dynamic amount of params can be passed from the previous middleware function. The callback must be the last paramater.

### object.use.clear()

Clears the queue of middleware functions. Suguar for ...

```javascript
object.use.functions = [];
```

### object.use.functions

A reference to the array of functions.

### object.use.obj

A reference to the context object.