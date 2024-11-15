import styles from './video.module.css'
import {SocketObject} from "../chatdata/SocketData";
import {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {Button} from "@douyinfe/semi-ui";


const sendOffer = async (peerConnectionRef, sendMessage, userId, targetId) => {
    const pc = peerConnectionRef.current;
    //本地不存在offer才能发送offer
    if (pc.signalingState !== "have-local-offer") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendMessage(new SocketObject(userId, targetId, offer, 'link').parse2JSON());
        console.log("Sending Offer");
        console.log("发送offer并设置local后的状态：",pc.signalingState);
    } else {
        console.error(`Sending Offer error current signalingState:${pc.signalingState}`)
    }
}

const receivedOffer = async (peerConnectionRef, offer) => {
    const pc = peerConnectionRef.current;
    //本地不存在offer才能接收offer
    if (pc.signalingState !== "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Received Offer");
        console.log("接收到offer之后的状态：",pc.signalingState);

    } else {
        console.error(`Received Offer error current signalingState:${pc.signalingState}`)
    }
}

const sendAnswer = async (peerConnectionRef, sendMessage, userId, targetId) => {
    const pc = peerConnectionRef.current;
    //本地存在对方的offer才能发送answer
    if (pc.signalingState === "have-remote-offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendMessage(new SocketObject(userId, targetId, answer, 'link').parse2JSON());
        console.log("Sending Answer")
        console.log("发送answer并设置local之后的状态：",pc.signalingState);

    } else {
        console.error(`Sending Answer error current signalingState:${pc.signalingState}`);
    }
}

const receivedAnswer = async (peerConnectionRef, answer) => {
    const pc = peerConnectionRef.current;
    //本地存在offer才能接收answer
    if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(answer);
        console.log("Received Answer")
        console.log("接收到answer之后的状态：",pc.signalingState);
    } else {
        console.error(`Received Answer error current signalingState:${pc.signalingState}`);
    }
}

//交换ICE
const handleICECandidateMessage = async (peerConnectionRef, ICECandidateMessage) => {
    const pc = peerConnectionRef.current;
    try {
        await pc.addIceCandidate(ICECandidateMessage);
    } catch (error) {
        console.error("Error adding received ICE candidate", error);
    }
    console.log("Received ICECandidateMessage")
}

const handleSDPMessage = async (peerConnectionRef, message) => {
    if (message.type === "offer") {
        await receivedOffer(peerConnectionRef, message);
    }
    if (message.type === "answer") {
        await receivedAnswer(peerConnectionRef, message);
    }
}

const setLocalVideoStream = async (peerConnectionRef, localVideoRef) => {
    try {
        // 获取本地媒体流
        const gumStream = await navigator.mediaDevices.getUserMedia({
            video: true,
        });
        localVideoRef.current.srcObject = gumStream;
        // 将每个媒体轨道添加到 peerConnectionRef
        gumStream.getTracks().forEach(track => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addTrack(track, gumStream);
            }
        });
    } catch (error) {
        console.error("Error accessing media devices.", error);
        // 在此处处理错误，例如显示用户友好的错误消息
    }
};

const VideoChat = forwardRef(function VideoChat({
                                                    sourceUserId,
                                                    targetUserId,
                                                    sendMessage,
                                                    onCancelClick,
                                                    receiverMessageRef,
                                                }, ref) {

    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);

    const peerConnectionRef = useRef(null);
    const config = null;
    useImperativeHandle(ref, () => ({
        handleAsSender: (messages) => handleAsSender(messages)
    }));


    useEffect(() => {
        const localVideo = localVideoRef.current;
        const remoteVideo = localVideoRef.current;

        const pc = new RTCPeerConnection(config);
        peerConnectionRef.current = pc;

        //当接收到媒体轨道时
        pc.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                sendMessage(new SocketObject(sourceUserId, targetUserId, event.candidate, 'link').parse2JSON());
            }
            console.log("Sending ICECandidate");
        };
        pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") {
                console.log("所有候选收集完成");
                sendMessage(new SocketObject(sourceUserId, targetUserId, 0, 'link').parse2JSON());
            }
        }



        if (localVideoRef.current) {
            setLocalVideoStream(peerConnectionRef, localVideoRef).then();
        }

        const handleAsReceiver = async () => {
            if (receiverMessageRef.current.length > 0) {
                const messages = receiverMessageRef.current
                for (const message of messages) {
                    if ('sdp' in message) {
                        await handleSDPMessage(peerConnectionRef, message);
                    } else if ('candidate' in message) {
                        await handleICECandidateMessage(peerConnectionRef, message);
                    }
                }
            }
        }

        handleAsReceiver().then();

        return () => {
            // 停止本地视频流
            if (localVideo && localVideo.srcObject) {
                const stream = localVideo.srcObject;
                stream.getTracks().forEach(track => {
                    if (track.readyState === "live") {
                        console.log("关闭本地摄像头");
                        track.stop();
                    }
                });  // 停止所有轨道
                localVideo.srcObject = null;
            }

            // 停止远程视频流
            if (remoteVideo && remoteVideo.srcObject) {
                const stream = remoteVideo.srcObject;
                stream.getTracks().forEach(track => {
                    if (track.readyState === "live") {
                        console.log("关闭远程摄像头");
                        track.stop();
                    }
                });  // 停止所有轨道
                remoteVideo.srcObject = null;
            }

            // 关闭 peerConnection 并移除引用

            if (pc) {
                console.log("关闭前pc状态",pc.signalingState);
                pc.close();
                console.log("关闭后pc状态",pc.signalingState);
                peerConnectionRef.current=null;
                console.log("清理RTCPeerConnection");
            }

        };

    }, [sourceUserId, targetUserId]);


    const handleAsSender = async (messages) => {
        for (const message of messages) {
            if ('sdp' in message) {
                await handleSDPMessage(peerConnectionRef, message);
            } else if ('candidate' in message) {
                await handleICECandidateMessage(peerConnectionRef, message);
            }
        }
    }

    const handleConnect = async () => {
        if (receiverMessageRef.current.length > 0) {
            console.log("接收方")
            await sendAnswer(peerConnectionRef, sendMessage, sourceUserId, targetUserId);
        } else {
            console.log("发送方")
            await sendOffer(peerConnectionRef, sendMessage, sourceUserId, targetUserId);
        }
    }

    const handleDisConnect = () => {
        onCancelClick();
    }

    return (
        <div className={styles.container}>
            <div className={styles.videoWindowContainer}>
                <div className={styles.videoWindow}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        muted
                        className={styles.video}
                    />
                </div>
                <div className={styles.videoWindow}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className={styles.video}
                    />
                </div>
            </div>
            <Button onClick={handleConnect} type={"primary"}>连接</Button>
            <Button onClick={handleDisConnect} type={"primary"}>取消</Button>
        </div>
    );
});
export default VideoChat

