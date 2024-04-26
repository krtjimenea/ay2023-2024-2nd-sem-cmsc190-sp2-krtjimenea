//contains listeners and functions
// Import the functions you need from the SDKs you need
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, orderByValue,setValue} from 'firebase/database';
import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);



import '../stylesheet.css';
const landingPage = '/LandingPage.html';
const studentInputPage = '/StudentInputPage.html';
const InputNumberPage = '/RegistrationPage.html';
const FacultySuccessReg = '/FacultySuccessRegistration.html';
const facultyDashboardPage = '/FacultyDashboardPage.html';
const facultySchedulePage = '/FacultySchedulePage.html';
const StudentExamDetailsPage = '/StudentAssessmentDetails.html';
//Admin Routes
const AdminDashboard = '/AdminDashboard.html';
const facultyViewAssessments = '/FacultyManageAssessments.html';

//Function to get SidePanel path
function monitorSidePanelPath() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    //get the current tab information
    const tabId = tabs[0].id;
    //get the sidepanel information
    chrome.sidePanel.getOptions({ tabId }, function(options) {
      const path = options.path;
      console.log('path: ' + path);
      if(path === '/FacultySchedulePage.html'){
        var receivedUserId;
        chrome.storage.local.get('currentUserId', function(data) {
          receivedUserId = data.currentUserId;
          viewFacultyCourses(receivedUserId);
        });
        
      }else if(path === '/FacultyManageAssessments.html'){
        var receivedUserId;
        chrome.storage.local.get('currentUserId', function(data) {
          receivedUserId = data.currentUserId;
          viewFacultyAssessmentsList(receivedUserId);
        });
      }
    });
  });
};


//gets the current path of the sidePanel
monitorSidePanelPath();

window.addEventListener('DOMContentLoaded', function () {
  
  const headDiv = document.getElementById('AppBody'); // Replace with the actual ID

  headDiv.addEventListener('click', function (event) {
    console.log('Click event fired');

    const target = event.target;
    var currentUserId;

    // Check if the clicked element is the GoogleLoginBtn
    if (target.id === 'GoogleLoginBtn') {
      console.log('Clicked on GoogleLoginBtn');
      getChromeIdentity();
    }

    // Check if the clicked element is the SubmitIDBtn
    if (target.id === 'SubmitIDBtn') {
      console.log('Clicked on SubmitIDBtn');
      checkUser();
    }

    if (target.id === 'SignInAgain') {
      chrome.sidePanel.setOptions({path:landingPage});
    }

    //For faculty dashboard events
    if(target.id === 'ScheduleBtn'){
      console.log('Clicked on Schedule Assessment');
      chrome.sidePanel.setOptions({path:facultySchedulePage});

    }
    if(target.id === 'ManageBtn'){
      console.log('Clicked on Manage Assessment');
      chrome.sidePanel.setOptions({path:facultyViewAssessments});

    }

    if(target.id === 'SubmitExamSchedBtn'){
      console.log('Clicked Submit Exam Sched');
      scheduleExam(currentUserId);
     
    }

    //For student
    if(target.id==='SubmitBtn'){
      console.log('Clicked Submit Exam Code');
      //check if the exam code is valid then show the assessment details
      checkExamCode();


      

    }
  });
});


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
        alert('SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}')
        return
      }
     
      chrome.sidePanel.setOptions({path: InputNumberPage});
     
    })
}


//function after input of ID Number
function checkUser(){
  //get the input
  var IDinput = document.getElementById('IDNumInput').value;
  //check if valid number format
  var IDNumFormat = /^[0-9]{9}$/;
  if(IDinput.match(IDNumFormat)){
    chrome.runtime.sendMessage({action: 'currentUser', value: IDinput});

    if(IDinput[0]=== '1'){
      console.log('Faculty');
      //check the database first if that faculty exists
      isFacultyRegistered(IDinput);
    }else if(IDinput[0] === '2'){
      console.log('Student');
      isStudentRegistered();
      //route to Student Dashboard
    }else if(IDinput[0] === '0'){
      //route to Admin Dashboard
      console.log('Admin')
      chrome.sidePanel.setOptions({path: AdminDashboard})
    }else{
      alert('Wrong Format');

    }

  }else{
    alert('Wrong Format');
  }
  

}

//function to check if faculty is already registered
function isFacultyRegistered(IDnumber){
  console.log(IDnumber);
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
          //get profile uid
          if (user !== null) {
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const email = profile.email;
              const db = getDatabase(); 
              const studentRef = ref(db,'faculty-in-charge/' + IDnumber);
              //find if the profile UID exists
              get(studentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  console.log("UID Exists, Faculty is Registered");
                  //route to Faculty Dashboard
                  chrome.sidePanel.setOptions({path:facultyDashboardPage})
                } else {
                  alert("Success Firebase Access!");
                  console.log("UID does not exist, Faculty is NOT REGISTERED");
                  //Register Process, Add The Faculty to the database
                  //get all the input
                  //split name
                  const nameArray = profile.displayName.split(" ");
                  const FirstName = nameArray[0];
                  const LastName = nameArray[nameArray.length-1];
                  var newFaculty = {
                    authProviderUID: profileID,
                    name: FirstName+ " " + LastName,
                    email: email,
                    employeeNum: IDnumber,
                    numOfClasses: 0
                  }
                  const facultyRef = ref(db,'faculty-in-charge/');
                  const teachingRef = ref(db,'teachingClasses/')
                

                  //update with the new data to the collection
                  const updates = {};
                  updates['/faculty-in-charge/' + IDnumber] = newFaculty;
                  update(ref(db), updates)
                    .then(()=>{
                      console.log('Success in Adding new Faculty with key: ' + IDnumber);
                      alert('Success in Adding new Faculty');
                    })
                    .catch((err) => {
                      console.log("Error with database: " + err);
                    })

                  //update teaching classes collection
                  var newRelationship = {courseId:''}
                  const updatesRelation = {};
                  updatesRelation['/teachingClasses/' + IDnumber] = newRelationship;
                  update(ref(db), updatesRelation)
                    .then(()=>{
                      console.log('Success in Adding new Faculty to teaching Classes');
                      alert('Success in Adding new Faculty to teaching Classes');
                    
                    })
                    .catch((err) => {
                      console.log("Error with database: " + err);
                    })
                  //after adding the new faculty, set path to the You are now registered, sign in again
                  chrome.sidePanel.setOptions({path:FacultySuccessReg});

                }//EOF else not registered
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              });
          });
        }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });

}

