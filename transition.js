(function(root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.transitionUtil = factory();
	}
}(this, function() {
	'use strict';

	/* ====================================================================== *\
		VARIABLES
	\* ====================================================================== */
	var settings = {
			eventTransitionEnd : 'transitionend',
			propertyDelay      : 'transitionDelay',
			propertyDuration   : 'transitionDuration',
			propertyProperty   : 'transitionProperty',
			timeoutPadding     : 50,
			valueAll           : 'all'
		},
		transitionsSupported = true;
	/* == VARIABLES ========================================================= */



	/* ====================================================================== *\
		PRIVATE METHODS
	\* ====================================================================== */
	/**
	 * Capitalizes the first character in a given string and returns it to the
	 * caller.
	 *
	 * @param  {String} string The string whose first character should be
	 *                         capitalized.
	 * @return {String}        When the string started with a character [a-z]
	 *                         the returned string will start with a [A-Z].
	 */
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/**
	 * Determines the vendor prefixed transition CSS properties and transition
	 * end event name.
	 *
	 * @return {Boolean} When a prefixed version for the transition properties
	 *                   has been found the method will return true; otherwise
	 *                   the result is false, indicating the browser has no
	 *                   support for transitions.
	 */
	function determinePrefixedNames() {
		// 1: Create an element which we can use to test the transition
		//    properties.
		// 2: This object contains the known browser prefixes and the
		//    transitionend event name we know is supported when the prefixed
		//    property exists.
		var element = document.createElement('div'),
			prefixes = {
				Webkit : 'webkitTransitionEnd',
				O      : 'otransitionend',
				Moz    : 'transitionend'
			};

		for (var key in prefixes) {
			if (!prefixes.hasOwnProperty(key)) {
				continue;
			}

			if (element.style[key + 'Transition'] !== undefined) {
				settings.eventTransitionEnd = prefixes[key];
				settings.propertyDelay = key + capitalizeFirstLetter(settings.propertyDelay);
				settings.propertyDuration = key + capitalizeFirstLetter(settings.propertyDuration);
				settings.propertyProperty = key + capitalizeFirstLetter(settings.propertyProperty);
				return true;
			}
		}

		return false;
	}

	function resolvePropertyToTransitionPropertyIndex(transitionPropertyList, property) {
		// 1: Find the last index of the property in the array of properties
		//    which have a transition defined for them.
		// 2: Find the last index of the "all" value in the array of properties
		//    which have a transition defined for them.
		// 3: Initialize the index of the shorthand property at -1 (not found).
		var propertyIndex = transitionPropertyList.lastIndexOf(property),             // [1]
			allValueIndex = transitionPropertyList.lastIndexOf(settings.valueAll),    // [2]
			shorthandIndex = -1,                                                      // [3]
			shorthand;

		// Check if the property has a hyphen in its name. If it does we will
		// also have to check if the shorthand property is defined in the list
		// of properties to transition.
		if (property.indexOf('-') > -1) {
			// Get the name of the shorthand property by taking all the
			// characters from the property name up to the first occurrence of
			// the hyphen
			shorthand = property.substr(0, property.indexOf('-'));
			// Now find the last index of the shorthand property in the list of
			// properties to transition.
			shorthandIndex = transitionPropertyList.lastIndexOf(shorthand);
		}

		// Now we finally have all the info needed to know at which index to
		// look for the timing value.
		var index = Math.max(propertyIndex, allValueIndex, shorthandIndex);

		return index;
	}

	/**
	 * Returns the duration or delay of the transition for a specific
	 * property on a specific DOM element.
	 *
	 * @param {HTMElement} element The element from which the transition
	 *                             duration for a specific property is
	 *                             needed.
	 * @param {String} property    The name of the property whose transition
	 *                             duration or delay should be returned.
	 *
	 * @returns {Number} When the requested property was not found in the
	 *                   properties with a transition than the result is
	 *                   0. When the specified property does have a transtion
	 *                   the result is the transition duration or delay for
	 *                   that property in milliseconds.
	 */
	function getTimingForProperty(element, property, transitionTimingProperty) {
		var styles = window.getComputedStyle(element),
			properties = styles[settings.propertyProperty].split(', '),
			timings = styles[transitionTimingProperty].split(', '),
			index = resolvePropertyToTransitionPropertyIndex(properties, property);

		if (index === -1) {
			return 0;
		}

		// The list of timings doesn't have to match the list of properties.
		// When this is the case the specs state that the list of timings have
		// to be repeated till it matches the property list.
		// Say we have property index 5 and a timing list of 3 [x,y,z] then the
		// timing should be y. By peforming a modulo with the length of the
		// timing list (3) we can determine the corrected index. IE: 5 % 3 = 2,
		// at index 2 we find y.
		if (index >= timings.length) {
			index = index % (timings.length);
		}

		// The value will be something like 0.3s. parseFloat will ignore
		// all input after the first non-number so there is no need to
		// sanatize the timing before wo process it.
		var value = parseFloat(timings[index]);
		// We will convert the timing into milliseconds.
		return (value * 1000);
	}
	/* == PRIVATE METHODS =================================================== */



	/* ====================================================================== *\
        	PUBLIC API
	\* ====================================================================== */
	/**
	 * Returns the transition delay set on the provided element for the
	 * specified CSS property.
	 *
	 * @param {HTMElement} element The element whose CSS property the transition
	 *                             length should be returned for.
	 * @param {String} property    The name of the property whose transition
	 *                             delay should be returned.
	 * @return {Number}            The transition delay for the element and CSS
	 *                             property combination, in milliseconds.
	 */
	function getDelay(element, property) {
		return getTimingForProperty(element, property, settings.propertyDelay);
	}

	/**
	 * Returns the transition duration set on the provided element for the
	 * specified CSS property.
	 *
	 * @param {HTMElement} element The element whose CSS property the transition
	 *                             length should be returned for.
	 * @param {String} property    The name of the property whose transition
	 *                             duration should be returned.
	 * @return {Number}            The transition duration for the element and
	 *                             CSS property combination, in milliseconds.
	 */
	function getDuration(element, property) {
		return getTimingForProperty(element, property, settings.propertyDuration);
	}

	/**
	 * Returns the total time it takes for the transition of the specified
	 * property to complete. This is the sum of the transition delay and
	 * transition duration as specified for the CSS property.
	 *
	 * @param {HTMElement} element The element whose CSS property the transition
	 *                             length should be returned for.
	 * @param {String} property    The name of the property whose transition
	 *                             length should be returned.
	 *
	 * @returns {Number} When the requested property was not found in the
	 *                   properties with a transition than the result is
	 *                   0. When the specified property does have a transtion
	 *                   the result is the sum of the transition delay and
	 *                   duration properties in milliseconds.
	 */
	function getTotalDuration(element, property) {
		var result = getTimingForProperty(element, property, settings.propertyDelay);
		result += getTimingForProperty(element, property, settings.propertyDuration);

		return result;
	}

	/**
	 * Returns a promise which will be resolved when one of the following
	 * scenarios is met:
	 * - The transition for the combination of element and property has a total
	 *   duration of 0ms;
	 * - The transition end event has been dispatched for the combination of
	 *   element and property;
	 * - The total length of the transition, plus a small margin, has passed and
	 *   the transitionend event has not been received.
	 *
	 * @param {HTMElement} element The element to watch for a transition end.
	 * @param {String} property    The name of the CSS property to watch.
	 * @return {Promise}           A promise which will be resolved once the
	 *                             transition has ended.
	 */
	function getTransitionEndPromise(element, property) {
		return new Promise(function(resolve, reject) {
			var totalDuration = getTotalDuration(element, property);

			// When the total duration is 0 we can immediately resolve the
			// promise as the property to watch for is not animated.
			if (totalDuration === 0) {
				return resolve();
			}

			var backupTimeout,
				handleTransitionEndEvent = function(event) {
					// When event is null the method is called by the timeout,
					// when the event is not null we need to check if the
					// requested property is that one that has completed its
					// transition.
					// When the CSS specifies "all" as the CSS property to
					// transition we still get the individual CSS properties
					// that have changed. If the caller specified "all" as the
					// property to monitor we can just resolve the promise at
					// the first time the transitionend event has been received.
					if (event == null || event.propertyName === property || property === settings.valueAll) {
						// The transition of the property has completed, we can
						// clear the backup timeout and remove the event
						// listener we had attached.
						clearTimeout(backupTimeout);
						element.removeEventListener(settings.eventTransitionEnd, handleTransitionEndEvent);
						// Resolve the promise.
						resolve({
							duration          : (event) ? event.elapsedTime : totalDuration,
							property          : (event) ? event.propertyName : property,
							resolvedByTimeout : (event == null)
						});
					}
				};

            // Add some extra time to the duration to give the transitionend
            // event a bit of time be triggered.
			totalDuration += settings.timeoutPadding;
            // Listen to the transitionend event and set the timeout in case the
            // event is not triggered.
			element.addEventListener(settings.eventTransitionEnd, handleTransitionEndEvent);
			backupTimeout = setTimeout(handleTransitionEndEvent, totalDuration);
		});
	}

	/**
	 * Returns whether or not transitions are supported by the browser.
	 *
	 * @return {Boolean} True when transitions are supported by the browser;
	 *                   otherwise the result is false.
	 */
	function isSupported() {
		return transitionsSupported;
	}
	/* == PUBLIC API ======================================================== */



	/* ====================================================================== *\
        	INIT METHODS
	\* ====================================================================== */
	function init() {
		// Create an element which we can use to test the transition property.
		var element = document.createElement('div');
		// Test if the standard property is supported, when it is there is
		// nothing else to do as the settings are already using the default
		// names.
		if (element.style['transition'] !== undefined) {
			return;
		}

		// We know the standard property and event names aren't supported by the
		// browser. We will try to determine the prefixed names.
		transitionsSupported = determinePrefixedNames();
	}
	/* == INIT METHODS ====================================================== */

	init();

	return {
		getDelay                : getDelay,
		getDuration             : getDuration,
		getTotalDuration        : getTotalDuration,
		getTransitionEndPromise : getTransitionEndPromise,
		isSupported             : isSupported
	};
}));
