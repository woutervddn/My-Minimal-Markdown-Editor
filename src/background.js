chrome.app.runtime.onLaunched.addListener(function() { 
  
  // create a new window and position it with a fixed size
  var win = chrome.app.window.create('main.html', { 
    width: 900, 
    height: 600,
    minWidth:350,
    minHeight:465,
  });
});

chrome.app.window.onClosed.addListener(function(event) {
   win.left(); 
});
