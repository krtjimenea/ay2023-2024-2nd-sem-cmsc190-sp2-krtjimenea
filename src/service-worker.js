//https://developer.chrome.com/docs/extensions/reference/sidePanel/

const GOOGLE_ORIGIN = 'https://www.google.com';
const landingPage = 'src/sidebar/LandingPage.html';
const studentInputPage = 'src/sidebar/StudentInputPage.html';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


//chrome listener for message passing between panels
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'passValue1') {
    console.log('Received value:', message.value);
    //chrome storage
    chrome.storage.local.set({'value1': message.value});
  }
  
  if(message.action === 'passValue2'){
     //chrome storage
     console.log('Received value:', message.value);
     chrome.storage.local.set({'value2': message.value});
  }

  if(message.action === 'passValue3'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'value3': message.value});
 }

  if(message.action === 'currentUser'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentUserId': message.value});
 }

 if(message.action === 'currentAssessment'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentAssessmentId': message.value});
  }

  if(message.action === 'submissionTime'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentUserSubmitTime': message.value});
  }

  if(message.action === 'authRiskScore'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentAuthRiskScore': message.value});
  }

  if(message.action === 'timeStarted'){
    //chrome storage
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentTimeStarted': message.value});
  }

  if(message.action === 'timesBrowserOutOfFocus'){
    //chrome storage
    console.log('Received value timesBrowserOutOfFocus:', message.value);
    chrome.storage.local.set({'currentBrowserOutOfFocus': message.value});
  }

  if(message.action === 'tabsData'){
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currenttabsListData': message.value});

  }

});

let copyCounter = 0;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.event === "copy") {
    copyCounter+=1;
    console.log("Copy detected " + copyCounter);
    // chrome.storage.local.set({'copyCounter': copyCounter});
  }
  console.log("TOTAL COPIES" + copyCounter);

});

let pasteCounter = 0;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.event === "paste") {
    pasteCounter+=1;
    console.log("Paste detected " + pasteCounter);
    // chrome.storage.local.set({'copyCounter': copyCounter});
  }
  console.log("TOTAL PASTE" + pasteCounter);

});
