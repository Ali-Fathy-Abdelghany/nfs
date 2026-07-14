import React from 'react';
import VideoCallPrototype from '../../components/VideoCallPrototype/VideoCallPrototype';

/**
 * Doctor video call prototype.
 * Rendered without the app Sidebar (fullscreen call shell).
 */
function Meetings() {
  return (
    <VideoCallPrototype
      role="doctor"
      remoteName="المريض"
      localLabel="أنت (بث مباشر)"
      exitPath="/doctor/sessions"
    />
  );
}

export default Meetings;
