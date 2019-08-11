"use strict";

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
function EventName(name) {
  return `JUGLANS::${name}`;
}

const EventsStarting = 'EventsStarting';
const EventsRunning = 'EventsRunning';
const EventsShutdown = 'EventsShutdown';
const events = {
  [EventsStarting]: EventName(1 << 49),
  [EventsRunning]: EventName(1 << 50),
  [EventsShutdown]: EventName(1 << 51)
};
module.exports = events;