export const checkValidData = (email, password) => {
    const isEmailValid =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email,
      );
    const isPasswordValid =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test([password]);
  
    if (!isEmailValid) return "Email Id is not valid";
    if (!isPasswordValid)
      return "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit.";
  
    return null;
  };
  