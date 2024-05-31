const User = require('./models/user');
const Image = require('./models/image');

async function addUser(user) {
    return await User.create(user);
}

async function addImage(image) {
    return await Image.create(image);
}

async function getImagesByUserId(userId) {
    return await Image.find({ userId });
}

module.exports = { addUser, addImage, getImagesByUserId };
