/**
 * WebRTC Calling Service for 1-to-1 Audio & Video Calls
 * Uses native browser RTCPeerConnection and WebSocket signaling.
 * Zero fake simulation: provides genuine peer tracks or honest diagnostic failure states.
 */

export type CallType = 'voice' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'error';

export interface CallSession {
  callId: string;
  conversationId: string;
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  callType: CallType;
  isOutgoing: boolean;
  state: CallState;
  startTime?: number;
  durationSeconds: number;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  diagnosticNotice?: string;
}

export type CallStateListener = (session: CallSession | null) => void;
export type StreamListener = (stream: MediaStream | null, isLocal: boolean) => void;

export class WebRTCCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentSession: CallSession | null = null;
  private stateListeners: Set<CallStateListener> = new Set();
  private streamListeners: Set<StreamListener> = new Set();
  private durationTimer: any = null;
  private sendSignalCallback: ((data: any) => void) | null = null;

  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {}

  public setSignalSender(sender: (data: any) => void) {
    this.sendSignalCallback = sender;
  }

  public subscribeState(listener: CallStateListener) {
    this.stateListeners.add(listener);
    listener(this.currentSession);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public subscribeStreams(listener: StreamListener) {
    this.streamListeners.add(listener);
    if (this.localStream) listener(this.localStream, true);
    if (this.remoteStream) listener(this.remoteStream, false);
    return () => {
      this.streamListeners.delete(listener);
    };
  }

  private notifyState() {
    for (const listener of this.stateListeners) {
      listener(this.currentSession ? { ...this.currentSession } : null);
    }
  }

  private notifyStreams() {
    for (const listener of this.streamListeners) {
      listener(this.localStream, true);
      listener(this.remoteStream, false);
    }
  }

  /**
   * Starts an outgoing audio or video call to a target peer
   */
  public async startCall(params: {
    conversationId: string;
    peerId: string;
    peerName: string;
    peerAvatar?: string;
    callType: CallType;
  }) {
    if (this.currentSession && this.currentSession.state !== 'ended' && this.currentSession.state !== 'idle') {
      console.warn('Call already in progress');
      return;
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.currentSession = {
      callId,
      conversationId: params.conversationId,
      peerId: params.peerId,
      peerName: params.peerName,
      peerAvatar: params.peerAvatar,
      callType: params.callType,
      isOutgoing: true,
      state: 'calling',
      durationSeconds: 0,
      isAudioMuted: false,
      isVideoMuted: false,
      diagnosticNotice: 'Accessing local media devices...'
    };
    this.notifyState();

    try {
      // 1. Acquire media devices
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: params.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      this.notifyStreams();

      // 2. Initialize RTCPeerConnection
      this.createPeerConnection(params.peerId);

      // 3. Add tracks
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // 4. Create and dispatch SDP offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      this.currentSession.state = 'calling';
      this.currentSession.diagnosticNotice = 'Ringing peer...';
      this.notifyState();

      this.sendSignal({
        recipientId: params.peerId,
        callType: params.callType,
        signalData: {
          type: 'offer',
          callId,
          conversationId: params.conversationId,
          sdp: offer,
          callType: params.callType
        }
      });
    } catch (err: any) {
      console.error('Failed to initiate call:', err);
      let notice = 'Could not access media devices.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        notice = 'Microphone/Camera permission was denied in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        notice = 'No microphone or camera hardware found on this device.';
      }
      if (this.currentSession) {
        this.currentSession.state = 'error';
        this.currentSession.diagnosticNotice = notice;
        this.notifyState();
      }
      this.cleanup();
    }
  }

  /**
   * Handles incoming signaling messages from WebSocket gateway
   */
  public async handleIncomingSignal(fromUserId: string, signalData: any, senderName?: string, senderAvatar?: string) {
    if (!signalData) return;

    switch (signalData.type) {
      case 'offer': {
        // Incoming call received
        if (this.currentSession && this.currentSession.state !== 'ended' && this.currentSession.state !== 'idle') {
          // Send busy signal back
          this.sendSignal({
            recipientId: fromUserId,
            signalData: { type: 'busy', callId: signalData.callId }
          });
          return;
        }

        this.currentSession = {
          callId: signalData.callId || `call_${Date.now()}`,
          conversationId: signalData.conversationId || '',
          peerId: fromUserId,
          peerName: senderName || 'Soulverse Peer',
          peerAvatar: senderAvatar,
          callType: signalData.callType || 'voice',
          isOutgoing: false,
          state: 'ringing',
          durationSeconds: 0,
          isAudioMuted: false,
          isVideoMuted: false,
          diagnosticNotice: `Incoming ${signalData.callType || 'voice'} call`
        };
        this.notifyState();

        // Stash the incoming offer description
        (this as any).pendingOffer = signalData.sdp;
        break;
      }

      case 'answer': {
        if (this.peerConnection && this.currentSession && signalData.sdp) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            this.currentSession.state = 'connecting';
            this.currentSession.diagnosticNotice = 'Connecting peer stream...';
            this.notifyState();
          } catch (e) {
            console.error('Failed to set remote description on answer', e);
          }
        }
        break;
      }

      case 'candidate': {
        if (this.peerConnection && signalData.candidate) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          } catch (e) {
            console.warn('Failed to add ICE candidate', e);
          }
        }
        break;
      }

      case 'hangup': {
        if (this.currentSession) {
          this.currentSession.state = 'ended';
          this.currentSession.diagnosticNotice = 'Call ended by peer';
          this.notifyState();
        }
        this.cleanup();
        break;
      }

      case 'reject': {
        if (this.currentSession) {
          this.currentSession.state = 'ended';
          this.currentSession.diagnosticNotice = 'Call declined by peer';
          this.notifyState();
        }
        this.cleanup();
        break;
      }

      case 'busy': {
        if (this.currentSession) {
          this.currentSession.state = 'ended';
          this.currentSession.diagnosticNotice = 'Peer is currently on another call';
          this.notifyState();
        }
        this.cleanup();
        break;
      }
    }
  }

  /**
   * Accepts an incoming call
   */
  public async answerCall() {
    if (!this.currentSession || this.currentSession.state !== 'ringing') return;

    try {
      this.currentSession.diagnosticNotice = 'Connecting microphone and camera...';
      this.notifyState();

      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: this.currentSession.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      this.notifyStreams();

      this.createPeerConnection(this.currentSession.peerId);

      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      const pendingOffer = (this as any).pendingOffer;
      if (pendingOffer) {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(pendingOffer));
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);

        this.sendSignal({
          recipientId: this.currentSession.peerId,
          signalData: {
            type: 'answer',
            callId: this.currentSession.callId,
            sdp: answer
          }
        });

        this.currentSession.state = 'connecting';
        this.currentSession.diagnosticNotice = 'Establishing peer connection...';
        this.notifyState();
      }
    } catch (err: any) {
      console.error('Failed to answer call:', err);
      let notice = 'Could not access media devices.';
      if (err.name === 'NotAllowedError') {
        notice = 'Permission to access microphone/camera was denied.';
      }
      if (this.currentSession) {
        this.currentSession.state = 'error';
        this.currentSession.diagnosticNotice = notice;
        this.notifyState();
      }
      this.rejectCall();
    }
  }

  /**
   * Declines an incoming call
   */
  public rejectCall() {
    if (this.currentSession) {
      this.sendSignal({
        recipientId: this.currentSession.peerId,
        signalData: { type: 'reject', callId: this.currentSession.callId }
      });
      this.currentSession.state = 'ended';
      this.currentSession.diagnosticNotice = 'Call rejected';
      this.notifyState();
    }
    this.cleanup();
  }

  /**
   * Ends an active call
   */
  public hangup() {
    if (this.currentSession) {
      this.sendSignal({
        recipientId: this.currentSession.peerId,
        signalData: { type: 'hangup', callId: this.currentSession.callId }
      });
      this.currentSession.state = 'ended';
      this.currentSession.diagnosticNotice = 'Call ended';
      this.notifyState();
    }
    this.cleanup();
  }

  /**
   * Toggles microphone audio track
   */
  public toggleAudio(): boolean {
    if (!this.localStream || !this.currentSession) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.currentSession.isAudioMuted = !audioTrack.enabled;
      this.notifyState();
      return this.currentSession.isAudioMuted;
    }
    return false;
  }

  /**
   * Toggles video camera track
   */
  public toggleVideo(): boolean {
    if (!this.localStream || !this.currentSession) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.currentSession.isVideoMuted = !videoTrack.enabled;
      this.notifyState();
      return this.currentSession.isVideoMuted;
    }
    return false;
  }

  private createPeerConnection(peerId: string) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          recipientId: peerId,
          signalData: {
            type: 'candidate',
            callId: this.currentSession?.callId,
            candidate: event.candidate
          }
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.notifyStreams();
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection || !this.currentSession) return;
      const state = this.peerConnection.connectionState;

      if (state === 'connected') {
        this.currentSession.state = 'connected';
        this.currentSession.startTime = Date.now();
        this.currentSession.diagnosticNotice = 'Encrypted P2P connection active';
        this.startDurationTimer();
        this.notifyState();
      } else if (state === 'failed' || state === 'disconnected') {
        this.currentSession.diagnosticNotice = 'P2P connection lost or relay unavailable';
        this.currentSession.state = 'ended';
        this.notifyState();
        this.cleanup();
      }
    };
  }

  private startDurationTimer() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = setInterval(() => {
      if (this.currentSession && this.currentSession.state === 'connected') {
        this.currentSession.durationSeconds += 1;
        this.notifyState();
      }
    }, 1000);
  }

  private sendSignal(payload: any) {
    if (this.sendSignalCallback) {
      this.sendSignalCallback(payload);
    }
  }

  private cleanup() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    (this as any).pendingOffer = null;
    this.notifyStreams();

    setTimeout(() => {
      if (this.currentSession && (this.currentSession.state === 'ended' || this.currentSession.state === 'error')) {
        this.currentSession = null;
        this.notifyState();
      }
    }, 2500);
  }
}

export const webrtcCallService = new WebRTCCallService();
