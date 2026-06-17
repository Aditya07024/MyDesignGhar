import { useSearchParams, useNavigate } from "react-router-dom";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const url = searchParams.get("url");

  if (!token || !url) {
    return (
      <div className="call-error-container">
        <div className="call-error-card glass-card">
          <h2>Connection Failed</h2>
          <p>Missing video connection token or LiveKit server URL. Please try joining the call again from your dashboard.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        <style>{`
          .call-error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0b0c10;
            padding: 20px;
          }
          .call-error-card {
            max-width: 480px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }
          .call-error-card h2 {
            color: var(--error);
            font-size: 24px;
            margin-bottom: 16px;
          }
          .call-error-card p {
            color: var(--text-muted);
            margin-bottom: 24px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="livekit-call-page">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        connect={true}
        onDisconnected={() => {
          navigate(-1);
        }}
        data-lk-theme="default"
        style={{ height: "100vh", width: "100vw" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
      <style>{`
        .livekit-call-page {
          height: 100vh;
          width: 100vw;
          background-color: #111318;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
