Hello, feather
--

## Creating your first application
  
  Creating an application is covered in a little more detail in [applications.md](applications.md). For the purposes of this tutorial, we'll assume you have feather installed already and that you have a terminal open to some folder you want to store your feather apps.

  -`1.` Create the app via `feather create-app hello_world`  
  -`2.` Move into the new app via `cd hello_world`  
  -`3.` Run the app via `feather run`  
  -`4.` Test the app by opening a browser and going to http://localhost:8080 (note: 8080 is the default port for feather app development). You should see the text "Light as a Feather".

--

## A simple HTML change

  OK, so now we'll start making changes to the application, working our way through various fundamental concepts in the feather framework...

  The first thing to realize is that "feather pages" are specially named HTML files. Any file in the `public` folder of your app that ends with `.feather.html` will be treated as a "feather page" and will be parsed by feather's specialized parser when your application starts up. This parsing process ultimately figures out what `widgets` your page(s) are embedding, recursively expands all the widget templates (which results in a composite HTML document), automatically collects all the required `client.js` and `css` files used by all of the embedded widgets, and bundles everything into static files that will be served to the browser for you. So the "feather page" can be thought of as the composition layer for `widgets`, which are the basic unit of encapsulating reusable chunks of functionality in your application.

  For now, we'll just make a simple HTML change involving no widgets...

  -`1.` In your favorite text editor, open `hello_world/public/index.feather.html`  
  -`2.` Change the text 'Light as a Feather' to 'Fast as a Bird' and save the file  
  -`3.` (**) Restart the application via the command line (stop via `Ctrl-C` if it's still running and then start via `feather run`)  
  -`4.` Test the change in the browser.

  (**: At the time of writing (v0.2.1 of feather), server side changes (i.e. editing a .feather.html file, or a widget's .server.js or .template.html file) currently require restarting the feather server. We do intend to resolve this fact and enable seamless "hot deployments")

--

## Adding a widget
  
  Now we'll start getting into the heart of the feather framework, which is creating and using widgets. First, a brief discussion to answer the question "What is a widget?"...

  A widget, from feather's perspective, is really just a way of saying "cross-tier component". You will create widgets to encapsulate re-usable chunks of content or functionality (i.e. "loginForm", "videoPlayer", or "helpWizard"). We say "cross-tier" because a widget consists of four distinct files that are seamlessly combined to provide both server side and client side functionality in a nice convenient package. All widgets can be embedded directly into the markup of feather.html pages or inside of other widget templates, and can also be dynamically loaded directly from the client.

  So, to add our first widget to the hello_world app, do the following...

  -`1.` From the `hello_world` folder, create a widget via the command line: `feather create-widget sayHello`

  This will ask you if `hello_world` is OK to use as the namespace of the widget (since we omitted a namespace as the last argument when we ran the command). So far we've typically just stuck with the app name as being the namespace for all widgets; it's a pattern that seems to work for most apps (assuming your app name isn't something long winded). You may want to introduce additional namespaces if your app design is particulary large. After you say "yes", it will then create a folder at `hello_world/public/widgets/sayHello` that contains four files as follows...

  * sayHello.client.js
  * sayHello.css
  * sayHello.server.js
  * sayHello.template.html

  As we move forward we'll be working in those files to implement various changes in UI or functionality for our widgets.

  -`2.` Edit `hello_world/public/widgets/sayHello/sayHello.template.html` in your text editor and add the following text

```html
    I am a widget
```

  -`3.` Edit `hello_world/public/index.feather.html` as follows:

```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" />
    </body>
    </html>
```

  -`4.` Restart the app and test the changes in the browser. You should now see the text "I am a widget".

--

## Adding UI and client side interactions
  
  Now that you've added your first widget, let's start making it (somewhat) useful. Since we called our widget 'sayHello', let's add a button that when clicked alerts a "hello" message to the user.

  -`1.` Add the following markup to the `sayHello.template.html` file...

```html
    <input id="sayHiBtn" type="button" value="say hello" />
```

  __A note about `id` attributes__
  At this point we'd like to make you aware of an important feature of the feather framework. Let's say you want to add ten instances of this widget to your page. You would simply edit the `index.feather.html` file and add nine more `widget` tags. You must, however, take care that all ten instances have different `id`s (in fact the framework will hollar at you during startup if you fail to meet this requirement and will error out). The reason this is true is so that all the elements on the page can be gauranteed to be uniquely ID'ed and so that behavioral code in the widgets' `client.js` file can safely reference _only_ the DOM elements associated with _that_ _instance_. In this way, you can have as many instances of a single widget on the screen as you want without having to write any code to manage that stuff (it's managed for you). To accomplish this, feather auto prefixes an id chain to elements based on the hierarchy of where each instance is embedded. So in our example above (with just a single instance embedded in the page), the button will actually have an id of `sayHello1_sayHiBtn` in the DOM (because we gave the `widget` tag an id of `sayHello1` when we embedded it). As already mentioned, when you write client code within the widget's `client.js` file you will not have to worry about knowing what that id hierarchy looks like; you'll be able to reference the scoped elements by their relative IDs via code like `this.get('#sayHiBtn')`, which we'll demonstrate shortly.

  -`2.` Add the following style rules to the `sayHello.css` file (let's make this button really ugly)...

```css
  .hello_world_sayHello {
    padding: 20px;
    border: 1px solid #666;
    border-radius: 5px;
  }

  .hello_world_sayHello input {
    border: 3px dashed green;
    font-family: verdana;
    font-size: 20px;
    color: red;
  }
```

  For per-widget scoped styling, there is always an implicit class name for each widget that will be in the form of `namespace_widgetName`. Since our namespace is `hello_world` and our widget name is `sayHello`, the implicit class name is `hello_world_sayHello`. This is very handy when you want to create styles that target only those elements scoped to instances of this specific widget type.
  
  We've added a border and some padding around the widget container, simply for illustrative purposes. This will also make it easier to distinguigh widget boundaries later when we get into various multiple widget scenarios.

  It's very important to note that ID based selectors in your CSS are a no-no. Going back to the discussion about how IDs are treated in feather, let's pretend you attempted the following CSS rule...

```css
  .hello_world_sayHello #sayHiBtn {
    border: 3px dashed green;
    font-family: verdana;
    font-size: 20px;
    color: red;
  }
```

  The problem, of course, is that because widgets are meant to be reusable and you will be embedding them in (potentially) arbitrary locations in your app, the id prefixes will be (and should remain) unknown within the context of your CSS files. As demonstrated above, the actual id of the button in the DOM in our example will be `sayHello1_sayHiBtn`, and not just `sayHiBtn`, therefore the CSS selector above will actually find 0 elements. You may, then, be tempted to target your CSS rule as `.hello_world_sayHello #sayHello1_sayHiBtn`. That would also be a mistake because it is tightly coupling the CSS rule to a specific embed hierarchy, and this rule will break the second that hierarchy changes for whatever reason.

  -`3.` Bind a click handler in the `sayHello.client.js` file as follows...

```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            alert("Hi there!");
          });

        }
      }
    });
  })();
```

  Since this is our first look at the `client.js` file, let's take a moment to examine the boilerplate to understand what's going on. 

  - The first line is a call to `feather.ns` (where 'ns' stands for 'namespace'). `feather.ns` is a helper function that encapsulates the safe (non-overwriting) creation of a variable at an arbitrary path within a given context (where the default context is the global context, or `window` on the client). The call `feather.ns("hello_world")` first checks to see if the `hello_world` variable has already been created in the global context (`window` in this case), and does nothing if it has, or creates an empty object to represent that namespace if it hasn't (this assures that the order in which you embed same-namespaced widgets won't inadvertantly affect the creation of this object.). `feather.ns` is very handy and offers a few more options, which will be explained in greater detail in the API docs.
  - Next you'll notice the very standard module pattern (an immediately-called anonymous function), whose body is a single statement that creates a widget constructor at `hello_world.sayHello`. The constructor arguments template (the object being passed into the `feather.Widget.create` factory function) includes the widget boilerplate properties of `name`, `path`, and `prototype`. `name` seems redundant at first glance, but is important because it will be used in various places behind the scenes. The same is true of `path`; this is mainly used to pass into feather's dynamic widget loading mechanism so the server can easily resolve which widget is being requested. Finally, the `prototype` property is exactly that... the javascript prototype of the resulting widget constructor. 

  There are two important methods of interest on all client-side widget prototypes: `onInit` and `onReady`. 

  - The `onInit` function is called immediately after a widget instance is created on the client, but before the DOM has been updated with that widget's HTML from its template. This would be where you would add any initialization code (i.e. the stuff you'd normally put into a constructor function). 
  - The `onReady` method is called immediately after the widget's HTML has been rendered into the DOM, and this is the point at which it's safe to interact with the widget's DOM elements (e.g add event handlers). 

  So, with the understanding that `onReady` is the point at which our widget's DOM elements are ready, you can then see this is where we write the event binding code on our button.

  _jQuery integration and the domEvents registry_:
  
  There is no mistaking that jQuery is the world's most popular client side toolkit. For this reason (and also because it's amazing), feather relies on jQuery heavily. jQuery is auto-included in all feather pages, and is not optional in the feather framework (yes, feather is opinionated on this topic). In our example code above, jQuery's `.bind()` method is what's actually being used behind the scenes. Feather widgets, however, all contain their own local registry of event handlers: the `.domEvents` property. The reason this exists is because widgets are able to be disposed of (imagine a single page interface where many widgets are dynamically created and destroyed as the user performs various actions). As each widget is destroyed, this local domEvents "registry" is used to automatically clean up all of that instance's listeners. This frees you from having to worry about memory leaks. _In short_: within a widget, use `.domEvents.bind()` instead of `$.bind()`.

  ---
  Next let's dissect `this.get('#sayHiBtn')`:

  Going back to the previous discussion about how DOM IDs are treated in feather, remember that the actual ID of the button on the page will be `sayHello1_sayHiBtn` because this instance's ID is `sayHello1`. Just like the `.domEvents` method is a light wrapper around jQuery's `.bind()` method, all widgets have a `.get()` method that is a light wrapper around jQuery's top level selector function (i.e. `$()` itself). This wrapper simply auto-manages scoping your selector to the instance you call it from, which includes auto-prefixing ID based selectors appropriately with the acual ID of the instance. You could have just as easily written the selector as `this.get('input')` in this case, but that selector is a bit too generic and as we add elements to this widget's template it will result in selecting more elements than we want. 

--

## Adding a server-side RPC method

  Now let's make the button click do something _slightly_ more useful: talk to the server and _then_ alert something. Feather has support for widget-level RPC (remote procedure call) methods. This is explained briefly at the beginning of the [communication.md](communication.md) document, but we'll cover it a little more here as well.
  
  -`1.` Implement the `prototype` and add a `feather.Widget.serverMethod` in `sayHello.server.js` file as follows...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(_cb) {
          
          _cb(null, "Howdy from the server!");
        })
        
      }
    });
  };
