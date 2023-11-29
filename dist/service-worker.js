//https://developer.chrome.com/docs/extensions/reference/sidePanel/

const GOOGLE_ORIGIN = 'https://www.google.com';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

//Script Dynamic Declaration
// chrome.scripting
//   .registerContentScripts([{
//     id: "session-script",
//     js: ["script.js"],
//     persistAcrossSessions: true,
//     matches: ["https://sp-authoexam-default-rtdb.asia-southeast1.firebasedatabase.app"],
//     runAt: "document_start",
//   }])
//   .then(() => console.log("registration complete"))
//   .catch((err) => console.warn("unexpected error", err))