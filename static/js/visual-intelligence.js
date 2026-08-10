document.addEventListener("DOMContentLoaded", () => {

    const imageButton =
        document.getElementById("imageButton");

    const imageInput =
        document.getElementById("imageInput");

    if (!imageButton || !imageInput) {
        return;
    }

    imageButton.addEventListener("click", () => {
        imageInput.click();
    });


    imageInput.addEventListener("change", () => {

        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        console.log(
            "Visual Intelligence input:",
            file.name
        );

        /*
            Model inference will be connected here.

            Future pipeline:

            image
              ↓
            FastAPI
              ↓
            Qwen3-VL
              ↓
            Curio
              ↓
            structured response
        */
    });

});