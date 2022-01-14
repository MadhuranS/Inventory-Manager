const cloudinary = require("cloudinary");
const { response } = require("express");
const res = require("express/lib/response");

async function uploadImage(file) {
    let res = {
        data: {},
        errors: [],
    };
    try {
        const uploadedImage = await cloudinary.uploader.upload(file.path);
        res.data = {
            url: uploadedImage.url,
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
module.exports = uploadImage;
