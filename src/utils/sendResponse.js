export const sendResponse = (({res , status , data , message}) => {
    res.status(status).json({
        succuss : true,
        message,
        data
    })
})