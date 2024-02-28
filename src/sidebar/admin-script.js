
//Script for Admin 

//import for SDKs
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set, onValuek, get, update,push, child} from 'firebase/database';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);

//Variables for HTML
const AdminManageFaculty = '/AdminManageFaculty.html'

//Variables for modal
const modal = document.getElementsByClassName("Add-Faculty-Modal")[0];
const overlay = document.getElementsByClassName("modal-Overlay")[0];

function openModal () {
    // const modal = document.getElementsByClassName("Add-Faculty-Modal");
    modal.style.display = "block";
    overlay.style.display = "block";
    
};

function closeModal(){
    modal.style.display = "none";
    overlay.style.display = "none";
};


window.addEventListener('DOMContentLoaded', function () {
  
    const headDiv = document.getElementById('AppBody'); // Replace with the actual ID
  
    headDiv.addEventListener('click', function (event) {
      console.log('Click event fired');
  
      const target = event.target;

      //For Admin Dashboard Events
      if (target.id === 'ManageFacultyBtn'){
        console.log('Clicked on Manage Faculty')
        chrome.sidePanel.setOptions({path:AdminManageFaculty})
      }
  
      // Check if the clicked element is the Add New Faculty
      if (target.id === 'Add-New-Faculty') {
        console.log('Clicked on Add New Faculty');
        openModal();
      }

      if (target.className === 'ModalCloseBtn'){
        console.log('Clicked Close Modal');
        closeModal();

      }

      //for adding a new faculty
      if(target.id === 'Add-Faculty-DB'){
        console.log('Clicked Add New Faculty');
        createNewFaculty();
      }


    });
});

//function to create and save the new faculty
function createNewFaculty(){

    //get all the input
    var facultyName = document.getElementById('FacultyNameInput').value;
    var facultyID = document.getElementById('FacultyIDNumber').value;
    var facultyEmail = document.getElementById('FacultyEmail').value;

    console.log(facultyName);
    console.log(facultyID);
    console.log(facultyEmail);

    //check if there is a logged in user
    chrome.identity.getAuthToken({ interactive: true }, token =>
        {
          if ( chrome.runtime.lastError || ! token ) {
            alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
            return
          }
    
          //firebase authentication
          signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
          .then(res =>{
              const user = auth.currentUser;
                
              if (user !== null) {
                //there is a user signed in
                //new data 
                var newFaculty = {
                  name: facultyName,
                  email: facultyEmail,
                  employeeNum: facultyID,
                  classes: {
                    class1: false,
                    class2: false
                  }
                }

                //get a db reference
                const db = getDatabase();
                const facultyRef = ref(db,'faculty-in-charge');
                const newfacultyKey = push(child(ref(db), 'faculty-in-charge')).key;

                //update with the new data to the collection
                const updates = {};
                updates['/faculty-in-charge/' + newfacultyKey] = newFaculty;
                update(ref(db), updates)
                  .then(()=>{
                    console.log('Success in Adding new Faculty with key: ' + newfacultyKey);
                    alert('Success in Adding new Faculty');
                  })
                  .catch((err) => {
                    console.log("Error with database: " + err);
                  })

                
              }
           })//EOF signInWithCredential
          .catch(err =>{alert("SSO ended with an error" + err);})
      }) 
    
}
