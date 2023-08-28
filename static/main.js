// const { default: Peer } = require("peerjs");

const socket = io("/");

// const main_chat_window = document.getElementById("main__chat__window");
const video_grids = document.getElementById("video-grids");
const my_video = document.createElement("video");
const chat = document.getElementById("chat");
// console.log(video_grids);

other_username = "";
// my_video.muted = true;


window.onload = () => {                         // This is implemented in JQuery
    $(document).ready(function () {             // Vanilla JS soon ->
        $("#getCodeModal").modal("show");
    })
}

var peer = new Peer(undefined, {                // PeerJs setup - creating a new peer object
    path: "/peerjs",
    host: "/",
    port: "3030"
})

let my_video_stream;            // Stream of my video or the user's video
const peers = {};               // List of all the peers or people in the room


// Procedure to get own media stream onto the app

var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true
    })
    .then((stream) => {
        my_video_stream = stream;       //Video stream received from getUserMedia is stored to User's video stream
        addVideoStream(my_video, stream, myname);

        socket.on("user-connected", (id, username) => {
            connect_new_user(id, stream, username);      // Connecting video stream to other user
            socket.emit("tellname", myname);
        });

        socket.on("user-disconnected", (id) => {
            if (peers[id]) {
                peers[id].close();
            }
        })
    });

// Procedure when some other person calls

peer.on("call", (call) => {             // When we are receiving a call from someone else
    getUserMedia({ video: true, audio: true }, (stream) => {    // We get the stream from getUserMedia and
        call.answer(stream);                        // we pass the stream to answer method.
        const video = document.createElement("video");
        call.on("stream", (otherUserStream) => {
            addVideoStream(video, user_video_stream, other_username);
        })
    });
});

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id, myname);     // When connection is established b/w peers
});

socket.on("AddName", (username) => {
    other_username = username;
});

const remove_unused_divs = () => {
    const all_divs = video_grids.getElementsByTagName("div");
    for (let i = 0; i < all_divs.length; i++) {
        e = all_divs[i].getElementsByTagName("video").length;

        if (e === 0) {
            all_divs[i].remove();
        }
    }
}

const connect_new_user = (user_id, stream, username) => {        // Connecting another user with this user
    const call = peer.call(user_id, stream);
    const video = document.createElement("video");

    call.on("stream", (user_video_stream) => {
        addVideoStream(video, user_video_stream, username);
    });

    call.on("close", () => {
        video.remove();
        remove_unused_divs();
    });

    peers[user_id] = call;
}

const addVideoStream = (video_element, stream, name) => {
    video_element.srcObject = stream;
    console.log(stream);
    video_element.addEventListener("loadedmetadata", () => {
        console.log("In add video stream");
        video_element.play();
    });

    const h1 = document.createElement("h1");
    const h1Name = document.createTextNode(name);
    h1.appendChild(h1Name);

    const video_grid = document.createElement("div");
    video_grid.classList.add("video-grid");
    video_grid.appendChild(h1);
    video_grids.appendChild(video_grid);
    video_grid.append(video_element);

    remove_unused_divs();

    let total_users = document.getElementsByTagName("video").length;

    if (total_users > 1) {
        for (let i = 0; i < total_users; i++) {
            document.getElementsByTagName("video")[i].style.width = 100 / total_users + "%";
        }
    }
}

const cancel = () => {
    $("#getCodeModal").modal("hide");
};

const copy = async () => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3030/join/" + roomid);
};

const invitebox = () => {
    $("#getCodeModal").modal("show");
};

const audio_mute_unmute = () => {
    const enabled = my_video_stream.getAudioTracks()[0].enabled;
    if (enabled) {
        my_video_stream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        my_video_stream.getAudioTracks()[0].enabled = true;
    }
};

const video_mute_unmute = () => {
    const enabled = my_video_stream.getVideoTracks()[0].enabled;
    console.log(getUserMedia);
    if (enabled) {
        my_video_stream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        my_video_stream.getVideoTracks()[0].enabled = true;
    }
};