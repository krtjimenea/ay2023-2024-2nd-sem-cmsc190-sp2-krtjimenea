//contains listeners and functions
// Import the functions you need from the SDKs you need
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set} from 'firebase/database';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);

import '../stylesheet.css';
const studentInputPage = '/StudentInputPage.html';


window.addEventListener('DOMContentLoaded', function () {
  const selection = document.getElementById('GoogleLoginBtn');
  selection.addEventListener('click', getChromeIdentity);
});

//event listener for student input
window.addEventListener('DOMContentLoaded', function () {
  const selection = document.getElementById('SubmitBtn');
  selection.addEventListener('click', getAuthFirebase);
});

// function getChromeIdentity(){
//     //checking if there is a logged in user
//     chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
//       console.log("token: " + token);
//       //firebase
//     });
// }

//callback function for getting IP address
function getIPAddress(callback){
  fetch('https://api.ipify.org?format=json')
    .then(res =>{
      if(!res.ok){
        throw new Error('Failed to fetch IP address');
      } return res.json(); //return the JSON format
    })
    .then(data => {
      const ipAdd = data.ip;
      console.log('Public IP is: ', ipAdd);
      //callback
      callback(ipAdd);
    })
    .catch(error =>{
      console.error('Error: ', error);
    });
}

//callback function for getting geolocation
function getGeolocation(callback){
  navigator.geolocation.getCurrentPosition(
    position => {
      const {latitude, longitude} = position.coords;
      //callback
      callback({latitude, longitude});
     
    },
    error => {
      console.error('Error getting geolocation', error);
    }
  )

}
function getChromeIdentity(){
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }
     
      chrome.sidePanel.setOptions({path: studentInputPage});
     
    })
}

//function once student submitted all information
function getAuthFirebase(){
    //check if there is a logged in user
    chrome.identity.getAuthToken({ interactive: true }, token =>
      {
        if ( chrome.runtime.lastError || ! token ) {
          alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
          return
        }

        //get the background information of the student
       
        //get the os of the user
        var studentOS;
        chrome.runtime.getPlatformInfo(function(info){
          if(info){
            studentOS = info.os;
            console.log(studentOS);
          }
        });

        //get the browser information
        var studentBrowser;
        const userAgent = window.navigator.userAgent;
        if (userAgent.includes('Chrome')){
          console.log('Google Chrome');
          studentBrowser = 'Google Chrome';
        }else if (userAgent.includes('Firefox')) {
          studentBrowser = 'Mozilla Firefox';
        } else if (userAgent.includes('Edge')) {
          studentBrowser = 'Microsoft Edge';
        } else {
          console.log('Browser: Unknown');
        }

        //get the display resolution
        var studentDisplay;
        chrome.system.display.getInfo(function(info){
          if(info){
            //loop through
            info.forEach(display => {
              // studentDisplay = info.bounds.width + 'x' + info.bounds.height;
              console.log('Bounds:', display.bounds);
              console.log('Width:', display.bounds.width);
              console.log('Height:', display.bounds.height);
              studentDisplay = display.bounds.width + 'x' + display.bounds.height;

            })
          
          }
        })

        //get the system cpu info
        var studentCPU;
        chrome.system.cpu.getInfo(function(info){
          if(info){
            studentCPU = info.modelName;
          }
        })

        //get IP address, callback function
        getIPAddress(ipAddress => {
          //get the geolocation
          getGeolocation(geolocation => {
            //firebase authentication
            signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
            .then(res =>
            {
              const user = auth.currentUser;
              
              if (user !== null) {
                user.providerData.forEach((profile) => {
                  // console.log("Sign-in provider: " + profile.providerId);
                  // console.log("  Provider-specific UID: " + profile.uid);
                  // console.log("  Name: " + profile.displayName);
                  // console.log("  Email: " + profile.email);
                  // console.log("  Photo URL: " + profile.photoURL);
                
                  //write student info in database
                  //split name
                  const nameArray = profile.displayName.split(" ");
                  const FirstName = nameArray[0];
                  const LastName = nameArray[1];
                  var studentNum = document.getElementById("studentNumInput").value;
              
                  
                  const db = getDatabase(); 
                  set(ref(db,'students/' + profile.uid),{
                    FirstName: FirstName,
                    LastName: LastName,
                    Email: profile.email,
                    OperatingSystem: studentOS,
                    StudentNumber: studentNum,
                    IPAddress: ipAddress,
                    geolocation_lat: geolocation.latitude,
                    geolocation_long: geolocation.longitude,
                    UserAgentString: studentBrowser,
                    SystemDisplayResolution: studentDisplay,
                    SystemCPU: studentCPU
                  })
                  .then(()=> {
                    alert("Saved to database!");
                  })
                  .catch((err) => {
                    console.log(("error with database" + err));
                  })
                });

              }
            }) //EOF signInWithCredential
            .catch(err =>
            {
              alert("SSO ended with an error" + err);
            })
          }) //EOF geolocation
      })//EOF ipCallback

    })//EOF getAuthToken
        
  }
