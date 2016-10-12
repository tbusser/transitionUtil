# transitionUtil
Small JS utility, returns a promise which is resolved when a transition has ended.

## How does it work?
Say you want to do something once a transition on an element has ended. This utility will do all the heavy lifting for you and gives you a promises which is resolved once the transition has ended. Now I hear you think, what heavy lifting does it perform me? Glad you asked. The utility takes care of the following:
- It checks if the browser uses the standard transition properties and event name or if it uses vendor prefixed versions.
- It will calculate the total duration of the transition by combining the transition duration and transition delay.
- When determing the duration or delay it will take into account the [W3C specs](https://www.w3.org/TR/css3-transitions/#transition-property-property) to determine if the specified property, the "all" value (if specified as a property to transition), or a shorthand property (if specified as a property to transition) should be used.
- It uses a timeout to resolve the promise if for whatever reason the transitionend event is never dispatched.

## That sounds awesome, are there any downsides?
Not really a downside but the utility uses the ES6 Promise. You may have to use a [polyfill](https://github.com/stefanpenner/es6-promise) for it if you want to support browsers that don't have native support for it.

## How about an example?
Here is an example on how to use the utility:
```javascript
var element = document.querySelector('.example');
transitionUtil.getTransitionEndPromise(element, 'top').then(function(resolveData) {
	// Do something awesome now that the top has been transitioned to its new value.
	// ResolveData has three properties:
	// 1: duration, the time it took for the promise to be resolved as reported by the
	//    transitionend event. If the timeout resolved the promise it will be the 
	//    duration as determined from the CSS.
	// 2: property, the name of the property, taken from the transitionend event, that 
	//    triggered the transitionend event that caused the promise to be resolved. If
	//    the timeout resolved the promise than it is always the property name you 
	//    specified in the method call.
	// 3: resolvedByTimeout, false if the promise was resolved by the transitionend event;
	//    when the backup timeout fired this property is true.
});
```

## License
This class and its accompanying README are [MIT licensed](http://www.opensource.org/licenses/mit-license.php).
