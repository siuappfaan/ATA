/*
  ATA chapter data.
  Chapter: { n: number, t: title, a?: ['737'|'787'] (only these aircraft), s: sub-chapters }
  Sub-chapter: [number, title, only?]  ('737' or '787' limits it to that aircraft)
  Sub-chapters follow ATA 100 / Boeing AMM numbering at the "ten" level.
*/
(function () {
  const D = [
    { n: '05', t: 'Time Limits/Maintenance Checks', s: [['00', 'General'], ['10', 'Time Limits'], ['20', 'Scheduled Maintenance Checks'], ['50', 'Unscheduled Maintenance Checks']] },
    { n: '06', t: 'Dimensions and Areas', s: [['00', 'General']] },
    { n: '07', t: 'Lifting and Shoring', s: [['00', 'General'], ['10', 'Jacking'], ['20', 'Shoring']] },
    { n: '08', t: 'Leveling and Weighing', s: [['00', 'General'], ['10', 'Weighing and Balancing'], ['20', 'Leveling']] },
    { n: '09', t: 'Towing and Taxiing', s: [['00', 'General'], ['10', 'Towing'], ['20', 'Taxiing']] },
    { n: '10', t: 'Parking, Mooring, Storage and Return to Service', s: [['00', 'General'], ['10', 'Parking/Mooring'], ['20', 'Return to Service']] },
    { n: '11', t: 'Placards and Markings', s: [['00', 'General'], ['10', 'Exterior Color Schemes and Markings'], ['20', 'Exterior Placards and Markings'], ['30', 'Interior Placards and Markings']] },
    { n: '12', t: 'Servicing', s: [['00', 'General'], ['10', 'Replenishing'], ['20', 'Scheduled Servicing'], ['30', 'Unscheduled Servicing']] },
    { n: '20', t: 'Standard Practices - Airframe', s: [['00', 'General']] },
    { n: '21', t: 'Air Conditioning', s: [['00', 'General'], ['10', 'Compression', '787'], ['20', 'Distribution'], ['30', 'Pressurization Control'], ['40', 'Heating'], ['50', 'Cooling'], ['60', 'Temperature Control']] },
    { n: '22', t: 'Auto Flight', s: [['00', 'General'], ['10', 'Autopilot'], ['30', 'Autothrottle']] },
    { n: '23', t: 'Communications', s: [['00', 'General'], ['10', 'Speech Communications'], ['15', 'Satellite Communications', '787'], ['20', 'Data Transmission and Automatic Calling'], ['30', 'Passenger Address, Entertainment and Comfort'], ['40', 'Interphone'], ['50', 'Audio Integrating'], ['60', 'Static Discharging'], ['70', 'Audio and Video Monitoring']] },
    { n: '24', t: 'Electrical Power', s: [['00', 'General'], ['10', 'Generator Drive', '737'], ['20', 'AC Generation'], ['30', 'DC Generation'], ['40', 'External Power'], ['50', 'AC Electrical Load Distribution'], ['60', 'DC Electrical Load Distribution']] },
    { n: '25', t: 'Equipment/Furnishings', s: [['00', 'General'], ['10', 'Flight Compartment'], ['20', 'Passenger Compartment'], ['30', 'Buffet/Galley'], ['40', 'Lavatories'], ['50', 'Cargo Compartments'], ['60', 'Emergency Equipment'], ['70', 'Accessory Compartments'], ['80', 'Insulation']] },
    { n: '26', t: 'Fire Protection', s: [['00', 'General'], ['10', 'Detection'], ['20', 'Extinguishing']] },
    { n: '27', t: 'Flight Controls', s: [['00', 'General'], ['10', 'Aileron and Tab'], ['20', 'Rudder and Tab'], ['30', 'Elevator and Tab'], ['40', 'Horizontal Stabilizer'], ['50', 'Flaps'], ['60', 'Spoiler and Drag Devices'], ['80', 'Lift Augmenting']] },
    { n: '28', t: 'Fuel', s: [['00', 'General'], ['10', 'Storage'], ['20', 'Distribution'], ['40', 'Indicating']] },
    { n: '29', t: 'Hydraulic Power', s: [['00', 'General'], ['10', 'Main'], ['20', 'Auxiliary'], ['30', 'Indicating']] },
    { n: '30', t: 'Ice and Rain Protection', s: [['00', 'General'], ['10', 'Airfoil'], ['20', 'Air Intakes'], ['30', 'Pitot and Static'], ['40', 'Windows, Windshields and Doors'], ['70', 'Water Lines', '737'], ['80', 'Detection', '787']] },
    { n: '31', t: 'Indicating/Recording Systems', s: [['00', 'General'], ['10', 'Instrument and Control Panels'], ['20', 'Independent Instruments'], ['30', 'Recorders'], ['40', 'Central Computers'], ['50', 'Central Warning Systems'], ['60', 'Central Display Systems']] },
    { n: '32', t: 'Landing Gear', s: [['00', 'General'], ['10', 'Main Gear and Doors'], ['20', 'Nose Gear and Doors'], ['30', 'Extension and Retraction'], ['40', 'Wheels and Brakes'], ['50', 'Steering'], ['60', 'Position and Warning']] },
    { n: '33', t: 'Lights', s: [['00', 'General'], ['10', 'Flight Compartment'], ['20', 'Passenger Compartment'], ['30', 'Cargo and Service Compartments'], ['40', 'Exterior'], ['50', 'Emergency Lighting']] },
    { n: '34', t: 'Navigation', s: [['00', 'General'], ['10', 'Flight Environment Data'], ['20', 'Attitude and Direction'], ['30', 'Landing and Taxiing Aids'], ['40', 'Independent Position Determining'], ['50', 'Dependent Position Determining'], ['60', 'Flight Management Computing']] },
    { n: '35', t: 'Oxygen', s: [['00', 'General'], ['10', 'Crew Oxygen'], ['20', 'Passenger Oxygen'], ['30', 'Portable Oxygen']] },
    { n: '36', t: 'Pneumatic', s: [['00', 'General'], ['10', 'Distribution'], ['20', 'Indicating', '737']] },
    { n: '38', t: 'Water/Waste', s: [['00', 'General'], ['10', 'Potable'], ['30', 'Waste Disposal']] },
    { n: '42', t: 'Integrated Modular Avionics', a: ['787'], s: [['00', 'General']] },
    { n: '44', t: 'Cabin Systems', a: ['787'], s: [['00', 'General'], ['10', 'Cabin Core System'], ['20', 'Inflight Entertainment System'], ['30', 'External Communication System'], ['40', 'Cabin Mass Memory System'], ['50', 'Cabin Monitoring System'], ['60', 'Miscellaneous Cabin System']] },
    { n: '45', t: 'Central Maintenance System', s: [['00', 'General'], ['10', 'Central Maintenance Computer']] },
    { n: '46', t: 'Information Systems', s: [['00', 'General'], ['10', 'Airplane General Information Systems', '787'], ['20', 'Flight Deck Information Systems'], ['30', 'Maintenance Information Systems', '787'], ['40', 'Passenger Cabin Information Systems', '787'], ['50', 'Miscellaneous Information Systems', '787']] },
    { n: '47', t: 'Nitrogen Generation System', a: ['787'], s: [['00', 'General'], ['10', 'Nitrogen Generation'], ['20', 'Distribution']] },
    { n: '49', t: 'Airborne Auxiliary Power', s: [['00', 'General'], ['10', 'Power Plant'], ['20', 'Engine'], ['30', 'Engine Fuel and Control'], ['40', 'Ignition and Starting'], ['50', 'Air'], ['60', 'Engine Controls'], ['70', 'Indicating'], ['80', 'Exhaust'], ['90', 'Oil']] },
    { n: '50', t: 'Cargo and Accessory Compartments', a: ['787'], s: [['00', 'General']] },
    { n: '51', t: 'Standard Practices and Structures - General', s: [['00', 'General'], ['10', 'Investigation, Cleanup and Aerodynamic Smoothness'], ['20', 'Processes'], ['30', 'Materials'], ['40', 'Fasteners'], ['50', 'Support of Airplane for Repair and Alignment Check Procedures'], ['60', 'Control Surface Balancing'], ['70', 'Repairs']] },
    { n: '52', t: 'Doors', s: [['00', 'General'], ['10', 'Passenger/Crew'], ['20', 'Emergency Exit'], ['30', 'Cargo'], ['40', 'Service and Miscellaneous'], ['50', 'Fixed Interior'], ['60', 'Entrance Stairs', '737'], ['70', 'Door Warning'], ['80', 'Landing Gear']] },
    { n: '53', t: 'Fuselage', s: [['00', 'General'], ['10', 'Main Frame'], ['20', 'Auxiliary Structure'], ['30', 'Plates and Skins'], ['40', 'Attach Fittings'], ['50', 'Aerodynamic Fairings']] },
    { n: '54', t: 'Nacelles/Pylons', s: [['00', 'General'], ['10', 'Main Frame'], ['20', 'Auxiliary Structure'], ['30', 'Plates and Skins'], ['40', 'Attach Fittings'], ['50', 'Fillets and Fairings']] },
    { n: '55', t: 'Stabilizers', s: [['00', 'General'], ['10', 'Horizontal Stabilizer'], ['20', 'Elevator'], ['30', 'Vertical Stabilizer'], ['40', 'Rudder']] },
    { n: '56', t: 'Windows', s: [['00', 'General'], ['10', 'Flight Compartment'], ['20', 'Cabin'], ['30', 'Door'], ['40', 'Inspection and Observation']] },
    { n: '57', t: 'Wings', s: [['00', 'General'], ['10', 'Main Frame'], ['20', 'Auxiliary Structure'], ['30', 'Plates and Skins'], ['40', 'Attach Fittings'], ['50', 'Flight Surfaces']] },
    { n: '71', t: 'Power Plant', s: [['00', 'General'], ['10', 'Cowling'], ['20', 'Mounts'], ['30', 'Fireseals'], ['50', 'Electrical Harness'], ['60', 'Air Intakes'], ['70', 'Engine Drains']] },
    { n: '72', t: 'Engine', s: [['00', 'General'], ['20', 'Air Inlet Section'], ['30', 'Compressor Section'], ['40', 'Combustion Section'], ['50', 'Turbine Section'], ['60', 'Accessory Drives']] },
    { n: '73', t: 'Engine Fuel and Control', s: [['00', 'General'], ['10', 'Distribution'], ['20', 'Controlling'], ['30', 'Indicating']] },
    { n: '74', t: 'Ignition', s: [['00', 'General'], ['10', 'Electrical Power Supply'], ['20', 'Distribution'], ['30', 'Switching']] },
    { n: '75', t: 'Air', s: [['00', 'General'], ['10', 'Engine Anti-Icing'], ['20', 'Cooling'], ['30', 'Compressor Control'], ['40', 'Indicating']] },
    { n: '76', t: 'Engine Controls', s: [['00', 'General'], ['10', 'Power Control'], ['20', 'Emergency Shutdown']] },
    { n: '77', t: 'Engine Indicating', s: [['00', 'General'], ['10', 'Power'], ['20', 'Temperature'], ['30', 'Analyzers'], ['40', 'Integrated Engine Instrument Systems']] },
    { n: '78', t: 'Exhaust', s: [['00', 'General'], ['10', 'Collector/Nozzle'], ['30', 'Thrust Reverser']] },
    { n: '79', t: 'Oil', s: [['00', 'General'], ['10', 'Storage'], ['20', 'Distribution'], ['30', 'Indicating']] },
    { n: '80', t: 'Starting', s: [['00', 'General'], ['10', 'Cranking']] }
  ];

  window.getChapters = function (ac) {
    return D.filter(function (c) { return !c.a || c.a.indexOf(ac) > -1; }).map(function (c) {
      return {
        num: c.n,
        title: c.t,
        subs: c.s.filter(function (s) { return !s[2] || s[2] === ac; }).map(function (s) {
          return { num: c.n + '-' + s[0], title: s[1] };
        })
      };
    });
  };
})();
