require.config({
  paths: {
    helpers: "../app/SMART/lib/helpers/",
  },
});

define(["helpers/constants"], function ({
  Properties,
}) {
  return {
    call: function (type, url, data) {
      const isPostOrDeleteOperation = type == "POST" || type == "DELETE";

      jQuery.ajax({
        type,
        url,
        data: JSON.stringify(data),
        contentType: isPostOrDeleteOperation ? "application/json" : undefined,
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
          alert(`Error reaching:\n${this.url}\n\nSee console for details.`);
          console.error(`AJAX Error: ${errorThrown}`, this);
        },
        success: function (results) {
          this.results = results;
        }.bind(this),
      });

      return this.results;
    },

    GET: function (...args) {
      return this.call("GET", ...args);
    },

    POST: function (...args) {
      return this.call("POST", ...args);
    },

    DELETE: function (...args) {
      return this.call("DELETE", ...args);
    },

    getAuthenticationContext: function () {
      const url = Splunk.util.make_url(
        "splunkd/__raw/services",
        "authentication",
        "current-context",
        "?output_mode=json"
      );
      return this.GET(url);
    },

    getActiveUserRoles: function () {
      const authContextReponse = this.getAuthenticationContext();
      const roles = authContextReponse.entry[0].content.roles;
      return roles;
    },

    getFunctions: function () {
        
      const activeRoles = this.getActiveUserRoles();
        
      funcList = [];
      for (role of activeRoles) {   
         prop = (role.match("mel_") ? 1 : 3)
         func = role.replace("mel_smart_","")
         func = func.replace("syd_smart_","")
         func = prop + "_" + func ;
         funcList.push(func);
      }
      
      return funcList;
    },
    
    getActiveProperties: function () {
      const activeRoles = this.getActiveUserRoles();

      var activeProperties = [];
      for (prop of Properties) {
         prop_loop: 
         for (role of prop.roles) { 
            for (act of activeRoles) {         
               if (role == act) {
                  activeProperties.push(prop);
                  break prop_loop;
               }  
      } } }
      
      return activeProperties;
    },

    makeCollectionURL: function (
      collectionOwner,
      appName,
      collectionName,
      key,
      query,
      SADquery
    ) {
      const pathComponents = [
        "splunkd/__raw/servicesNS",
        collectionOwner,
        appName,
        "storage/collections/data",
        collectionName,
      ];

      if (key) pathComponents.push(key);

      const queryComponents = [`output_mode=json`];

      if (query) {
        const encodedQuery = encodeURIComponent(JSON.stringify(query));

        queryComponents.push(`query=${encodedQuery}`);
      }

      if (SADquery) {
         const encodedQuery = encodeURIComponent(JSON.stringify(SADquery));
         
         queryComponents.push(`query=${encodedQuery}`);
      }
  
      const queryString = `?${queryComponents.join("&")}`;

      return Splunk.util.make_url(...pathComponents, queryString);
    },

    getCollection: function (collectionOwner, appName, collectionName, key) {
      const collectionURL = this.makeCollectionURL(
        collectionOwner,
        appName,
        collectionName,
        key
      );
      return this.GET(collectionURL);
    },

    postCollection: function (
      collectionOwner,
      appName,
      collectionName,
      key,
      data
    ) {
      const collectionURL = this.makeCollectionURL(
        collectionOwner,
        appName,
        collectionName,
        key
      );

      return this.POST(collectionURL, data);
    },

    deleteCollection: function (collectionOwner, appName, collectionName, key) {
      const collectionURL = this.makeCollectionURL(
        collectionOwner,
        appName,
        collectionName,
        key
      );

      return this.DELETE(collectionURL);
    },

    queryCollection: function (
      collectionOwner,
      appName,
      collectionName,
      query
    ) {
      const collectionURL = this.makeCollectionURL(
        collectionOwner,
        appName,
        collectionName,
        undefined,
        query,
        undefined
      );
      return this.GET(collectionURL);
    },

    checkUniqueCollectionObject: function (collectionName, matchObject) {
      const matchObjectFn = (matchObj) => (obj) =>
        Object.keys(matchObj).every((key) => obj[key] === matchObj[key]);

      const hasMatch = this.getCollection(collectionName).some(
        matchObjectFn(matchObject)
      );

      return !hasMatch;
    },

    makeSMARTCollectionURL: function (collectionName) {
      return this.makeCollectionURL("nobody", "SMART", collectionName);
    },

    makeSMARTQueryCollectionURL: function (collectionName, query) {
      // see: https://docs.splunk.com/Documentation/Splunk/8.2.2/RESTREF/RESTkvstore
      return this.makeCollectionURL(
        "nobody",
        "SMART",
        collectionName,
        undefined,
        query,
        undefined
      );
    },

    makeSADQueryCollectionURL: function (collectionName, query) {
        
      // see: https://docs.splunk.com/Documentation/Splunk/8.2.2/RESTREF/RESTkvstore
      return this.makeCollectionURL(
        "nobody",
        "SMART",
        collectionName,
        undefined,
        undefined,
        query
      );
    },

    getSMARTCollection: function (collectionName, key) {
      return this.getCollection("nobody", "SMART", collectionName, key);
    },

    postSMARTCollection: function (collectionName, key, data) {
      return this.postCollection("nobody", "SMART", collectionName, key, data);
    },

    deleteSMARTCollection: function (collectionName, key) {
      return this.deleteCollection("nobody", "SMART", collectionName, key);
    },

    querySMARTCollection: function (collectionName, query) {
      // see: https://docs.splunk.com/Documentation/Splunk/8.2.2/RESTREF/RESTkvstore
      return this.queryCollection("nobody", "SMART", collectionName, query);
    },

    isUniqueSMARTRecord: function (collectionName, record, excludeKey = true) {
      const query = record;

      // exclude results that match '_key'
      if (record._key && excludeKey) query._key = { $ne: record._key };

      const results = this.querySMARTCollection(collectionName, query);

      const isUnique = results.length == 0;

      return isUnique;
    },

    queryCrownConfig: function (query) {
      return this.queryCollection("nobody", "crownconf", "CrownConfig", query);
    },

    queryCustomers: function (query, prop) {
      
      switch (prop) {
        case "1":
          prop = "MEL";
          break;
        case "3":
          prop = "SYD";
          break;
          
        default:
          prop = "MEL";        
      }                 

      var customerCollection = this.queryCrownConfig({
        App: "SMART",
        Name: "customerValidationAPI_" + prop,
      });
      
      var app = "";
      var collectionName = "";      

      if (customerCollection.length != 0) {
         customerCollection = customerCollection[0].Value;
         var { [0]: app, [4]: collectionName } = customerCollection.split("/");
      }
      else
         console.log("collection does not exist : customerValidationAPI_" + prop); 

      return this.queryCollection("nobody", app, collectionName, query);
    },

    queryEmployees: function (query, prop) {
        
      switch (prop) {
        case "1":
          prop = "MEL";
          break;
        case "3":
          prop = "SYD";
          break;
          
        default:
          prop = "MEL";        
      }  
      
      var employeeCollection = this.queryCrownConfig({
        App: "SMART",
        Name: "employeeValidationAPI_" + prop,
      });

      var app = "";
      var collectionName = "";

      if (employeeCollection.length != 0) {
         employeeCollection = employeeCollection[0].Value;
         var { [0]: app, [4]: collectionName } = employeeCollection.split("/");
      }
      else
         console.log("collection does not exist : employeeValidationAPI_" + prop);          

      return this.queryCollection("nobody", app, collectionName, query);
    },
  };
});
