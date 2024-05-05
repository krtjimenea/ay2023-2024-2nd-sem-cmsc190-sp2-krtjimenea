//function to get copy event
// function didCopy(event){

   
  
//     document.addEventListener('paste', function(event){
//       console.log("Paste Detected")
//       // chrome.runtime.sendMessage({action: 'copyDetected', value: 'Copy Detected'});
//     });
  
// }
// document.addEventListener('copy', function(event){
//   console.log("Copy Detected")
//   chrome.runtime.sendMessage({action: 'copyDetected', value: 'CopyDetected'});
// });

// on copy event, send a message to background.html
function onCopy(e) { 
  console.log("Copy Detected")

  chrome.extension.sendMessage({event: "copy"});
}

//register event listener for copy events on document
document.addEventListener('copy',onCopy,true); 