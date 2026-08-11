document.addEventListener("DOMContentLoaded", () => {

    /*
    ========================================================
    ELEMENTS
    ========================================================
    */

    const cameraButton =
        document.getElementById("cameraButton");

    const imageButton =
        document.getElementById("imageButton");

    const videoPauseButton =
        document.getElementById("videoPauseButton");

    const microphonePauseButton =
        document.getElementById(
            "microphonePauseButton"
        );

    const cancelCameraButton =
        document.getElementById(
            "cancelCameraButton"
        );

    const cameraContainer =
        document.getElementById(
            "cameraContainer"
        );

    const cameraPreview =
        document.getElementById(
            "cameraPreview"
        );

    const imageContainer =
        document.getElementById(
            "imageContainer"
        );

    const imagePreview =
        document.getElementById(
            "imagePreview"
        );

    const cancelImageButton =
        document.getElementById(
            "cancelImageButton"
        );

    const imageInput =
        document.getElementById(
            "imageInput"
        );

    const idleControls =
        document.getElementById(
            "idleControls"
        );

    const cameraControls =
        document.getElementById(
            "cameraControls"
        );

    const imageConversation =
        document.getElementById(
            "imageConversation"
        );

    const imageConversationStatus =
        document.getElementById(
            "imageConversationStatus"
        );

    const imageMessageForm =
        document.getElementById(
            "imageMessageForm"
        );

    const imageMessageInput =
        document.getElementById(
            "imageMessageInput"
        );

    const imageVoiceButton =
        document.getElementById(
            "imageVoiceButton"
        );

    const imageVoiceStatus =
        document.getElementById(
            "imageVoiceStatus"
        );

    const imageSendButton =
        document.getElementById(
            "imageSendButton"
        );

    const imageConversationLog =
        document.getElementById(
            "imageConversationLog"
        );

    const imageStatus =
        document.getElementById(
            "imageStatus"
        );

    const visualCoreState =
        document.getElementById(
            "visualCoreState"
        );

    const visualPrompt =
        document.getElementById(
            "visualPrompt"
        );

    const cameraPrompt =
        document.getElementById(
            "cameraPrompt"
        );

    const cameraStatus =
        document.getElementById(
            "cameraStatus"
        );

    const visualStage =
        document.querySelector(
            ".visual-stage"
        );


    /*
    ========================================================
    REQUIRED ELEMENT CHECK
    ========================================================
    */

    const requiredElements = [
        cameraButton,
        imageButton,
        videoPauseButton,
        microphonePauseButton,
        cancelCameraButton,
        cameraContainer,
        cameraPreview,
        imageContainer,
        imagePreview,
        cancelImageButton,
        imageInput,
        idleControls,
        cameraControls,
        imageConversation,
        imageConversationStatus,
        imageMessageForm,
        imageMessageInput,
        imageVoiceButton,
        imageVoiceStatus,
        imageSendButton,
        imageConversationLog,
        imageStatus,
        visualCoreState,
        visualPrompt,
        cameraPrompt,
        cameraStatus,
        visualStage
    ];


    if (
        requiredElements.some(
            element => !element
        )
    ) {

        console.error(
            "Curiora Visual Intelligence: required UI element missing."
        );

        return;
    }


    /*
    ========================================================
    CAMERA STATE
    ========================================================
    */

    let cameraStream = null;

    let cameraActive = false;

    let videoPaused = false;

    let microphonePaused = false;


    /*
    ========================================================
    IMAGE STATE
    ========================================================
    */

    let selectedImageFile = null;

    let selectedImageObjectUrl = null;


    /*
    ========================================================
    IMAGE VOICE STATE
    ========================================================
    */

    let speechRecognition = null;

    let voiceInputSupported = false;

    let voiceInputActive = false;

    let speechBaseText = "";


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (SpeechRecognition) {

        voiceInputSupported = true;

        speechRecognition =
            new SpeechRecognition();


        speechRecognition.continuous =
            true;

        speechRecognition.interimResults =
            true;

        speechRecognition.lang =
            document.documentElement.lang ||
            "en-US";

    } else {

        imageVoiceButton.disabled = true;

        imageVoiceButton.setAttribute(
            "aria-label",
            "Voice input is not supported in this browser"
        );

        imageVoiceStatus.textContent =
            "Voice input is not supported in this browser.";

    }


    /*
    ========================================================
    UI STATE
    ========================================================
    */

    function setIdleState() {

        stopImageVoiceInput();


        cameraActive = false;

        videoPaused = false;

        microphonePaused = false;


        cameraContainer.hidden = true;

        cameraControls.hidden = true;

        imageContainer.hidden = true;

        imageConversation.hidden = true;

        idleControls.hidden = false;


        visualCoreState.textContent =
            "READY TO OBSERVE";


        visualPrompt.textContent =
            "Point Curio toward something or provide an image to begin.";


        cameraPrompt.textContent =
            "Curio is observing your environment.";


        cameraStatus.textContent =
            "Curio is ready";


        videoPauseButton.textContent =
            "Video pause";


        microphonePauseButton.textContent =
            "Microphone pause";


        imageVoiceButton.classList.remove(
            "is-listening"
        );

        imageVoiceButton.setAttribute(
            "aria-pressed",
            "false"
        );


        imageVoiceStatus.textContent =
            "Voice input off";

        imageVoiceStatus.classList.remove(
            "is-listening"
        );


        visualStage.classList.remove(
            "camera-active",
            "camera-paused"
        );

    }


    function setCameraState() {

        idleControls.hidden = true;

        cameraControls.hidden = false;

        cameraContainer.hidden = false;

        imageContainer.hidden = true;

        imageConversation.hidden = true;


        visualCoreState.textContent =
            "LIVE VIEW";


        cameraPrompt.textContent =
            "Curio is observing your environment.";


        cameraStatus.textContent =
            "Curio is observing";


        visualStage.classList.add(
            "camera-active"
        );

    }


    function setImageState() {

        idleControls.hidden = true;

        cameraControls.hidden = true;

        cameraContainer.hidden = true;

        imageContainer.hidden = false;

        imageConversation.hidden = false;


        visualCoreState.textContent =
            "IMAGE READY";


        visualPrompt.textContent =
            "Ask Curio about what you see.";


        imageConversationStatus.textContent =
            "Curio is ready to examine this image.";


        imageStatus.textContent =
            "Curio is ready to examine this image";


        imageContainer.classList.add(
            "image-active"
        );


        requestAnimationFrame(() => {
            imageMessageInput.focus();
        });

    }


    /*
    ========================================================
    IMAGE INPUT
    ========================================================
    */

    imageButton.addEventListener(
        "click",
        () => {

            if (cameraActive) {
                return;
            }

            imageInput.click();

        }
    );


    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                console.error(
                    "Curiora: selected file is not an image."
                );

                imageInput.value = "";

                return;
            }


            if (selectedImageObjectUrl) {

                URL.revokeObjectURL(
                    selectedImageObjectUrl
                );

            }


            selectedImageFile =
                file;


            selectedImageObjectUrl =
                URL.createObjectURL(file);


            imagePreview.src =
                selectedImageObjectUrl;


            imagePreview.alt =
                `Selected image: ${file.name}`;


            imageConversationLog.replaceChildren();

            imageMessageInput.value = "";

            imageMessageInput.style.height =
                "auto";


            setImageState();

        }
    );


    /*
    ========================================================
    CANCEL IMAGE
    ========================================================
    */

    function cancelImage() {

        stopImageVoiceInput();


        selectedImageFile =
            null;


        if (selectedImageObjectUrl) {

            URL.revokeObjectURL(
                selectedImageObjectUrl
            );

            selectedImageObjectUrl =
                null;

        }


        imagePreview.removeAttribute(
            "src"
        );


        imagePreview.alt =
            "Selected image for Curio analysis";


        imageInput.value = "";

        imageMessageInput.value = "";

        imageMessageInput.style.height =
            "auto";


        imageConversationLog.replaceChildren();


        imageContainer.classList.remove(
            "image-active"
        );


        imageStatus.textContent =
            "Curio is ready to examine this image";


        setIdleState();

    }


    cancelImageButton.addEventListener(
        "click",
        cancelImage
    );


    /*
    ========================================================
    IMAGE CONVERSATION
    ========================================================
    */

    function addConversationMessage(
        role,
        message
    ) {

        const messageElement =
            document.createElement("div");


        messageElement.className =
            `image-message ${role}`;


        messageElement.textContent =
            message;


        imageConversationLog.appendChild(
            messageElement
        );


        imageConversationLog.scrollTop =
            imageConversationLog.scrollHeight;

    }


    async function prepareImageMessage(message) {

    if (!selectedImageFile) {
        return;
    }

    imageConversationStatus.textContent =
        "Curio is analyzing the image...";

    imageStatus.textContent =
        "Analyzing image";

    visualCoreState.textContent =
        "THINKING";

    imageSendButton.disabled = true;

    try {

        const formData = new FormData();

        formData.append(
            "image",
            selectedImageFile
        );

        formData.append(
            "message",
            message
        );

        const response = await fetch(
            "/curio/analyze",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            let detail =
                "Curio could not analyze the image.";

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {
                    detail = errorData.detail;
                }

            } catch (_) {
                // Keep the default error message.
            }

            throw new Error(detail);
        }

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                "Curio did not return a successful response."
            );
        }

        addConversationMessage(
            "curio",
            data.answer
        );

        imageConversationStatus.textContent =
            "Curio is ready for another question.";

        imageStatus.textContent =
            "Curio is ready";

        visualCoreState.textContent =
            "IMAGE READY";

    } catch (error) {

        console.error(
            "Curio image analysis failed:",
            error
        );

        imageConversationStatus.textContent =
            "Curio could not complete the analysis.";

        imageStatus.textContent =
            "Analysis failed";

        visualCoreState.textContent =
            "READY";

        addConversationMessage(
            "curio",
            `I couldn't process that image. ${error.message}`
        );

    } finally {

        imageSendButton.disabled = false;

    }
}
imageMessageForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        if (!selectedImageFile) {
            return;
        }

        const message =
            imageMessageInput.value.trim();

        if (!message) {
            return;
        }

        addConversationMessage(
            "user",
            message
        );

        imageMessageInput.value = "";
        imageMessageInput.style.height = "auto";

        await prepareImageMessage(message);
    }
);
    /*
    Auto-grow image message input.
    */

    imageMessageInput.addEventListener(
        "input",
        () => {

            imageMessageInput.style.height =
                "auto";


            imageMessageInput.style.height =
                `${Math.min(
                    imageMessageInput.scrollHeight,
                    140
                )}px`;

        }
    );


    /*
    ========================================================
    IMAGE VOICE INPUT
    ========================================================
    */

    function setVoiceActiveUI() {

        voiceInputActive = true;

        speechBaseText =
            imageMessageInput.value.trim();


        imageVoiceButton.classList.add(
            "is-listening"
        );

        imageVoiceButton.setAttribute(
            "aria-pressed",
            "true"
        );

        imageVoiceButton.setAttribute(
            "aria-label",
            "Stop voice input"
        );


        imageVoiceStatus.textContent =
            "Listening…";


        imageVoiceStatus.classList.add(
            "is-listening"
        );


        imageMessageInput.placeholder =
            "Listening…";


        imageConversationStatus.textContent =
            "Curio is listening.";

    }


    function setVoiceInactiveUI(
        status = "Voice input off"
    ) {

        voiceInputActive = false;

        speechBaseText = "";


        imageVoiceButton.classList.remove(
            "is-listening"
        );

        imageVoiceButton.setAttribute(
            "aria-pressed",
            "false"
        );

        imageVoiceButton.setAttribute(
            "aria-label",
            "Start voice input"
        );


        imageVoiceStatus.textContent =
            status;


        imageVoiceStatus.classList.remove(
            "is-listening"
        );


        imageMessageInput.placeholder =
            "Ask Curio about this image...";

    }


    function startImageVoiceInput() {

        if (!voiceInputSupported) {
            return;
        }


        if (voiceInputActive) {
            stopImageVoiceInput();
            return;
        }


        if (!selectedImageFile) {
            return;
        }


        try {

            speechBaseText =
                imageMessageInput.value.trim();


            speechRecognition.start();

        } catch (error) {

            console.warn(
                "Curiora voice input could not start:",
                error
            );

        }

    }


    function stopImageVoiceInput() {

        if (
            !speechRecognition ||
            !voiceInputActive
        ) {

            setVoiceInactiveUI();

            return;
        }


        try {

            speechRecognition.stop();

        } catch (error) {

            console.warn(
                "Curiora voice input could not stop:",
                error
            );

            setVoiceInactiveUI();

        }

    }


    if (speechRecognition) {

        speechRecognition.onstart =
            () => {

                setVoiceActiveUI();

            };


        speechRecognition.onresult =
            event => {

                let finalTranscript = "";

                let interimTranscript = "";


                for (
                    let index = event.resultIndex;
                    index < event.results.length;
                    index += 1
                ) {

                    const result =
                        event.results[index];


                    if (
                        result.isFinal
                    ) {

                        finalTranscript +=
                            result[0].transcript;

                    } else {

                        interimTranscript +=
                            result[0].transcript;

                    }

                }


                const transcript =
                    [
                        speechBaseText,
                        finalTranscript
                    ]
                        .filter(Boolean)
                        .join(" ");


                imageMessageInput.value =
                    [
                        transcript,
                        interimTranscript
                    ]
                        .filter(Boolean)
                        .join(" ");


                imageMessageInput.style.height =
                    "auto";


                imageMessageInput.style.height =
                    `${Math.min(
                        imageMessageInput.scrollHeight,
                        140
                    )}px`;

            };


        speechRecognition.onerror =
            event => {

                console.warn(
                    "Curiora voice input error:",
                    event.error
                );


                if (
                    event.error === "not-allowed" ||
                    event.error === "service-not-allowed"
                ) {

                    setVoiceInactiveUI(
                        "Microphone permission is required."
                    );

                    return;
                }


                if (
                    event.error === "no-speech"
                ) {

                    setVoiceInactiveUI(
                        "No speech detected."
                    );

                    return;
                }


                setVoiceInactiveUI(
                    "Voice input unavailable."
                );

            };


        speechRecognition.onend =
            () => {

                if (voiceInputActive) {

                    setVoiceInactiveUI();

                }

            };

    }


    imageVoiceButton.addEventListener(
        "click",
        startImageVoiceInput
    );


    /*
    ========================================================
    CAMERA
    ========================================================
    */

    async function startCamera() {

        if (cameraActive) {
            return;
        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            cameraStatus.textContent =
                "Camera access is unavailable.";


            cameraPrompt.textContent =
                "This browser does not support camera access.";


            return;
        }


        try {

            cameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "user"
                        }
                    },
                    audio: true
                });


            cameraPreview.srcObject =
                cameraStream;


            cameraActive = true;

            videoPaused = false;

            microphonePaused = false;


            setCameraState();

        } catch (error) {

            console.error(
                "Curiora camera access failed:",
                error
            );


            cameraStatus.textContent =
                "Camera access denied or unavailable.";


            cameraPrompt.textContent =
                "Allow camera and microphone access to use Visual Intelligence.";

        }

    }


    /*
    ========================================================
    VIDEO PAUSE
    ========================================================
    */

    function toggleVideoPause() {

        if (
            !cameraStream ||
            !cameraActive
        ) {
            return;
        }


        const videoTracks =
            cameraStream.getVideoTracks();


        if (
            videoTracks.length === 0
        ) {
            return;
        }


        const videoTrack =
            videoTracks[0];


        if (videoPaused) {

            videoTrack.enabled =
                true;

            videoPaused =
                false;


            videoPauseButton.textContent =
                "Video pause";


            cameraStatus.textContent =
                "Curio is observing";


            visualStage.classList.remove(
                "camera-paused"
            );


        } else {

            videoTrack.enabled =
                false;

            videoPaused =
                true;


            videoPauseButton.textContent =
                "Video resume";


            cameraStatus.textContent =
                "Video paused";


            visualStage.classList.add(
                "camera-paused"
            );

        }

    }


    /*
    ========================================================
    MICROPHONE PAUSE
    ========================================================
    */

    function toggleMicrophonePause() {

        if (
            !cameraStream ||
            !cameraActive
        ) {
            return;
        }


        const audioTracks =
            cameraStream.getAudioTracks();


        if (
            audioTracks.length === 0
        ) {

            microphonePauseButton.textContent =
                "No microphone";


            return;
        }


        const microphoneTrack =
            audioTracks[0];


        if (microphonePaused) {

            microphoneTrack.enabled =
                true;

            microphonePaused =
                false;


            microphonePauseButton.textContent =
                "Microphone pause";


        } else {

            microphoneTrack.enabled =
                false;

            microphonePaused =
                true;


            microphonePauseButton.textContent =
                "Microphone resume";

        }

    }


    /*
    ========================================================
    CANCEL CAMERA
    ========================================================
    */

    function cancelCamera() {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

        }


        cameraStream =
            null;


        cameraPreview.srcObject =
            null;


        setIdleState();

    }


    /*
    ========================================================
    EVENTS
    ========================================================
    */

    cameraButton.addEventListener(
        "click",
        startCamera
    );


    videoPauseButton.addEventListener(
        "click",
        toggleVideoPause
    );


    microphonePauseButton.addEventListener(
        "click",
        toggleMicrophonePause
    );


    cancelCameraButton.addEventListener(
        "click",
        cancelCamera
    );


    /*
    ========================================================
    INITIAL STATE
    ========================================================
    */

    setIdleState();

});