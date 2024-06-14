//function to get copy event

//on copy event, send a message to the service worker
document.addEventListener('copy', function(event){
    console.log("Copy Detected")
    chrome.runtime.sendMessage({event: "copy"});
});

//paste event
document.addEventListener('paste', function(event) {
    console.log("Paste Detected")
    chrome.runtime.sendMessage({event: "paste"});
});
