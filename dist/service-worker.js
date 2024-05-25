//https://developer.chrome.com/docs/extensions/reference/sidePanel/

const GOOGLE_ORIGIN = 'https://www.google.com';
const landingPage = 'src/sidebar/LandingPage.html';
const studentInputPage = 'src/sidebar/StudentInputPage.html';

// Listen for the onInstalled event
chrome.runtime.onInstalled.addListener(function() {
  // Clear the local storage
  chrome.storage.local.clear(function() {
    console.log("Local storage cleared");
  });
});

chrome.windows.onRemoved.addListener(function(windowId) {
  // Clear Chrome storage when any window is closed
  chrome.storage.local.clear(function() {
      console.log('Chrome storage cleared.');
  });
});


chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));

//chrome listener for message passing between panels
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  //historyStack
  if(message.action === 'sendCurrentPath'){
    console.log('Current Path: ', message.value);
    //manipulate the stored history in local storage
    //get the stored list from chrome storage
    chrome.storage.local.get('historyStack', function(result) {
      //check if the list exists in storage
      if (result.historyStack) {
        //history stack exists
        var myList = result.historyStack;
        console.log("Existing History Stack:", myList);

        //add an item to the list
        if(myList.includes(message.value)){
          //do not add to the stack anymore
          chrome.storage.local.set({'historyStack': myList}, function() {
            //console.log("History Stack updated with new item:", myList);
          });
        }else{
          myList.push(message.value);
          //save the updated list back to chrome storage
          chrome.storage.local.set({'historyStack': myList}, function() {
            //console.log("History Stack updated with new item:", myList);
          });
        }
        

      
      } else {
        // If the list doesn't exist, initialize it
        var initialList = [message.value];

        // Save the initial list to chrome storage
        chrome.storage.local.set({'historyStack': initialList}, function() {
          //console.log("Initial history stack saved:", initialList);
        });
      }
    });

  }
  if(message.action === 'passValue1') {
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

//THIS IS FACULTY NAME
 if(message.action === 'facultyKeyValue'){
    //chrome storage
    console.log('Received facultyKeyValue:', message.value);
    chrome.storage.local.set({'currentfacultyKeyValue': message.value});
  } 

  //THIS IS FACULTY ID
 if(message.action === 'facultyIDValue'){
  //chrome storage
  console.log('Received facultyIDValue:', message.value);
  chrome.storage.local.set({'currentfacultyIDValue': message.value});
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

  if(message.action === 'newTabData'){
    console.log('Received value:', message.value);
    chrome.storage.local.set({'currentNewtabsData': message.value});
  }

  if(message.action === 'tabSwitched'){
    console.log('Received value: ', message.value);
    chrome.storage.local.set({'currentNumTabsSwitched': message.value});
  }

  if(message.action === 'studentIdentity_uponExam'){
    // console.log('Received Student Identity Upon Log in: ', message.value);
    chrome.storage.local.set({'currentStudentIdentity_uponExam': message.value});
  }

  if(message.action === 'AuthFlagged'){
    console.log('Received didAuth: ', message.value);
    chrome.storage.local.set({'currentAuthFlagged': message.value});
    sendResponse({status: 'received AuthFlagged'});
  }

  if(message.action === 'examKey'){
    console.log('Received examKey: ', message.value);
    chrome.storage.local.set({'currentExamKey': message.value});
  }

  if(message.action === 'studentKey'){
    console.log('Received studentKey: ', message.value);
    chrome.storage.local.set({'currentstudentKey': message.value});

  }

  if(message.action === 'currentStudentSection_Report'){
    chrome.storage.local.set({'currentSectionKey': message.value});
  }

  if(message.action === 'currentStudentExam_Report'){
    chrome.storage.local.set({'currentExamReportKey': message.value});
  }

  if(message.action === 'examName'){
    console.log('Received exam: ', message.value);
    chrome.storage.local.set({'currentExamName': message.value});
  }

});

let copyCounter = 0;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.event === "copy") {
    copyCounter+=1;
    console.log("Copy detected ");
    // chrome.storage.local.set({'copyCounter': copyCounter});
  }
  // console.log("TOTAL COPIES" + copyCounter);
  chrome.storage.local.set({'copyCounter': copyCounter});

});

let pasteCounter = 0;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.event === "paste") {
    pasteCounter+=1;
    console.log("Paste detected ");
    // chrome.storage.local.set({'copyCounter': copyCounter});
  }
  chrome.storage.local.set({'pasteCounter': pasteCounter});

});

