define([], function () {
  const Properties = [
    { id: 1, code: "MEL", name: "Melbourne", roles: ['mel_smart_user','mel_smart_alert_post','mel_smart_scenario_edit'] },
    { id: 3, code: "SYD", name: "Sydney",    roles: ['syd_smart_user','syd_smart_alert_post','syd_smart_scenario_edit'] },
  ];

  // alternative lookup
  const PropertyInfo = Properties.reduce(
    (acc, { id, code, name, role }) => {
      acc.IDs[code] = id;
      acc.Codes[id] = code;
      acc.Names[id] = name;
      acc.Roles[id] = role;
      return acc;
    },
    { IDs: {}, Codes: {}, Names: {}, Roles: {} }
  );

  return {
    Properties,
    PropertyInfo,
  };
});