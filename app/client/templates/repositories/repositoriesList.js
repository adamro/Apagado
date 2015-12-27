Template.repositoriesList.helpers({
	userName: function() { 
		return Router.current().params.git_user_name;
	}
});