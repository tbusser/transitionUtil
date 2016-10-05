# transitionUtil
Small JS utility, returns a promise which is resolved when a transition has ended.

## How does it work?
Say you want to do something once a transition on an element has ended. This utility will do all the heavy lifting for you and gives you a promises which is resolved once the transition has ended. Now I hear you think, what heavy lifting does it perform me? Glad you asked. The utility takes care of the following:
- It checks if the browser uses the standard transition properties and event name or if it uses vendor prefixed versions.
- It will calculate the total duration of the transition by combining the transition duration and transition delay.
- It uses a timeout to resolve the promise if for whatever reason the transitionend event is never dispatched.

## That sounds awesome, are there any downsides?
Well, there is one thing that might surprise you. Most browsers don't follow the [specification from the W3C](https://www.w3.org/TR/css3-transitions/#transitions) on how to deal with a difference in list size between the different transition properties. Take the following CSS:
```css
.example {
	transition-property: opacity, left, top, width;
	transition-duration: 2s, 1s;
}
```
The W3C says the following on how browsers should handle this:
> In the case where the lists of values in transition properties do not have the same length, the length of the ‘transition-property’ list determines the number of items in each list examined when starting transitions. The lists are matched up from the first value: excess values at the end are not used. If one of the other properties doesn't have enough comma-separated values to match the number of values of ‘transition-property’, the UA must calculate its used value by repeating the list of values until there are enough. 

What you would expect to see is that the property `top` is transitioned over 2s and `width` over a time of 1s. At the time of writing only Firefox does this. Chrome, Safari, and Edge just use the last value from the list. So in these browsers the `top` and `width` properties are transitioned over 1s. This is also the behaviour of the utility. When calculating the total duration for the transition and it encounters a situation as in the example it will use the same method as Chrome, Safari, and Edge do.

The other thing you may need to know is that the utility uses the ES6 Promise. You may have to use a [polyfill](https://github.com/stefanpenner/es6-promise) for it if you want to support browsers that don't have native support for it.

## How about an example?
Here is an example on how to use the utility:
```javascript
var element = document.querySelector('.example');
transitionUtil.getTransitionEndPromise(element, 'top').then(function() {
	// Do something awesome now that the top has been transitioned to its new value.
});
```

## License
This class and its accompanying README are [MIT licensed](http://www.opensource.org/licenses/mit-license.php).
