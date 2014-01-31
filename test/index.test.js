var should = require( "should" ),
  Useify = require( ".." );

describe( "sg-useify", function () {

  describe( "when given an object", function () {

    it( "should extend", function () {

      var myObject = {};

      Useify( myObject );

      myObject.should.have.a.property( "use" );

    } );

    it( "should handle more than 1 object in the same context", function ( _done ) {

      var class1 = {
        name: "class1",
        numUses: 0,
        doStuff: function ( _callback ) {
          var self = class1;
          self.useify.should.exist;
          self.useify.functions.all.should.have.a.lengthOf( 3 );
          self.should.have.a.property( "numUses", 0 );
          self.middleware( function () {
            self.should.have.a.property( "numUses", 3 );
            _callback();
          } );
        }
      };

      var class2 = {
        name: "class2",
        numUses: 0,
        doStuff: function () {
          var self = class2;
          self.useify.should.exist;
          self.useify.functions.all.should.have.a.lengthOf( 2 );
          self.should.have.a.property( "numUses", 0 );
          self.middleware( function () {

            self.should.have.a.property( "numUses", 2 );
            _done();

          } );
        }
      };

      Useify( class1 );
      Useify( class2 );

      class1.use( function ( _next ) {
        class1.numUses++;
        _next();
      } );

      class2.use( function ( _next ) {
        class2.numUses++;
        _next();
      } );

      class1.use( function ( _next ) {
        class1.numUses++;
        _next();
      } );

      class1.use( function ( _next ) {
        class1.numUses++;
        _next();
      } );

      class2.use( function ( _next ) {
        class2.numUses++;
        _next();
      } );

      class1.doStuff( function () {

        class2.doStuff();

      } );

    } );

    it( "should handle callbacks asynchronously", function ( _done ) {

      var aClass = {
        doStuff: function () {

          aClass.middleware( function ( _error, _res ) {

            _done();

          } );

        }
      };

      Useify( aClass );

      aClass.use( function ( _next ) {
        setTimeout( function () {
          _next();
        }, 10 );
      } );

      aClass.use( function ( _next ) {
        setTimeout( function () {
          _next();
        }, 20 );
      } );

      aClass.doStuff();

    } );

    it( "should handle callbacks with a dynamic amount of arguments", function ( _done ) {

      var aClass = {};

      Useify( aClass );

      aClass.use( function ( _one, _two, _next ) {
        should( _one ).equal( "one" );
        should( _two ).equal( "two" );
        _next( "one", "two", "three" );
      } );

      aClass.use( function ( _one, _two, _three, _next ) {

        _next.should.be.an.instanceof( Function );
        should( _one ).equal( "one" );
        should( _two ).equal( "two" );
        should( _three ).equal( "three" );

        _done();

      } );

      aClass.middleware( "one", "two" );

    } );

    it( "should handle chaining the 'use' and 'run' property", function ( _done ) {

      var aClass = {};

      Useify( aClass );

      aClass.use( function ( _next ) {
        _next( 1 );
      } ).use( function ( _counter, _next ) {
        _next( _counter + 2 );
      } ).use( function ( _counter, _next ) {
        _next( _counter + 3 );
      } ).middleware( function ( _counter ) {
        should( _counter ).equal( 6 );
        _done();
      } );

    } );

    it( "should be able to reference the context object within each fn", function ( _done ) {

      var aClass = {
        one: "one"
      };

      Useify( aClass );

      aClass.use( function ( _next ) {
        aClass.should.have.a.property( "one", "one" );
        aClass.two = "two";
        _next();
      } ).use( function ( _next ) {
        aClass.should.have.a.property( "two", "two" );
        aClass.three = "three";
        _next();
      } ).middleware( function () {
        aClass.should.have.a.property( "three", "three" );
        _done();
      } );

    } );

    it( "should pass the correct paramaters to the `run` callback", function ( _done ) {

      var aClass = {};

      Useify( aClass );

      aClass.use( function ( _next ) {
        _next( 1 );
      } ).use( function ( _counter, _next ) {
        _next( 2 );
      } ).use( function ( _counter, _next ) {
        _next();
      } ).middleware( function () {
        arguments.should.have.a.lengthOf( 0 );

        var bClass = {};

        Useify( bClass );

        bClass.use( function ( _next ) {
          _next( 1 );
        } ).use( function ( _counter, _next ) {
          _next( 2 );
        } ).use( function ( _counter, _next ) {
          _next( 1, 2, 3 );
        } ).middleware( function () {
          arguments.should.have.a.lengthOf( 3 );
          _done();
        } );
      } );

    } );

    it( "should trigger the callback for `run` when there are no middleware functions", function ( _done ) {

      var aClass = {};

      Useify( aClass );

      aClass.middleware( function () {
        _done();
      } );

    } );

    it( "should be able to clear the queue", function () {

      var aClass = {};

      Useify( aClass );

      aClass.use( function () {} ).use( function () {} ).use( function () {} );

      aClass.useify.functions.all.should.have.a.lengthOf( 3 );
      aClass.useify.clear();
      aClass.useify.functions.all.should.have.a.lengthOf( 0 );

    } );

    it( "should run the queue more than once", function ( _done ) {

      var aClass = {},
        counter = 0;

      Useify( aClass );

      aClass.use( function ( _next ) {
        counter++;
        _next();
      } );

      aClass.use( function ( _next ) {
        counter++;
        _next();
      } );

      aClass.middleware( function () {
        aClass.middleware( function () {
          should( counter ).equal( 4 );
          _done();
        } );
      } );

    } );

  } );

  describe( "when given a function", function () {

    it( "should add `use` to the prototype", function () {

      var MyClass = function () {},
        myClass;

      Useify( MyClass );

      MyClass.should.have.a.property( "use" );
      myClass = new MyClass();
      myClass.should.have.a.property( "middleware" );

    } );

    it( "should add `use` to the class definition and `useify` to the prototype", function ( _done ) {

      var myClass;

      var MyClass = function () {

        this.middleware( function () {
          this.counter.should.equal( 2 );
          _done();
        } );

      };

      MyClass.prototype.counter = 0;

      Useify( MyClass );

      MyClass.use( function ( _next ) {
        this.counter++;
        _next();
      } );

      MyClass.use( function ( _next ) {
        this.counter++;
        _next();
      } );

      myClass = new MyClass();

    } );

    it( "should ensure the correct context is passed to the middleware functions", function ( _done ) {

      var MyClass = function ( options ) {

        this.options = options;

      };

      MyClass.prototype.execute = function () {

        var self = this;

        this.middleware( function () {
          self.options.should.have.a.property( "isTrue", null );
          _done();
        } );

      };

      Useify( MyClass );

      MyClass.use( function ( _next ) {
        this.options.isTrue.should.be.true;
        this.options.isTrue = false;
        _next();
      } );

      MyClass.use( function ( _next ) {
        this.options.isTrue.should.be.false;
        this.options.isTrue = null;
        _next();
      } );

      myClass = new MyClass( {
        isTrue: true
      } );

      MyClass.useify.functions.all.should.be.an.instanceof( Array ).and.have.a.lengthOf( 2 );

      myClass.execute();

    } );

    it( "should use more than one middleware key", function ( _done ) {

      var MyClass = function () {

        this.name = "";

      };

      MyClass.prototype.execute = function () {

        var self = this;

        self.middleware( "start", function () {

          self.middleware( "all", function () {

            self.middleware( "end", function () {

              self.name = "David";
              _done();

            } );

          } );

        } );

      };

      Useify( MyClass );

      MyClass.use( "end", function ( _next ) {
        this.name += "i";
        _next();
      } );

      MyClass.use( "end", function ( _next ) {
        this.name += "d";
        _next();
      } );

      MyClass.use( function ( _next ) {
        this.name += "a";
        _next();
      } );

      MyClass.use( function ( _next ) {
        this.name += "v";
        _next();
      } );

      MyClass.use( "start", function ( _next ) {
        this.name += "D";
        _next();
      } );

      var myClass = new MyClass();
      myClass.execute();

    } );

  } );

  it( "should test the readme example", function ( _done ) {

    // var Useify = require( "Useify" ),
    //   should = require( "should" );

    var myClass = {
      value: 0
    };

    // `Useify` the class
    Useify( myClass );

    // Adds the first middleware function.
    myClass.use( function ( _one, _two, _next ) {

      // The context `this` is a reference to the context class. In this example it is `myClass`
      var aValue = myClass.value + _one + _two;

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
    myClass.middleware( 1, 2, function ( _sum ) {

      should( _sum ).equal( 12 );
      _done();

    } );

  } );

} );