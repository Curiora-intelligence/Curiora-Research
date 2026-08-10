document.addEventListener("DOMContentLoaded", () => {

    const imageButton =
        document.getElementById("imageButton");

    const cameraButton =
        document.getElementById("cameraButton");

    const imageInput =
        document.getElementById("imageInput");

    const stage =
        document.querySelector(".visual-stage");

    if (
        !imageButton ||
        !cameraButton ||
        !imageInput ||
        !stage
    ) {
        return;
    }


    /*
    ----------------------------------------
    IMAGE INPUT
    ----------------------------------------
    */

    imageButton.addEventListener("click", () => {
        imageInput.click();
    });


    imageInput.addEventListener("change", () => {

        const file =
            imageInput.files[0];

        if (!file) {
            return;
        }

        showImagePreview(file);

    });


    /*
    ----------------------------------------
    CAMERA
    ----------------------------------------
    */

    cameraButton.addEventListener(
        "click",
        async () => {

            if (!navigator.mediaDevices?.getUserMedia) {

                alert(
                    "Camera access is not supported by this browser."
                );

                return;
            }

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true
                    });

                openCamera(stream);

            } catch (error) {

                console.error(
                    "Camera access failed:",
                    error
                );

            }

        }
    );


    /*
    ----------------------------------------
    IMAGE PREVIEW
    ----------------------------------------
    */

    function showImagePreview(file) {

        const url =
            URL.createObjectURL(file);

        stage.classList.add(
            "visual-stage--analyzing"
        );

        const preview =
            document.createElement("img");

        preview.className =
            "visual-preview";

        preview.src = url;

        preview.alt =
            "Selected image for Curio analysis";

        stage.appendChild(preview);

        updateCurioState(
            "IMAGE RECEIVED",
            "Preparing visual analysis..."
        );

    }


    /*
    ----------------------------------------
    CURIO STATE
    ----------------------------------------
    */

    function updateCurioState(
        state,
        message
    ) {

        const stateElement =
            document.querySelector(
                ".visual-core-state"
            );

        const prompt =
            document.querySelector(
                ".visual-prompt p"
            );

        if (stateElement) {
            stateElement.textContent = state;
        }

        if (prompt) {
            prompt.textContent = message;
        }

    }


    /*
    ----------------------------------------
    CAMERA UI
    ----------------------------------------
    */

    function openCamera(stream) {

        const video =
            document.createElement("video");

        video.className =
            "visual-camera";

        video.autoplay = true;
        video.playsInline = true;

        video.srcObject = stream;

        stage.appendChild(video);

        updateCurioState(
            "LIVE VIEW",
            "Curio is observing."
        );

    }

});