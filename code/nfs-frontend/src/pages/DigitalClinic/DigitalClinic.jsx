import React from 'react';
import VideoCallPrototype from '../../components/VideoCallPrototype/VideoCallPrototype';

/** Patient digital clinic — prototype video UI (no real media). */
function DigitalClinic() {
  return (
    <VideoCallPrototype
      role="patient"
      remoteName="د. مريم"
      localLabel="أنت"
      exitPath="/sessions"
    />
  );
}

export default DigitalClinic;