```
  
  The first thing you'll notice is that there is a small amount of boilerplate in this file that looks similar to the `client.js` file. The difference is that each widget's `server.js` file is actually a nodejs module, and as such it exposes its functionality via the `exports` object. The widget modules must export exactly 1 method, which is the `getWidget` method; it is a widget configuration factory function much like the `client.js` file's call to `feather.Widget.create()`. This function gets the full feather framework passed into it (so you don't have to worry about requiring it), and a callback function `cb`. Because this is an asynchronous process, you can do anything you like here before actually calling that callback function (for example, perhaps fetching this widget's definition from a database).
  
  For now, just make note that we've added a `prototype` with a single method: `sayHowdy`. The method itself is declared via the factory helper function `feather.Widget.serverMethod`. The result of wrapping a method like this is that now feather will auto-emit a small chunk of code for the client that will allow you to call this method directly. Also make note that this is a standard node-style asynchronous method and there is a callback function `_cb` being passed in. When you call this callback function it automatically triggers the response back to the client. As with all other node-style callbacks, this one is error-first.
  
  -`2.` Edit the `client.js` file to call the RPC method...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            me.server_sayHowdy(function(args) {
              
              alert(args.result);
            });
          });

        }
      }
    });
  })();
```

  _A quick note on scope_ (skip the next paragraph if you're experienced enough to know why we added the `var me = this;` bit.):
  
  The topic of scope and the `this` keyword in javascript is something that has been covered many (and more) times, but it's worth pointing out here, especially because you'll see that `var me = this;` pattern repeated all over the place in our example code. Since it's been covered in many places better than we could do here, please [click here to read about it](http://javascriptplayground.com/blog/2012/04/javascript-variable-scope-this) if the above is a new pattern for you.
  
  Now within our event handler you can see that we've added a call to `me.server_sayHowdy()`, passing in a callback function. This function will be executed when the server has responded. NOTE: this is the only place in feather that does not follow the error-first callback style. Instead, the `args` object wraps the result in a light RPC result object that has the following properties:
  
  - `.success` - this indicates whether the call was successful. If the server method calls back with an error (any non-null value in the 1st argument), this will be `false`.
  - `.result` - this is the actual data passed from the server (if there was no error). In our example above, this will be the string `"Howdy from the server!"`. This will be `null` if success is `false`;
  - `.err` - the error returned from the server (if there was one). This will be `null` if success is `true`.
  
  -`3.` Restart the server and click the button.

  Nifty, eh? Alright, now let's make some minor changes to illustrate how to pass values to the server when making RPC calls...
  
  -`4.` Change `sayHello.server.js` as follow...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(arg1, arg2, _cb) {
          
          _cb(null, "Howdy from the server! You told me arg1 is '" + arg1 + "' and arg2 is '" + arg2 + "'.");
        })
        
      }
    });
  };
