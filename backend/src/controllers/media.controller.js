import uploadImage from "../utils/cloudinaryUpload.js";

const uploadAccommodationImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload at least one image",
      });
    }

    const images = await Promise.all(
      req.files.map((file) => uploadImage(file.buffer)),
    );

    return res.status(200).json({
      status: "success",
      message: "Images uploaded successfully",
      data: {
        images,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadVerificationDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload a document image",
      });
    }

    const document = await uploadImage(req.file.buffer, "nysc-connect/verification");

    return res.status(200).json({
      status: "success",
      message: "Verification document uploaded successfully",
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

export { uploadAccommodationImages, uploadVerificationDocument };