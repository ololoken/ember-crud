// App.ApplicationAdapter = DS.FixtureAdapter;

// in this demo we are using the LocalStorageAdapter to persist data
App.ApplicationAdapter = DS.RESTAdapter.extend(new function () {
  "use strict";
  var cache = {
    contents: localStorage,

    get: function (key) {
      var res = cache.contents.getItem(key);
      try { res = res && JSON.parse(res) } catch (ex) { }
      return res;
    },

    getDataUrl: function (key) {
      return URL.createObjectURL(new Blob([this.get(key).data], { type: 'application/json' }))
    },

    has: function (key) {
      return !!cache.contents.getItem(key);
    },

    set: function (key, data) {
      cache.contents.setItem(key, JSON.stringify({
        'time': Date.now(),
        'data': JSON.stringify(data)
      }));
      return data;
    },

    remove: function (key) {
      return this.contents.removeItem(key);
    },

    clear: function () {
      for (var i = 0, len = localStorage.length; i < len; ++i) {
        var key = this.contents.key(i);
        if (key.indexOf("/api/") >= 0) {
          this.contents.removeItem(key);
        }
      }
      this.set('cache-post-que', []);
    }
  };

  return {
    'host': 'http://localhost:3000',
    'namespace': '',
    'cache': cache,
    'onLine': true,
    'ajaxOptions': function (url, type, opts) {
      return Object.assign(this._super(url, type, opts), {
        complete: function (xhr, status) {
          if ('success' == status) {
            //put/update data in cache
            cache.set(url, xhr.responseJSON);
          }
        }
      });
    },
    'ajax': function (url, method, opts) {
      switch (method) {
        case 'GET':
          if ((!navigator.onLine || !window._onLine || !App.get('onLine')) && cache.has(url)) {
            opts.origUrl = opts.url;
            url = opts.url = cache.getDataUrl(opts.origUrl);
          }
          break;
        case 'PUT':
        case 'POST':
          //todo: add caching of write requests
          if (!navigator.onLine || !window._onLine || !App.get('onLine')) {
            var postQue = cache.get('cache-post-que'), que;
            try {que = JSON.parse(postQue.data)} catch (ex) {}
            if (!Array.isArray(que)) {
              que = [];
            }
            que.push(opts);
            cache.set('cache-post-que', que);
          }
          break;
      }
      return this._super(url, method, opts);
    },
    'handleResponse': function (status, headers, payload, requestData) {

      //console.log(this, status, headers, payload, requestData);

      return this._super(status, headers, payload, requestData);
    }
  }
});
//DS.LSAdapter;