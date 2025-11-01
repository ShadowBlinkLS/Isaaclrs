const userRouter = require('express').Router();

userRouter.get('/', (req, res) =>{
    res.render('pages/index.twig',
        {
            title: "index isaac"
        }
    )
})

userRouter.get('/test', (req, res) =>{
    res.render('pages/test.twig',
        {
            title: "test isaac"
        }
    )
})

userRouter.get('/contact', (req,res)=>{
    res.render('pages/contact.twig',
        {
            title: "Page de contact"
        }
    )
})

module.exports = userRouter