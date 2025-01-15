export const loginWithJWT = ({res , user}) => {
    const token = user.getJWTToken();
    const options = {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly : true,
        sameSite : 'none',
        maxAge : process.env.COOKIE_EXPIRE * 60 * 60 * 1000
    }

    res.status(200).cookie('token' , token , options).json({
        success : true,
        data : {
            user,
            token : token
        }
    })
}