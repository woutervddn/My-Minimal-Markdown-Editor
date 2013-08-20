//window.print();

var descriptionHeight="";
var lastFileEntry = null;

$(window).load(function() {
    resizeElements();
    $("#editor").split({
        orientation: 'vertical',
        limit:20,
        position: '50%'
    });
    $("#editor textarea").on('keyup', previewUpdateAndSave);
    /*$("#description textarea").on('keyup',resizeElements);*/
    
    //Align, display none, opacity 0
    //position fix with visibility hack
    $("#question-form").center();
    $("#question-form").css({display: "none",opacity: "1"});
    
});

$(window).resize(function() {
    resizeElements();
});

function resizeElements() {
    var editorHeight = $(window).outerHeight() - $("header").outerHeight() - $(".description").outerHeight() - $("footer").outerHeight(); /*- $("#editor").css('padding-top') - $("#editor").css('padding-bottom');'*/
    $("#editor").outerHeight(editorHeight);
    var editareaHeight =  $("#editor").innerHeight();
    $("#editor textarea").outerHeight(editareaHeight);
}
    
function previewUpdateAndSave() {
    var MDcontent = $("#editor textarea").val();
    var HTMLcontent = markdown.toHTML(MDcontent);
    $(".rendered-view").html(HTMLcontent);
    updateScroll();

    if (lastFileEntry != null) {
        save(lastFileEntry,  MDcontent);
    }
}

$(".md textarea").scroll(
    updateScroll
);

//button behavior

$("nav a").click(function(){
    link = $(this);
    actionIcon = link.children("svg").attr("id");
    
    switch (actionIcon) {
        case "open-icon":
            //window.alert("open file");

            var accepts = [{
                //mimeTypes: ['text/*'], // See crbug.com/145112.
                extensions: ['md', 'txt', 'txt', 'html', 'xml', 'tsv', 'csv', 'rtf']
            }];
            chrome.fileSystem.chooseEntry({type: 'openFile', accepts: accepts}, function(readOnlyEntry) {
                if (chrome.runtime.lastError) {
                    showError(chrome.runtime.lastError.message);
                    return;
                }
                if (!readOnlyEntry) {
                    $(".md textarea").value = 'No file selected.';
                    return;
                }
                /*chrome.storage.local.set(
                    {'chosenFile': chrome.fileSystem.retainEntry(readOnlyEntry)});*/
                chosenFileEntry = readOnlyEntry;
                console.log(chosenFileEntry);
                theTitle = chosenFileEntry.name.replace(/\.[^/.]+$/, "");
                $(".title input").val(theTitle);
                chosenFileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onerror = function(e){console.log(e)};
                    reader.onload = function(e) {
                        result = e.target.result;
                        console.log(e);
                        $(".md textarea").val(result);
                        previewUpdateAndSave();
                    };
                    
                    reader.readAsText(file);
                });      
            });        
            
            
            break;
        case "save-icon":
            //window.alert("save");
            theTitle = $(".title input").val()+".md";
            console.log("choose entry");
            chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: theTitle}, function(fileEntry) {
                    console.log(fileEntry);
                    lastFileEntry=fileEntry;
                    save(fileEntry,  $(".md textarea").val());
            });        
            
            
            break;
        
        case "cheat":
            window.alert("display cheatsheet");
            break;
        case "print-icon":
            //window.alert("print");
            $(".rendered-view").printThis({
                debug: false,              // show the iframe for debugging
                importCSS: true,           // import page CSS
                printContainer: true,      // grab outer container as well as the contents of the selector
                removeInline: false        // remove all inline styles from print elements
            });   
            break;
        case "dash-icon":
            window.alert("go to dashboard");
            break;
        case "question-icon":
            //window.alert("got question?");
            $("#question-form").fadeIn(500);
            break;
    }
});

function updateScroll() {
        
        var fontSize = $(".md textarea").css('font-size'),
            lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1),
            s = $(".md textarea").scrollTop(),
            d = $(".md textarea")[0].scrollHeight - ($(".md textarea").innerHeight() - $(".md textarea").height()),
            c = $(".md textarea").height();
            lineHeightPercentage = lineHeight/d;
            scrollPercent = (s / (d-c));
            scrollPercent += lineHeightPercentage*scrollPercent;
        
        var rd = $(".rendered-view")[0].scrollHeight,
            rc = $(".rendered-view").height(),
            rs = (scrollPercent)*(rd-rc);
         
        console.log(scrollPercent +" " + lineHeightPercentage);
        
        $(".rendered-view").scrollTop(rs);
        
    }

function save(fileEntry, content) {
  fileEntry.createWriter(function(fileWriter) {
    fileWriter.onwriteend = function(e) {
      fileWriter.onwriteend = null;
      fileWriter.truncate(content.length);
    };
    fileWriter.onerror = function(e) {
      console.log('Write failed: ' + e.toString());
    };
    var blob = new Blob([content], {'type': 'text/plain'});
    fileWriter.write(blob);
  }, errorHandler);
}
function errorHandler(e) {
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  console.log('Error: ' + msg);
}