```

  -`5.` Change `sayHello.client.js` as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            me.server_sayHowdy(['foo', 'bar'], function(args) {
              
              alert(args.result);
            });
          });

        }
      }
    });
  })();
```

  -`6.` Restart the server and try it out.
  
  The changes we just made should be fairly easy to reason out. As briefly pointed out in the [communication.md](communication.md) document, one potential minor "gotcha" is that when calling RPC methods from the client, arguments are wrapped into an array (the `['foo', 'bar']` bit above). 
  
  The arguments passed in and the result the server sends back are not limited to only strings. Any value can be used as long as it's serializable as JSON (i.e. no circular references). The serializing and de-serializing (in both directions) is automatically handled for you by feather....
  
  -`7.` Change `sayHello.server.js` as follows...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(data, _cb) {
          
          var result = {
            greeting: "Howdy from the server!",
            foo: data.foo + " - server added some text to foo",
            bar: data.bar + 5
          };
          
          _cb(null, result);
        })
        
      }
    });
  };
```

  -`8.` Change `sayHello.client.js` as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = {
              foo: "I'm a string!",
              bar: 5
            };
            
            me.server_sayHowdy([data], function(args) {
              
              alert("greeting = " + args.result.greeting
                + " -- foo = " + args.result.foo
                + " -- bar = " + args.result.bar);
            });
          });

        }
      }
    });
  })();
```
  
  -`9.` Restart the server and try again
  
  As you can see, the RPC methods make it very easy to send and receive arbitrary data. Of course, you really should be checking for errors. As a final note on widget RPC methods, we'll cover passing and checking for errors...
  
  -`10.` Change `sayHello.server.js` as follows...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(data, _cb) {
          
          var err = null,
            result = null;
          
          try {
            var result = {
              greeting: "Howdy from the server!",
              foo: data.foo + " - server added some text to foo",
              bar: data.bar + 5
            };
          
            //throw a contrived error...
            throw new Error('The server has determined that you are not allowed to do this.');
          } catch (ex) {
            
            result = null;
            err = ex.message;
          }
          
          _cb(err, result);
        })
        
      }
    });
  };
