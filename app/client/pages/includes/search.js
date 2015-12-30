const NO_USERNAME_ERROR = 'Please fill in a GitHub user name';

Template.search.onCreated(function() { 
	this.searchError = new ReactiveVar('');
});

Template.search.helpers({
	errorMessage: function() { 
		return Template.instance().searchError.get();
	},
	errorClass: function() { 
		return !!Template.instance().searchError.get() ? 'has-error' : '';
	}
});

Template.search.events({
	'submit form': function(event) {
		event.preventDefault();

		var git_username = $(event.target).find('[name=git_username]').val();

		if(!git_username) { 
			Template.instance().searchError.set(NO_USERNAME_ERROR);
			return;
		}
		
		Template.instance().searchError.set('');
		Router.go('repositoriesList', { git_username: git_username });
	}
});