function isStudentRegistered(){
   //check log in
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
          //get profile uid
          if (user !== null) {
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const db = getDatabase(); 
              const studentRef = ref(db,'students/' + profile.uid);
              //find if the profile UID exists
              get(studentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  console.log("UID Exists, Student is Registered");
                  chrome.sidePanel.setOptions({path:studentInputPage})
                } else {
                  alert("Success Firebase Access!");
                  console.log("UID does not exist, Student is NOT REGISTERED");
                  //Register Process, Add to database, Add them to the course
                }
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              });
          });
        }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
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
                    SystemCPU: studentCPU,
                    SystemBrowser: studentBrowser
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

//function to check exam code
function checkExamCode(){
  //for demo purposes but must check with database
  var examCodeInput = document.getElementById('assessmentCodeInput').value;
  // examCodeInput.match('GHB456');
  if(examCodeInput === 'GHB456'){
    //compute AuthRiskScore
    //move to next panel
    compareAuthRiskScore();
  }else{
    alert('Wrong Exam Code Input');
  }
      
}

//function to compare Auth Risk Score
function compareAuthRiskScore(){
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
            //get the student attribute from the database
            if (user !== null) {
              user.providerData.forEach((profile) => {
                const profileID = profile.uid;
                const db = getDatabase();
                const studentRef = ref(db,'students/' + profile.uid);
                
                get(studentRef)
                //get the snapshot of the database
                .then((snapshot)=> {
                  //get the gathered student attributes
                  const data = snapshot.val();
                  console.log(data);
                  const geolocationlat = data.geolocation_lat;
                  const geolocationlong = data.geolocation_long;
                  const ipAddressStudent = data.ipAddress;
                  const display = data.SystemDisplayResolution;
                  const cpu = data.SystemCPU;
                  const os = data.OperatingSystem;
                  const browser = data.SystemBrowser;
                  let totalMatchedWeight = 0;
                  // //compare geolocation
                  // if(geolocation.latitude === geolocationlat){
                  //   console.log('Matched Geolocation Latitude');
                  //   if(geolocation.longitude === geolocationlongitude){
                  //     console.log('Matched Geolocation Longitude');
                  //     //Current Total Matched Weight = 6
                  //     totalMatchedWeight = 6;
                  //   }else{
                  //     console.log('Did not match Geolocation Long');
                      
                  //   }
                  // }else{
                  //   console.log('Did not match Geolocation Lat');
                  //   console.log('Current Signin GeoLat:'+ geolocation.latitude);
                  //   console.log('Saved GeoLat'+ geolocationlat);
                  // }

                  //compare IP address
                  // if(ipAddress===ipAddressStudent){
                  //   alert('IP Matched');
                  //   totalMatchedWeight = 5;
                  // }else{
                  //   alert('IP Did not match, Saved IP: ' + ipAddressStudent + 'Current IP: '+ ipAddress);
                  // }

                  //compare system Display
                  if(studentDisplay===display){
                    alert('Display Matched');
                    totalMatchedWeight = totalMatchedWeight + 4;
                  }else{
                    alert('Did not match, Saved Display: ' + studentDisplay + 'Current Display: '+ display);
                  }

                  //compare system CPU
                  if(studentCPU===cpu){
                    alert('CPU Matched');
                    totalMatchedWeight = totalMatchedWeight + 3;
                  }else{
                    alert('Did not match');
                  }
                  console.log(totalMatchedWeight);
                  //compute AuthRiskScore
                  var AuthRiskScore = getAuthRiskScore(totalMatchedWeight);
                  console.log('AuthRiskScore is = ' + AuthRiskScore);

                  //if riskscore is 0.90 above go to next page
                  if(AuthRiskScore >= 1){
                    console.log('tEST');
                    chrome.sidePanel.setOptions({path: StudentExamDetailsPage});
                    isBrowserMinimized();

                  }
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

//function to compute and return the auth risks score
function getAuthRiskScore(totalMatchedWeight){

  //weights
  // var geolocWeight = 6;
  // var ipAddrWeight = 5;
  // var displayWeight = 4;
  // var cpuWeight = 3;
  // var osWeight = 2;
  // var browserWeight =1;
  // var totalWeight = 21;

  var AuthRiskScore = totalMatchedWeight/7;

  return AuthRiskScore;
}


//function to check if browser is minimized
function isBrowserMinimized(){
  //using chrome.window.windowState API
  chrome.windows.getAll({ populate: true }, function(windows) {
    windows.forEach(function(window) {
      console.log("Window ID:", window.id);
      console.log("Window State:", window.state);
      alert("Window State: " + window.state);
    });
  });

}