```

  -`11.` Change `sayHello.client.js` as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = {
              foo: "I'm a string!",
              bar: 5
            };
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                alert("greeting = " + args.result.greeting
                  + " -- foo = " + args.result.foo
                  + " -- bar = " + args.result.bar);              
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```

  -`12.` Restart the server and watch the fake error be alerted.
  

--

## Getting user input 1: field-level

  Getting user input within the context of a widget is pretty straightforward. So let's get right to it.
  
  -`1.` Change `sayHello.template.html` as follows...
  
```html
    <input id="someText" type="text" placeholder="Enter some text here" />
    <input id="sayHiBtn" type="button" value="say hello" />
```
  
  -`2.` Change `sayHello.server.js` as follows...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(data, _cb) {
          
          var err = null,
            result = null;
          
          try {
           
            if (!data.text || data.text == 'ERROR') { 
              
              //throw a contrived error...
              throw new Error('The server has determined that you are not allowed to do this.');            
            } else {
              
              result = "You said: " + data.text;
            }
          } catch (ex) {
            
            result = null;
            err = ex.message;
          }
          
          _cb(err, result);
        })
        
      }
    });
  };
```

  -`3.` Change the `sayHello.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = {
              text: me.get('#someText').val()
            };
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                alert(args.result);              
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```
  
  There you go. This example really only illustrated the jQuery integration a little further. In the `client.js` file we're getting the text from the textbox via `me.get('#someText').val()`, which once again is simply a light wrapper around `$()` making sure we target just _this widget instance's_ textbox. Also, you may have noticed that if you enter the string "ERROR" we're now using that to trigger our contrived error condition.
  
  So that's cool, but having to write code to fetch data from fields is a little old fashioned and can become tedious. Luckily it doesn't have to be like this...

--

## Getting user input 2: forms with automatic datalinking 

  Feather has built-in support for jQuery [datalinking](https://github.com/jquery/jquery-datalink). All you need to do is add a `<form>` tag that has a `datalink` attribute. For our example, we'll continue to use the `sayHello` widget.

  -`1.` Change `sayHello.template.html` as follows...
  
```html
    <form datalink="person">
      
      <label for="firstName">First Name:</label>
      <input id="firstName" name="firstName" placeholder="First Name" type="text" tabindex=1 />
      
      <label for="lastName">Last Name:</label>
      <input id="lastName" name="lastName" placeholder="Last Name" type="text" tabindex=2 />
      
      <input id="sayHiBtn" type="button" value="say hello" />
    </form>
```
  
  -`2.` Change `sayHello.server.js` as follows...
  
```js
  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        sayHowdy: feather.Widget.serverMethod(function(data, _cb) {
          
          var err = null,
            result = null;
          
          try {
           
            if (data.firstName == 'Dave') { 
              
              //throw a contrived error...
              throw new Error("Sorry, Dave, I'm afraid I can't let you do that.");            
            } else {
              
              result = "Your full name is: " + data.firstName + " " + data.lastName;
            }
          } catch (ex) {
            
            result = null;
            err = ex.message;
          }
          
          _cb(err, result);
        })
        
      }
    });
  };
