// the applicationRoute is the highest route possible
// here we use it to store some global events for our app
App.ApplicationRoute = Em.Route.extend({

  actions: {
    onlineSwitch: function () {
        App.set('onLine', !App.get('onLine'));
    },
    goBack: function () {
      this.transitionTo('users');
    }
  }
});