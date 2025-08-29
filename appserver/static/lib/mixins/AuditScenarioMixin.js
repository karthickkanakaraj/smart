//# sourceURL=lib/mixins/AuditScenarioMixin.js

define(["underscore", "jquery", "../app/SMART/lib/helpers/ajax"], function (
  _,
  $,
  ajax
) {
  const StatusTypes = {
    CREATED: "Created",
    UPDATED: "Updated",
    DELETED: "Deleted",
  };

  return {
    onAddSuccess: function (key, record) {
      this.postAudit(StatusTypes.CREATED, key, record);
    },

    onUpdateSuccess: function (key, record) {
      this.postAudit(StatusTypes.UPDATED, key, record);
    },

    onDeleteSuccess: function (key) {
      this.postAudit(StatusTypes.DELETED, key);
    },

    postAudit: function (status, key, record) {
      if (!this.collections) throw "'collections' option is undefined";
      if (this.collections.length == 0) throw "'collections' option is empty";

      // get current audit collection
      const { audit: collection } = this.collections.find(
        ({ id }) => id == this.collectionID
      );

      const Audit = this.buildAudit(status, key, record);

      return ajax.postSMARTCollection(collection, null, Audit);
    },

    buildAudit: function (action, key, record) {
      const Audit = {
        PropertyID: this.collectionID,
        ScenarioKey: key,
        Action: action,
        FieldValues: `ScenarioTypeCode=${this.scenarioTypeCode}`,
        LastUpdated:
          // timestamp
          ((date = new Date().toLocaleString("en-GB")),
          (day = date.substr(0, 2)),
          (month = date.substr(3, 2)),
          (year = date.substr(6, 4)),
          (time = date.substr(12, 8)),
          `${day}/${month}/${year} ${time}`),
        // active splunk user
        LastUpdatedBy: Splunk.util.getConfigValue("USERNAME"),
      };

      if (!record) return Audit;

      var GameTypeList = `GameTypeList=${record.GameTypeList}`;
          GameTypeList = GameTypeList.replace(/,/g,"_");
          
      Audit.FieldValues = [
        Audit.FieldValues,
        `PropertyID=${record.PropertyID}`,
        `Reason=${record.Reason}`,
        `AreaAuditedCode=${record.AreaAuditedCode}`,
        `CustomerID=${record.CustomerID}`,
        `EmployeeID=${record.EmployeeID}`,
        `PitListCode=${record.PitListCode}`,
        GameTypeList,
        `Comments=${record.Comments}`,
        `Priority=${record.Priority}`,
        `ExpiryDate=${record.ExpiryDate}`,
        `Active=${record.Active}`,
        `MonitoringType=${record.MonitoringType}`,
        `AmountMin=${record.AmountMin}`,
        `AmountMax=${record.AmountMax}`,
        `Section=${record.Section}`,
        `BankMin=${record.BankMin}`,
        `BankMax=${record.BankMax}`,
        `MachineMin=${record.MachineMin}`,
        `MachineMax=${record.MachineMax}`,
        `WinLossAmtMin=${record.WinLossAmtMin }`,
        `WinLossAmtMax=${record.WinLossAmtMax }`,
        `MinBetMin=${record.MinBetMin }`,    
        `MinBetMax=${record.MinBetMax }`,    
        `AvgBetMin=${record.AvgBetMin }`,    
        `AvgBetMax=${record.AvgBetMax }`,    
      ].join(",");
      return Audit;
    },
  };
});