```

  -`3.` Change the `sayHello.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = me.model.person;
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                alert(args.result);              
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```

  And that's it. The important things to note in this example are the `var data = me.model.person` line above in the `sayHello.client.js` file along with the `datalink="person"` attribute in the form tag within the `sayHello.template.html` file. Notice that the value of the datalink attribute directly corresponds to the name of the property on the widget's `model` object. As the user changes the values of the fields, the `person` object has its properties automatically updated behind the scenes, and those property names also correspond directly to the `name` attributes found in the form fields.
  
### Binding the other way
  
  If you want to modify the models objects directly through code, you can then have those changes automatically reflected in the UI (provided you are using a datalinked form) by making a call to your widget's `.datalink()` method.
  
  -`1.` Edit the `sayHello.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = me.model.person;
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                alert(args.result);
                
                // to illustrate binding from code to UI, change the model
                me.model.person = {
                  firstName: "Some First Name",
                  lastName: "Some Last Name"
                };
                
                // no just call datalink and the UI will be updated
                me.datalink();
                
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```  
  
--

## Embedding content with `<contentTemplate>`

  So far what we've done is create the content and behavior definition for a widget type called `sayHello`. This definition will apply to all instances of this widget. But the widget model in feather also allows you to embed unique content at a per-instance level. This is accomplished by adding a `<contentTemplate>` tag inside the `<widget>` tag.
  
  -`1.` Edit the `/public/index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" >
        <contentTemplate>
          <p>This is additional embedded content.</p>
          <strong>This content can be any HTML.</strong>
        </contentTemplate>
      </widget>
      
      <widget id="sayHello2" path="widgets/sayHello/" />
    </body>
    </html>
```

  -`2.` Restart the server and refresh the page in the browser.
  
  As you can see, we have added a second instance of our `sayHello` widget and have embedded some additional content inside the first instance. By default, any content added within the `<contentTemplate>` tag gets appended at the end of the widget's pre-defined content. In the next example we'll show you how to control where this custom content gets embedded inside the main widget's template.
  
  -`3.` Edit the `sayHello.template.html` file as follows...
  
```html
    <form datalink="person">
    
      <content />
      
      <label for="firstName">First Name:</label>
      <input id="firstName" name="firstName" placeholder="First Name" type="text" tabindex=1 />
      
      <label for="lastName">Last Name:</label>
      <input id="lastName" name="lastName" placeholder="Last Name" type="text" tabindex=2 />
      
      <input id="sayHiBtn" type="button" value="say hello" />
    </form>
```

  -`4.` Restart the server and refresh the page in the browser.
  
  All we did was add a `<content />` tag where we wanted the custom content to get embedded. This simple embed model enables a wide range of content separation and re-use scenarios, where you can put common UI and behavior at the widget definition level and then layer in the unique content quite easily. 

--

## Making widgets configurable with `<options>`

  The `<contentTemplate>` tag is one way that you can add per-instance uniqueness, but now we'll demonstrate how to make a widget more configurable. For this example, let's assume we want to allow the text of our button to be configurable. This will also serve as a quick introduction to the [jQuery templating](http://api.jquery.com/category/plugins/templates/) integration features of feather.
  
  -`1.` Edit the `sayHello.template.html` file as follows...  
  
```html
    <form datalink="person">
    
      <content />
      
      <label for="firstName">First Name:</label>
      <input id="firstName" name="firstName" placeholder="First Name" type="text" tabindex=1 />
      
      <label for="lastName">Last Name:</label>
      <input id="lastName" name="lastName" placeholder="Last Name" type="text" tabindex=2 />
      
      <input id="sayHiBtn" type="button" value="${options.buttonText}" />
    </form>
```

  -`2.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" >
        <contentTemplate>
          <p>This is additional embedded content.</p>
          <strong>This content can be any HTML.</strong>
        </contentTemplate>
        
        <options>
          <option name="buttonText" value="say hello" />
        </options>
      </widget>
      
      <widget id="sayHello2" path="widgets/sayHello/" >
        <options>
          <option name="buttonText" value="say what's up" />
        </options>
      </widget>
    </body>
    </html>
