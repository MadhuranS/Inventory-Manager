const cloudinary = require("cloudinary");

async function uploadImage(file) {
    let res = {
        data: {},
        errors: [],
    };
    try {
        const uploadedImage = await cloudinary.v2.uploader.upload(file.path, {
            eager: [
                { gravity: "custom", height: 150, width: 150, crop: "thumb" },
            ],
        });
        res.data = {
            url:
                uploadedImage.eager && uploadedImage.eager[0].url
                    ? uploadedImage.eager[0].url
                    : uploadedImage.url,
            public_id: uploadedImage.public_id,
        };
    } catch (err) {
        res.errors.push({
            msg: `Image failed to upload successfully because: ${err.message}`,
            param: "image",
        });
    }

    return res;
}

async function deleteImage(public_id) {
    let errors = [];
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        errors.push({
            msg: `Image failed to delete successfully because: ${err.message}`,
        });
    }

    return errors;
}
module.exports = { uploadImage, deleteImage };
