//https://developer.chrome.com/docs/extensions/reference/sidePanel/

const GOOGLE_ORIGIN = 'https://www.google.com';
const landingPage = 'src/sidebar/LandingPage.html';
const studentInputPage = 'src/sidebar/StudentInputPage.html';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// // This code listens for changes in the sidePanel path
// chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//   chrome.tabs.sendMessage(details.tabId, { type: 'sidePanelPathChanged' });
// });

// chrome.runtime.onInstalled.addListener

// chrome.tabs.onActivated.addListener(async ({ tabId }) => {
//   const { path } = await chrome.sidePanel.getOptions({ tabId });
//   console.log("current path" + path);
//   // if (path === welcomePage) {
//   //   chrome.sidePanel.setOptions({ path: mainPage });
//   // }
// });

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
});