```

  -`3.` Restart the server and refresh the page in the browser.
  
  Take note of the change we made above in the `sayHello.template.html` file. The static string "say hello" was replaced with the jQuery template variable `${options.buttonText}`. Then, in the `index.feather.html` page we added a corresponding `<option>` tag within both of our instances with their `name` attributes set to map to the property name `buttonText`. You can use this pattern to expose any number of named configuration items. This example, however, is only one way in which these options can be used (i.e. to control templated content directly). You can also use options as a way to modify behavior. 
  
  Before we go into using options to modify behavior, you should be aware of the difference between the server's view of these options and the client's view. So far everything we've done with the templates and options only really affects the server. That is to say, the feather parsing process that happens when your application is starting up is the piece that has been making use of these changes. The `buttonText` option we added above, along with the addition of the template variable `${options.buttonText}` is telling that parsing process how to build the HTML for the widgets we're using on the index page of our site. That resulting static HTML is what is then being served to the browser when you request the page. The default behavior for the option tags is to only set the values in the rendering context that does the parsing (so far that rendering context is all server-side). That means the `buttonText` option we set will _not_ be propagated out to the client automatically (which will be more clear in a bit here).
  
  Having said that, the next place we'll make use of these options is in the `sayHello.server.js` file. This example will be mocking up a potential case for fetching content from a database or external service during the initial parsing process, and will allow you to specify a fictitious relative URI to fetch the content from. Please keep in mind that this parsing process still only happens once (during application startup), and the resulting HTML for this page will then be statically served. This is an important performance feature of feather, and it means you shouldn't expect this external data fetching logic to be triggered for every page request (we'll explain how to deal with truly dynamic content later on). 
  
  -`4.` Edit the `sayHello.server.js` file as follows...
  
```js

  //mockup the datastore
  var externalData = {
    buttons: {
      hello: "say hello",
      howdy: "say howdy"
    }
  };

  //mockup the URI based data service
  function getData(uri, cb) {
    var parts = uri.split('/'),
      context = externalData,
      err = null;
    
    //walk the store object to find the requested data element
    for (var i = 0, l = parts.length; i < l; i++) {
      try {
        context = context[parts[i]];
        if (typeof context === "undefined") throw new Error('not found');
      } catch (ex) {
        err = "data not found";
      }
    }
    
    cb(err, context);
  }

  exports.getWidget = function(feather, cb) {
    cb(null, {
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        
        onRender: function(render) {
          var me = this;
          
          //use a default value for the uri if none are set via options
          var buttonTextURI = me.options.buttonTextURI || 'buttons/hello';
          
          //mockup what a call to an async process would normally look like
          getData(buttonTextURI, function(err, text) {
            
            //use a default value in case there was an error
            var buttonText = "say hello";
            
            if (!err) {
              buttonText = text;
            }
            
            //set the value to be used in the template and then proceed with render
            me.options.buttonText = buttonText;
            render();
          });
        },
        
        sayHowdy: feather.Widget.serverMethod(function(data, _cb) {
          
          var err = null,
            result = null;
          
          try {
           
            if (data.firstName == 'Dave') { 
              
              //throw a contrived error...
              throw new Error("Sorry, Dave, I'm afraid I can't let you do that.");            
            } else {
              
              result = "Your full name is: " + data.firstName + " " + data.lastName;
            }
          } catch (ex) {
            
            result = null;
            err = ex.message;
          }
          
          _cb(err, result);
        })
        
      }
    });
  };
```

  -`5.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" >
        <contentTemplate>
          <p>This is additional embedded content.</p>
          <strong>This content can be any HTML.</strong>
        </contentTemplate>
        
        <options>
          <option name="buttonTextURI" value="buttons/hello" />
        </options>
      </widget>
      
      <widget id="sayHello2" path="widgets/sayHello/" >
        <options>
          <option name="buttonTextURI" value="buttons/howdy" />
        </options>
      </widget>
    </body>
    </html>
```

  -`6.` Restart the server and refresh the page in the browser.
  
  This example illustrates a view things. Firstly, we added an `onRender` method to the `sayHello.server.js` file. This is an example of a method that has special meaning to feather. When you implement this method in your widgets you are given a chance to take over the parsing process. This method gets passed a `render` function reference that you must call to tell feather to continue with the rest of the rendering process. You may call whatever external methods or services you want before you yield control back to feather. Our example uses mockups of an external datastore and a URI based service, which should give you a pretty good picture of how to handle this type of scenario.
  
  The other thing that's being illustrated above is the fact that the `options` object is a property of the widget instance, and can be accessed in code within the widget's methods. There is another subtle thing that this belies, which is that within the widget templates the widget instance itself is the data container (notice in the template we use the variable `${options.buttonText}`). That's a nice thing to know, as it allows you to pull any of the widget's properties in to your templates, not just the options object. For example, after we call `getData()` above, we could have set `me.buttonText` instead of `me.options.buttonText` and then we could have changed the template to use the variable `${buttonText}`.
  
--

## Sending options to the client

  The `options` that you define in your embed code, by default, only have meaning on the server. The reason feather doesn't automatically serialize these options and send them to the client for you to access programmatically is that there are plenty of cases where these values are potentially sensitive. You may not want to expose some of the config key/value pairs you use in your widgets. Secondarily, if the client doesn't care about options that you're using to control server side templating (or some other server-only concern), some small amount of bandwidth is saved by not sending that to the client.
  
  Therefore, if you want to expose embedded options to the client you must explicitly tell feather. The way to do this is simply by setting `client_enabled="true"` on the `<option>` tag for each option you wish to have sent to the client.
  
  -`1.` Edit the `sayHello.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = me.model.person;
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                var exclamation = "";
                
                if (me.options.exciting == "yes") {
                  exclamation = "!!!!!!!!!!!!";
                }
                
                alert(args.result + exclamation);              
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```

  -`2.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" >
        <contentTemplate>
          <p>This is additional embedded content.</p>
          <strong>This content can be any HTML.</strong>
        </contentTemplate>
        
        <options>
          <option name="buttonTextURI" value="buttons/hello" />
          <option name="exciting" value="yes" client_enabled="true" />
        </options>
      </widget>
      
      <widget id="sayHello2" path="widgets/sayHello/" >
        <options>
          <option name="buttonTextURI" value="buttons/howdy" />
        </options>
      </widget>
    </body>
    </html>
