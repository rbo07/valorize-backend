class CheckPhoto {

    async setParamsPhoto(data) {

        if (data !== null) {
            const uploadedResponse = await cloudinary.uploader.upload(
                data, {
                upload_preset: 'valorize_avatar'
            })
            const user_photo = uploadedResponse.secure_url
            return { user_photo }

        } else {
            return {}
        }
    }
}

export default new CheckPhoto();