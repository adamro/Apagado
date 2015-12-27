Accounts.onLogin(function(){
  var git_username = Meteor.user().profile.github.username;

  if(git_username) { 
  	Router.go('repositoriesList', { git_username: git_username});
  }
});