```

  -`3.` Restart the server and refresh the page in the browser.
  
  As you can see we now have a widget that has a degree of configurability for both the server and the client. 

--

## Working with multiple widgets

  Now let's walk through a few different scenarios related to working with more than one widget. As you go through the next few sections you'll be learning everything there is to know about working with widgets and how to communicate across widgets. 
  
  -`1.` Create a new widget from the command line via `feather create-widget anotherWidget`
  
  -`2.` Edit the `anotherWidget.template.html` file as follows...
  
```html
    <p>I am another widget.</p>
    <div>
      My button is here: <input type="button" id="sayHiBtn" value="say hello" />
    </div>
```

 -`3.` Edit the `anotherWidget.client.js` file as follows...
 
```js
  feather.ns("hello_world");
  (function() {
    hello_world.anotherWidget = feather.Widget.create({
      name: "hello_world.anotherWidget",
      path: "widgets/anotherWidget/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            alert('Hello from another widget!');
          });

        }
      }
    });
  })();
```

  -`3.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="sayHello1" path="widgets/sayHello/" />
      <widget id="sayHello2" path="widgets/anotherWidget/" />
    </body>
    </html>
```
  
  -`4.` Restart the server and then refresh the page in the browser.
  
  At this point, you haven't really learned anything new. We've simply created another (_incredibly_ useful) widget and embedded it in the page. These two instances are said to be siblings because they were embedded at the same level in your page. They don't know about each other and won't interact with each other in any way right now.
  
  The first change we'll make will demonstrate how widgets can have children based on how you embed them, and will also serve as an introduction to using an event driven model for widget to widget communications. 
  
  -`5.` Edit the `anotherWidget.template.html` file as follows...
  
```html
    <p>I am another widget.</p>
    <div>
      My button is here: <input type="button" id="sayHiBtn" value="say hello" />
    </div>
    
    <widget id="sayHello1" path="widgets/sayHello/" />
```

  -`6.` Edit the `anotherWidget.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.anotherWidget = feather.Widget.create({
      name: "hello_world.anotherWidget",
      path: "widgets/anotherWidget/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            alert('Hello from another widget!');
          });
          
          // example of listening to custom widget-level events
          this.sayHello1.on('hello', function(greeting) {
            
            alert(greeting);
          });

        }
      }
    });
  })();
```

  -`7.` Edit the `sayHello.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayHello = feather.Widget.create({
      name: "hello_world.sayHello",
      path: "widgets/sayHello/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;
          
          this.domEvents.bind(this.get('#sayHiBtn'), 'click', function() {
            
            var data = me.model.person;
            
            me.server_sayHowdy([data], function(args) {
              
              if (args.success) {
                
                var exclamation = "";
                
                if (me.options.exciting == "yes") {
                  exclamation = "!!!!!!!!!!!!";
                }
                
                //instead of this widget doing the work, just fire an event declaring something happened
                me.fire('hello', args.result + exclamation);              
              } else {
                
                alert(args.err);
              }
            });
          });

        }
      }
    });
  })();
```

  -`8.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="anotherWidget" path="widgets/anotherWidget/" />
    </body>
    </html>
