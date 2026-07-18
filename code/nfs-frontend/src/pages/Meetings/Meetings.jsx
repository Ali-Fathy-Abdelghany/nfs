import React from 'react';
import LiveKitMeeting from '../../components/LiveKitMeeting/LiveKitMeeting';

/**
 * Doctor video call powered by LiveKit.
 * Rendered without the app Sidebar (fullscreen call shell).
 */
function Meetings() {
  return <LiveKitMeeting role="doctor" />;
}

export default Meetings;
