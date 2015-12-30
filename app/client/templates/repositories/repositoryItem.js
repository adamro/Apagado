Template.repositoryItem.onCreated(function() {
	this.currentRepositoryDataTab = new ReactiveVar('');

	this.dataTypeFunctionsMap = { 
		'Watchers':{ 
			getData: Apagado.GitHubApi.getWatchers, 
			cache: Apagado.Cacher.cacheWatchers, 
			isCached: Apagado.Cacher.isFullNameRepositoryWatchersCached 
		},
		'Forks': { 
			getData: Apagado.GitHubApi.getForks ,
			cache: Apagado.Cacher.cacheForks, 
			isCached: Apagado.Cacher.isFullNameRepositoryForksCached 
		},  
		'Stargazers': { 
			getData: Apagado.GitHubApi.getStargazers, 
			cache: Apagado.Cacher.cacheStargazers, 
			isCached: Apagado.Cacher.isFullNameRepositoryStargazersCached
		}, 
		'Contributors': { 
			getData: Apagado.GitHubApi.getContributors, 
			cache: Apagado.Cacher.cacheContributors, 
			isCached: Apagado.Cacher.isFullNameRepositoryContributorsCached 
		}
	};

	this.currentRepositoryDataTabIs = function(tabName) { 
		return tabName == Template.instance().currentRepositoryDataTab.get();
	}
});

Template.repositoryItem.helpers({
	hasWatchers: function() {
		return this.watchers != 0;
	}, 
	hasForks: function() {
		return this.forks != 0;
	}, 
	hasStargazers: function() { 
		return this.stargazers_count != 0;
	}, 
	forksList: function() { 
		return Apagado.Cacher.Repositories.find({ fork_of: this.full_name });
	},
	watchersList: function() { 
		return Apagado.Cacher.Users.find({ watching: this.full_name });
	}, 
	stargazersList: function() { 
		return Apagado.Cacher.Users.find({ stargazering: this.full_name });
	}, 
	contributorsList: function() { 
		return Apagado.Cacher.Users.find({ contributed_to: this.full_name });
	},
	currentRepositoryDataTabIs: function (tabName) {
    	return Template.instance().currentRepositoryDataTabIs(tabName);
  	},
  	selectedIfCurrentRepositoryDataTabIs: function (tabName) {
	    if (Template.instance().currentRepositoryDataTabIs(tabName)) {
	      return 'selected';
	    } else {
	      return '';
	    }
  	}, 
  	currentRepositoryDataTabCached: function() {
  		var currentActiveTab = Template.instance().currentRepositoryDataTab.get();

  		if(currentActiveTab == '') {
  			return true;
  		}

		var repositoriesArray = Session.get('repositoryFullNameWith'+ Template.instance().currentRepositoryDataTab.get() +'Cached');
		return _.contains(repositoriesArray, this.full_name);	
  	}, 
  	getLanguageInDevIconsFormat: function(language) {
  		if(!language) { 
  			return;
  		}

  		return language.toLowerCase().replace('++', 'plusplus').replace('#', 'sharp');
  	}
});

Template.repositoryItem.events({
	'click .repository-data-tab': function(event, template) {
		event.preventDefault();

		var dataTypeName = event.currentTarget.dataset.tabName;
		if(!dataTypeName) { 
			return;
		}

		if(template.currentRepositoryDataTabIs(dataTypeName)) { 
			template.currentRepositoryDataTab.set('');
		} else {
			var dataTypeFunctions = template.dataTypeFunctionsMap[dataTypeName];
			if(!dataTypeFunctions) { 
				return
			}

			var repositoryFullName = template.data.full_name;

			if(!dataTypeFunctions.isCached(repositoryFullName)) {
				dataTypeFunctions.getData(repositoryFullName, dataTypeFunctions.cache);
			}

			template.currentRepositoryDataTab.set(dataTypeName);
		}
		
	}
});