```

  -`9.` Restart the server and refresh the page in the browser.
  
  In the above code examples, we've made the `sayHello` widget fire an event called `hello` instead of directly alerting the greeting. We also embedded an instance of `sayHello` directly in the template of `anotherWidget` and added an event listener for the event being fired from the child `sayHello` instance. Make note that the `id` given to embedded children widgets becomes the property name with which you can access that instance within the parent (e.g. the `this.sayHello1.on(...` line of code in the `anotherWidget.client.js` file).
  
  This pattern of firing events up to a container is a very common pattern in feather, and is a fundamental design pattern for implementing complex interfaces (long running single page applications). Using events is also a great way to decouple an interaction from the implementation of what happens as a result of that interaction. This means you can easily drop that interactive component into different consuming contexts that respond differently. 
  
  As a final simple example of embedding widgets, we'll show you that the `<contentTemplate>` tag can accept widgets as well.
  
  -`10.` Create another new widget type via the command `feather create-widget sayGoodbye`
  
  -`11.` Edit the `sayGoodbye.template.html` file as follows...
  
```html
  <input id="goodbyeBtn" type="button" value="say goodbye" />
```

  -`12.` Edit the `sayGoodbye.client.js` file as follows...
  
```js
  feather.ns("hello_world");
  (function() {
    hello_world.sayGoodbye = feather.Widget.create({
      name: "hello_world.sayGoodbye",
      path: "widgets/sayGoodbye/",
      prototype: {
        onInit: function() {
          
        },
        onReady: function() {
          var me = this;

          this.domEvents.bind(this.get('#goodbyeBtn'), 'click', function() {
            
            // show off feather.confirm
            feather.confirm('Leaving?', 'Are you sure you want to say goodbye?', function() {
              
              // normally this is a no-no (interacting directly with a widget's parent),
              // but we're putting it here just for illustration purposes to show
              // that there is a parent-child two-way hierarchy
              me.parent.dispose();
            });
          });
        }
      }
    });
  })();
```

  -`13.` Edit the `index.feather.html` file as follows...
  
```html
    <html>
    <head>
      <title>Index.feather.html</title>
      <resources />
    </head>
    <body>
      <widget id="anotherWidget" path="widgets/anotherWidget/" >
        <contentTemplate>
          <widget id="goodbye" path="widgets/sayGoodbye/" />
        </contentTemplate>
      </widget>
    </body>
    </html>
```

  -`14.` Restart the server and refresh the page in the browser.
  
  In this example we have shown a couple new things. Firstly, we are embedding the new `sayGoodbye` widget directly inside the `<contentTemplate>` tag just to show you that we can. Secondly, we've shown you the `feather.confirm` helper UI method, which displays a simple modal dialog with a title, a message and a pair of buttons. That's a teaser for the discussion on jQueryUI (and optionally, Twitter Bootstrap) integration that's baked into feather (this feature can also be turned off). Next, we show you how to access a widget's parent. And finally, we've introduced you to the notion of disposing of widgets (another feature that is important when implementing complex interfaces).
  
  You usually would _not_ write code that directly manipulates a widget's parent like that, but for some edge cases it could be useful to know that it's possible (like maybe in our example, if the `goodBye` widget's main purpose in life is to dispose of other widgets that you drop it into). The reason it's usually bad form to directly manipulate the parent is because that is tightly coupling the widget's behavior to a specific embed scenario. You want to design widgets such that they can be dropped into various places (or not embedded in other widgets at all), and the way to achieve that design is usually by modelling the "upstream" interactions through events rather than direct manipulation.
  
  You may have been surprised when the entire page seemed to have disappeared. The `.dispose()` method available on all widgets does a complete cleanup of a widget and its children, which includes things like cleaning up all of the DOM event handlers (via the `.domEvents` object) and removing the widget's HTML from the DOM. So in our case, when `me.parent.dispose()` is called, that is the `anotherWidget` instance which happens to contain all the content for our page.
  
--

## Advanced templating

  There are quite a lot of things you can do with feather's integration of jQuery templates. In these next examples we'll show you just a few more things you can do.
  
  First, within a widget's `.template.html` file you can define what we call "sub templates" by using the `<template>` tag. These sub templates each have a name, and can be used later within the main widget template.
  
  For example, let's say we have a widget called `showSomeLists` that is responsible for displaying... some lists. We want to make a couple list layouts and make it a configuration option which layout is used.
  
  

--

(unfinished outline below) ...



6. Adding a second widget
  a. embed as sibling
  b. embed as child via contentTemplate
    ba. show how to use <content/> tag to control contentTemplate placement
    bb. discussion on parent-child relationship & show how to access embedded widget on client
  c. adding/calling client-side methods
  c. demonstrate event pub/sub on client-side
7. Making a widget configurable via options
  a. show how to use the <options> tag section
    aa. discuss default server-centric behavior and show client_enabled=true behavior
8. Using the template
  a. discussion of jQuery.tmpl integration
  b. show that the widget itself is the data container for templating
  c. demonstrate how to fetch external data for use in template
    ca. explain that this is intended for static data and that dynamic data templating will be done via the client
  d. show how to pass configuration down into embedded widgets via template variables in option tags
  e. show how to use the template tag and insert_template tag (server-centric)
    ea. show how to automatically send templates to the client and how to use them
    eb. discuss the difference between curly braces and square braces in template variables
  f. demonstrate datalinking via form tags
9. Brief discussion of jQueryUI integration and how to disable
10. Dynamically loading a widget from the client
  a. demonstrate embedding into an existing container
  b. demonstrate using the dialog system (assumes jQueryUI integration is enabled)
    ba. brief discussion on creating a custom containerizer function
  c. discuss serverOptions vs. clientOptions
11. Discussion of 'client-only' widgets
12. Solving dynamic data requirements via client-centric thinking

---- 
