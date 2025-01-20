export const loginWithJWT = ({ res, user }) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + process.env.TOKEN_EXPIRY * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      message: "User logged in successfully",
      data: {
        user,
        token,
      },
    });
};
