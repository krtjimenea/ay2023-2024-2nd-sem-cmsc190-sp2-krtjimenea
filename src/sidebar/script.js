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


window.addEventListener('DOMContentLoaded', function () {
    const selection = document.getElementById('GoogleLoginBtn');
    selection.addEventListener('click', getChromeIdentity);
  });
console.log("hello");

// function getChromeIdentity(){
//     //checking if there is a logged in user
//     chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
//       console.log("token: " + token);
//       //firebase
//     });
// }

function getChromeIdentity(){
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
        .then(res =>
        {
          const user = auth.currentUser;

          if (user !== null) {
            user.providerData.forEach((profile) => {
              console.log("Sign-in provider: " + profile.providerId);
              console.log("  Provider-specific UID: " + profile.uid);
              console.log("  Name: " + profile.displayName);
              console.log("  Email: " + profile.email);
              console.log("  Photo URL: " + profile.photoURL);
            
              //write student info in database
              //split name
              const nameArray = profile.displayName.split(" ");
              const FirstName = nameArray[0];
              const LastName = nameArray[1];
              //get other information
              chrome.runtime.getPlatformInfo(function(info){
                console.log(info.os);
                const studentOS = info.os;
              });
              const db = getDatabase(); 
              set(ref(db,'users/' + profile.uid),{
                FirstName: FirstName,
                LastName: LastName,
                Email: profile.email,
                // OperatingSystem: studentOS
              })
              .then(()=> {
                alert("Saved to database!");
              })
              .catch((err) => {
                alert("error with database" + err);
              })
            });

          }
        })
        .catch(err =>
        {
          alert("SSO ended with an error" + err);
        })
    })
}