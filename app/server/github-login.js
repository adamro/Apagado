ServiceConfiguration.configurations.remove({
  service: "github"
});

ServiceConfiguration.configurations.insert({
  service: "github",
  clientId: "bf2b1f2b9a8d5ea1929d",
  secret: "3755fd19fd1e38dcee83c8bd40b3862830e2306a"
});

Accounts.onCreateUser(function(options, user) {
  if (options.profile) {
    user.profile = options.profile;
  }

  user.profile.github = {};
  user.profile.github.accessToken = user.services.github.accessToken;
  user.profile.github.email = user.services.github.email;
  user.profile.github.username = user.services.github.username;

  return user;
});