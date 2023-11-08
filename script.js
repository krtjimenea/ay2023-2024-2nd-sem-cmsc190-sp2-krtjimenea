window.addEventListener('DOMContentLoaded', function () {
    const selection = document.getElementById('GoogleLoginBtn');
    selection.addEventListener('click', getChromeIdentity);
  });








function getChromeIdentity(){
    //checking if there is a logged in user
    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
      console.log(token);
    });
}