/**
 * impressConsole.js
 *
 * Adds a presenter console to impress.js
 *
 * MIT Licensed, see license.txt.
 *
 * Copyright 2012, 2013 impress-console contributors (see README.txt)
 *
 * version: 1.2-dev
 * 
 */

(function ( document, window ) {
    'use strict';

    // This is the default template for the speaker console window
    var consoleTemplate = '<!DOCTYPE html>' + 
        '<html id="impressconsole"><head>' + 
          '<link rel="stylesheet" type="text/css" media="screen" href="{{cssFile}}">' +
        '</head><body>' + 
        '<div id="console">' +
          '<div id="views">' +
            '<div id="viewWrapper">' +
              '<iframe id="slideView" scrolling="no"></iframe>' +
            '</div>' +
          '</div>' +
          '<div id="notes"></div>' +
        '</div>' +
        '</body></html>';

    // Default css location
    var cssFile = "css/impressConsole.css";
    
    // All console windows, so that you can call impressConsole() repeatedly.
    var allConsoles = {};
    
    var useAMPM = false;
    
    // Zero padding helper function:
    var zeroPad = function(i) {
        return (i < 10 ? '0' : '') + i;
    };
    
    // The console object
    var impressConsole = window.impressConsole = function (rootId) {

        rootId = rootId || 'impress';
        
        if (allConsoles[rootId]) {
            return allConsoles[rootId];
        }
        
        // root presentation elements
        var root = document.getElementById( rootId );

        var consoleWindow = null;

        var nextStep = function() {
            var nextElement = document.querySelector('.active').nextElementSibling;
            var classes = "";
            while (nextElement) {
                classes = nextElement.attributes['class'];
                if (classes && classes.value.indexOf('step') !== -1) {
                   return nextElement;
                }
                nextElement = nextElement.nextElementSibling;
            }
            // No next element. Pick the first
            return document.querySelector('.step');
        };
        
        // Sync the notes to the step
        var onStepLeave = function(){
            if(consoleWindow) {
                // Set notes to next steps notes.
                var newNotes = document.querySelector('.active').querySelector('.notes');
                if (newNotes) {
                    newNotes = newNotes.innerHTML;
                } else {
                    newNotes = '';
                }
                consoleWindow.document.getElementById('notes').innerHTML = newNotes;

                // Set the views                
                var baseURL = document.URL.substring(0, document.URL.search('#/'));
                var slideSrc = baseURL + '#' + document.querySelector('.active').id;
                var preSrc = baseURL + '#' + nextStep().id;
                var slideView = consoleWindow.document.getElementById('slideView');
                // Setting them when they are already set causes glithes in Firefox, so we check first:
                if (slideView.src !== slideSrc) {
                    slideView.src = slideSrc;
                }
            }
        };
    
        // Sync the previews to the step
        var onStepEnter = function(){
            if(consoleWindow) {
                // We do everything here again, because if you stopped the previos step to
                // early, the onstepleave trigger is not called for that step, so
                // we need this to sync things.
                var newNotes = document.querySelector('.active').querySelector('.notes');
                if (newNotes) {
                    newNotes = newNotes.innerHTML;
                } else {
                    newNotes = '';
                }
                var notes = consoleWindow.document.getElementById('notes');
                notes.innerHTML = newNotes;
                notes.scrollTop = 0;
                
                // Set the views
                var baseURL = document.URL.substring(0, document.URL.search('#/'));
                var slideSrc = baseURL + '#' + document.querySelector('.active').id;
                var preSrc = baseURL + '#' + nextStep().id;
                var slideView = consoleWindow.document.getElementById('slideView');
                // Setting them when they are already set causes glithes in Firefox, so we check first:
                if (slideView.src !== slideSrc) {
                    slideView.src = slideSrc;
                }
            }
        };

        var spaceHandler = function () {
            var notes = consoleWindow.document.getElementById('notes');
            if (notes.scrollTopMax - notes.scrollTop > 20) {
               notes.scrollTop = notes.scrollTop + notes.clientHeight * 0.8;
            } else {
               impress().next();
            }
        };

        var registerKeyEvent = function(keyCodes, handler, window) {
            if (window === undefined) {
                window = consoleWindow;
            }
            
            // prevent default keydown action when one of supported key is pressed
            window.document.addEventListener("keydown", function ( event ) {
                if ( !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && keyCodes.indexOf(event.keyCode) !== -1) {
                    event.preventDefault();
                }
            }, false);
                    
            // trigger impress action on keyup
            window.document.addEventListener("keyup", function ( event ) {
                if ( !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && keyCodes.indexOf(event.keyCode) !== -1) {
                        handler();
                        event.preventDefault();
                }
            }, false);
        };
        
        var consoleOnLoad = function() {
	        var slideView = consoleWindow.document.getElementById('slideView');
	        var preView = consoleWindow.document.getElementById('preView');

		// Firefox:
		slideView.contentDocument.body.classList.add('impress-console');
		
		// Chrome:
	        slideView.addEventListener('load', function() {
		        slideView.contentDocument.body.classList.add('impress-console');
	        });
        };        
    
        var open = function() {
            if(top.isconsoleWindow){ 
                return;
            }
            
            if (consoleWindow && !consoleWindow.closed) {
                consoleWindow.focus();
            } else {
                consoleWindow = window.open();
                // This sets the window location to the main window location, so css can be loaded:
                consoleWindow.document.open();
                // Write the template:
                consoleWindow.document.write(consoleTemplate.replace("{{cssFile}}", cssFile));
                consoleWindow.document.title = 'Notes (' + document.title + ')';
                consoleWindow.impress = window.impress;
                // We set this flag so we can detect it later, to prevent infinite popups.
                consoleWindow.isconsoleWindow = true;
                // Set the onload function:
                consoleWindow.onload = consoleOnLoad;
                
                // keyboard navigation handlers
                // 33: pg up, 37: left, 38: up
                registerKeyEvent([33, 37, 38], impress().prev);
                // 34: pg down, 39: right, 40: down
                registerKeyEvent([34, 39, 40], impress().next);
                // 32: space
                registerKeyEvent([32], spaceHandler);
                
                
                // It will need a little nudge on Firefox, but only after loading:                
                onStepEnter();
                consoleWindow.initialized = false;
                consoleWindow.document.close();

                return consoleWindow;
            }
        };

        var init = function(css) {
            if (css !== undefined) {
                cssFile = css;
            }

            // Register the event
            root.addEventListener('impress:stepleave', onStepLeave);
            root.addEventListener('impress:stepenter', onStepEnter);
            
            //When the window closes, clean up after ourselves.
            window.onunload = function(){
                if (consoleWindow && !consoleWindow.closed) {
                    consoleWindow.close();
                }
            };
            
            //Open speaker console when they press 'p'
            registerKeyEvent([80], open, window);
        };
                
        // Return the object        
        allConsoles[rootId] = {init: init, open: open, registerKeyEvent: registerKeyEvent};
        return allConsoles[rootId];
        
    };
    
})(document, window);
