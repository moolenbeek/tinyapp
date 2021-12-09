const findUserByEmail = (email, db) => {
  for (let userId in db) {
    const user = db[userId]; // => retrieve the value
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const generateRandomString = () => {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};

<<<<<<< HEAD
module.exports = { findUserByEmail, generateRandomString };
=======
module.exports = {
  findUserByEmail,
  generateRandomString
};
>>>>>>> feature/method-override
