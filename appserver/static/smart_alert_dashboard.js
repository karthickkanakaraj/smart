//# sourceURL=smart_alert_dashboard.js

require.config({
  paths: {
    datatables: "../app/SMART/lib/DataTables/js/jquery.dataTables",
    bootstrapDataTables: "../app/SMART/lib/DataTables/js/dataTables.bootstrap",
    text: "../app/SMART/lib/text",
    helpers: "../app/SMART/lib/helpers/",
    Cocktail: "../app/SMART/lib/Cocktail/Cocktail-0.5.15.min",
    mixins: "../app/SMART/lib/mixins",
  },
  shim: {
    bootstrapDataTables: {
      deps: ["datatables"],
    },
  },
});

require([
  "underscore",
  "jquery",
  "splunkjs/mvc/simplesplunkview",
  "text!../app/SMART/smart_alert_dashboard.html",
  "helpers/ajax",
  "Cocktail",
  "mixins/MultipleCollectionsMixin",
  "mixins/PropertyMixin",
  "mixins/DataTablesMixin",
  "mixins/DataTablesSuppressMissingValueAlertMixin",
  "mixins/DataTablesFixWidthMixin",
], function (
  _,
  $,
  SimpleSplunkView,
  AlertTemplate,
  ajax,
  Cocktail,
  MultipleCollectionsMixin,
  PropertyMixin,
  DataTablesMixin,
  DataTablesSuppressMissingValueAlertMixin,
  DataTablesFixWidthMixin
) {
  const AlertsBrowse = SimpleSplunkView.extend({
    className: "AlertsBrowse",

    events: {
      "shown .iTrakRef-modal": "focusView",

      "change #propID":       "filterChange",
      "change #checkNew":     "filterChange",
      "change #checkPost":    "filterChange",
      "change #checkDeleted": "filterChange",
      "change #daysRange":    "filterChange",

      "click .refresh": "doRefresh",
      "click .action1": "doAction",
      "click .action2": "doAction",
    },

    defaults: {
      collection_owner: "nobody",
    },

    initialize: function () {
      this.options = _.extend({}, this.defaults, this.options);

      this.collection_owner = this.options.collection_owner;
      this.app = this.options.app;
      this.collection = this.options.collection;

      this.Alerts = null;
      this.editmode = "";

      this.newStatus     = true;
      this.postStatus    = false;
      this.deletedStatus = false;

      // Initial date range is 2 days (48 hrs)
      this.endDate   = new Date();
      this.startDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
      this.daysRange = 2;

      this.query = {};

      this.updateKey = "";
      this.updateStatus = "";
      this.updateLabel = "";

      this.currentUser = Splunk.util.getConfigValue("USERNAME");
      
      const activeRoles = ajax.getActiveUserRoles();
      var userRoles = "";
      for (role of activeRoles)    
         var userRoles = userRoles + role + ",";

      userRoles = userRoles.substr(0,userRoles.length - 1); 
      console.log("User Roles: " + userRoles);
    },

    doRefresh: function () {
         
      this.startDate = new Date(Date.now() - (this.daysRange * 24) * 60 * 60 * 1000);
      this.endDate   = new Date(Date.now());

      this.createQueryString();
  
      this.renderDateRangeLabel();
      
      const url = ajax.makeSADQueryCollectionURL(this.collection, this.query); 
      
      this.reloadDataTables(url);
    },

    focusView: function () {
      $("#iTrakRef", this.$el).focus();
    },
    
    filterChange: function (event) {
      switch ($(event.target).attr("id")) {
        case "propID":
          this.onPropertyChange();
          break;

        case "checkNew":
          this.newStatus = $("#checkNew")[0].checked;
          this.dataTable.draw();
          break;

        case "checkPost":
          this.postStatus = $("#checkPost")[0].checked;
          this.dataTable.draw();
          break;

        case "checkDeleted":
          this.deletedStatus = $("#checkDeleted")[0].checked;
          this.dataTable.draw();
          break;

        case "daysRange":
          this.daysRange = $("#daysRange").val();
          this.doRefresh();
          break;
          
        default:
          console.log("Unknown filterChange() Event");
      }
    },

    focusView: function () {
      if (this.editmode == "add") $("#CustomerID", this.$el).focus();
      else $("#Reason", this.$el).focus();
    },
    
    doAction: function (event) {
      this.updateKey = $(event.target).data("key");
      this.updateStatus = $(event.target).data("status");
      this.updateLabel = $(event.target).data("label");

      this.doSaveNewStatus();
    },

    doSaveNewStatus: function (event) {
      Alert = this.getAlert(this.updateKey);

      switch (this.updateStatus) {
        case "New":
          if (this.updateLabel == "Post")
            Alert.Status = "Posting";
          else
            Alert.Status = "Deleted";
          break;

        case "Deleted":
          Alert.Status = "New";
          break;

        default:
          console.log("Unknown Status");
      }

      date = new Date();
      var strDate = date.toLocaleString("en-GB");

      Alert.LastUpdatedBy = this.currentUser;
      Alert.LastUpdated =
        strDate.substr(0, 2) +
        "/" +
        strDate.substr(3, 2) +
        "/" +
        strDate.substr(6, 4) +
        " " +
        strDate.substr(12, 8);

      if (this.updateLabel == "Post")
        $(".iTrakRef-modal", this.$el).modal("hide");

      this.doUpdateToAlert(Alert, this.updateKey);
    },

    doUpdateToAlert: function (Alert, key) {
      var uri = Splunk.util.make_url(
        "/splunkd/__raw/servicesNS/" +
          this.collection_owner +
          "/" +
          this.app +
          "/storage/collections/data/" +
          this.collection +
          "/" +
          key +
          "?output_mode=json"
      );

      ajax.POST(uri, Alert);

      // Create Alert Audit

      var Audit = {};

      Audit.AlertKey = key;
      Audit.Status = Alert.Status;
      Audit.LastUpdatedBy = Alert.LastUpdatedBy;
      Audit.LastUpdated = Alert.LastUpdated;

      uri = Splunk.util.make_url(
        "/splunkd/__raw/servicesNS/" +
          this.collection_owner +
          "/" +
          this.app +
          "/storage/collections/data/" +
          collections.find(({ id }) => id == this.propertyID).audit +
          "?output_mode=json"
      );

      ajax.POST(uri, Audit);

      this.reloadDataTables();

      return true;
    },

    getAlerts: function () {
      this.Alerts = this.getAlert("");
      return this.Alerts;
    },

    getAlert: function (key) {
      var uri = null;

      uri = Splunk.util.make_url(
          "/splunkd/__raw/servicesNS/" +
            this.collection_owner +
            "/" +
            this.app +
            "/storage/collections/data/" +
            this.collection +
            "/" +
            key +
            "?output_mode=json");

      var results = ajax.GET(uri);

      if (key === "") {
        Alerts = [];

        for (var c = 0; c < results.length; c++) {
          Alerts.push(results[c]);
        }
      } else Alerts = results;

      return Alerts;
    },

    dateToYMDHMS: function (date) {
       
       const d = date.toLocaleString("en-GB");
       return (
         d.substr(6, 4) + "-" +
         d.substr(3, 2) + "-" +
         d.substr(0, 2) + " " +
         d.substr(12, 8));
    },

    createQueryString: function () {

       const dateStart = new Date(Date.now() - (this.daysRange * 24) * 60 * 60 * 1000); 
       const dateEnd   = new Date(Date.now());
  
       this.query = {AlertTime: { $gt: this.dateToYMDHMS(dateStart), $lt: this.dateToYMDHMS(dateEnd)},};
    },

    renderAlerts: function () {
      this.createQueryString();

      this.renderDateRangeLabel();

      // Make the tabs into tabs
      $("#tabs", this.$el).tab();
    },

    renderDateRangeLabel: function () {

      var sStart = this.startDate.toString().substr(0, 25);
      var sEnd   = this.endDate.toString().substr(0, 25);
      
      var searchTimeRange = "Alerts Between " + sStart + " and " + sEnd;
                            
      var lookup_list_template = $("#html-template", this.$el).text();

      $("#table-container", this.$el).html(
        _.template(lookup_list_template, { searchTimeRange })
      );
    },

    onPropertyChange() {
      this.propertyID = $("#propID")[0].value;
      this.toggleCollection(this.propertyID);
      const url = ajax.makeSADQueryCollectionURL(this.collection, this.query);
      this.reloadDataTables(url);
    },

    onRenderDataTables: function () {
      this.renderPropertyDropdown();

      $("#checkNew")[0].checked     = this.newStatus;
      $("#checkPost")[0].checked    = this.postStatus;
      $("#checkDeleted")[0].checked = this.deletedStatus;

      this.dataTable = $("#table").DataTable();

      const customFilters = (settings, data, dataIndex) => {
        const { newStatus, postStatus, deletedStatus } = this;
        const { [6]: statusStr } = data;

        if (!newStatus     && statusStr.includes("New")) return false;
        if (!postStatus    && statusStr.includes("Post")) return false;
        if (!deletedStatus && statusStr.includes("Deleted")) return false;

        return true;
      };

      $.fn.dataTable.ext.search.push(customFilters);
    },

    renderPropertyDropdown() {
      const toOptions = ({ id, name }) =>
        `<option value="${id}">${name}</option>`;

      const options = this.activeProperties.map(toOptions);

      $("#propID").append(options);
      this.propertyID = $("#propID")[0].value;
    },

    render: function () {
      this.$el.html(AlertTemplate);
      this.renderAlerts();
    },
  });

  const activeProperties = ajax.getActiveProperties();

  if (activeProperties.length == 0)
    alert("You do not have access to SMART data.\nPlease contact the Surveillance Team if you require access.");

  const collections = activeProperties.map(({ id, code }) => ({
    id,
    name: `SMART-${code}-Alerts`,
    audit: `SMART-${code}-AlertAudits`,
  }));
  
  // Create initial query for dataTable
  var dateStart = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  var dateEnd   = new Date(Date.now());
  d = dateStart.toLocaleString("en-GB");
  dateStart = d.substr(6, 4) + "-" +
     d.substr(3, 2) + "-" +
     d.substr(0, 2) + " " +
     d.substr(12, 8);
  d = dateEnd.toLocaleString("en-GB");
  dateEnd = d.substr(6, 4) + "-" +
     d.substr(3, 2) + "-" +
     d.substr(0, 2) + " " +
     d.substr(12, 8);

  const initQuery = {"AlertTime":{$gt: dateStart, $lt: dateEnd}};
  const userFunctions = ajax.getFunctions();

  const dataTables = [
    {
      elementId: "#table",
      options: {
        iDisplayLength: 20,
        bLengthChange: false,
        bStateSave: true,
        bInfo: true,
        bCustomFilter: true,
        aaSorting: [[0, "desc"]],
        searching: true,
        columns: [
          { title: "Alert Time" },
          { title: "Scenario Type" },
          { title: "Description" },
          { title: "Reason" },
          { title: "Location" },
          { title: "Game Code" },
          { title: "Status" },
          { title: "iTrak Reference" },
          { title: "Actions", bSortable: false, searchable: false },
          { title: "Last Updated" },
          { title: "Last Updated By" },
        ],
        ajax: {
          url: ajax.makeSADQueryCollectionURL(collections[0].name, initQuery), 
          dataSrc: (json) =>
            json.map((Alert) => {

              const alertTime = `${Alert.AlertTime} AEST`;

              const color = { 1: "#DC4E41", 2: "#F8BE34", 3: "#53A051" }[
                Alert.Priority
              ];
              const ScenarioTypeCode = `<div style="background-color: ${color} !important;">${Alert.ScenarioTypeCode}</div>`;

              const allowPost = Alert.PropertyID + "_alert_post"

              const noDeleteScenarios = ["CustomerWinLoss", "TableWinLoss"]
              
              if (userFunctions.includes(allowPost)) {
                 if (noDeleteScenarios.includes(Alert.ScenarioTypeCode)) {
                    NewActions = ["Post"];
                    DeletedActions = ""; } 
                 else {
                    NewActions = ["Delete", "Post"]; 
                    DeletedActions = ["Reopen"]; }
              }
              else {
                 NewActions = "";    
                 DeletedActions = ""; } 
                    
              const actionLabels =
                {
                  New:     NewActions,
                  Deleted: DeletedActions,
                }[Alert.Status] || [];
              const actionsFn = (label, i) =>
                `<a
                class="action${i + 1}"
                data-key="${Alert._key}"
                data-status="${Alert.Status}"
                data-label="${label}"
                >${label}</a>`;
              const actions = actionLabels.map(actionsFn).join(` | `);

              const year = Alert.LastUpdated.substr(6, 4);
              const month = Alert.LastUpdated.substr(3, 2);
              const day = Alert.LastUpdated.substr(0, 2);
              const time = Alert.LastUpdated.substr(11, 8);
              const updateTime = `${year}-${month}-${day} ${time} AEST`;

              return [
                alertTime,
                ScenarioTypeCode,
                Alert.Description,
                Alert.Reason,
                Alert.LocationCode,
                Alert.GameCode,
                Alert.Status,
                Alert.iTrakReference,
                actions,
                updateTime,
                Alert.LastUpdatedBy,
              ];
            }),
        },
      },
    },
  ];

  Cocktail.mixin(
    AlertsBrowse,
    MultipleCollectionsMixin,
    PropertyMixin,
    DataTablesMixin,
    DataTablesSuppressMissingValueAlertMixin,
    DataTablesFixWidthMixin
  );

  var AlertsBrowseView = new AlertsBrowse({
    el: $("#Alerts"),
    app: "SMART",
    collections,
    dataTables,
  });

  AlertsBrowseView.render();
});
