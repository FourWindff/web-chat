import styles from './video.module.css'
import {SocketObject} from "../chatdata/SocketData";
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Button} from "@douyinfe/semi-ui";


const sendOffer = async (peerConnectionRef, sendMessage, userId, targetId) => {
    const pc = peerConnectionRef.current;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendMessage(new SocketObject(userId, targetId, offer, 'link').parse2JSON());
    console.log("Sending Offer")
}

const receivedOffer = async (peerConnectionRef, offer) => {
    const pc = peerConnectionRef.current;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("Received Offer")
}

const sendAnswer = async (peerConnectionRef, sendMessage, userId, targetId) => {
    const pc = peerConnectionRef.current;
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendMessage(new SocketObject(userId, targetId, answer, 'link').parse2JSON());
    console.log("Sending Answer")
}

const receivedAnswer = async (peerConnectionRef, answer) => {
    const pc = peerConnectionRef.current;
    await pc.setRemoteDescription(answer);
    console.log("Received Answer")
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
            audio: true,
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

        if (!peerConnectionRef.current) {
            const pc = new RTCPeerConnection(config);

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
            peerConnectionRef.current = pc;
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
        handleAsReceiver();


        return () => {
            // 停止本地视频流
            if (localVideo && localVideo.srcObject) {
                const stream = localVideo.srcObject;
                stream.getTracks().forEach(track => {
                    if (track.readyState === "live") {
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
                        track.stop();
                    }
                });  // 停止所有轨道
                remoteVideo.srcObject = null;
            }

            // 关闭 peerConnection 并移除引用
            if (peerConnectionRef.current) {
                peerConnectionRef.current.ontrack = null;
                peerConnectionRef.current.onicecandidate = null;
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };

    }, []);


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

