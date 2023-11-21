import { Router } from 'express';
import { userModel } from '../dao/models/user.model.js';
import { createHash } from "../utils.js";
import passport from 'passport';

const router = Router();

router.post('/register', passport.authenticate('register', 
  { failureRedirect: '/failRegister' }), 
  async (req, res) => {
    res.redirect("/products");
  }
);

// router.get("/failRegister", (req, res) => {
//   res.send({ error: "Fallo en registro" })
// })

router.post('/login', passport.authenticate('login', { failureRedirect: '/login' }), async (req, res) => {
  if (!req.user) {
    return res.status(400).send({ status: "error", message: "Invalid credentials"});
  }

  req.session.user = {
    username: req.user.username,
    email: req.user.email,
    rol: req.user.password === "adminCod3r123" ? "admin" : "usuario",
  };
  
  res.redirect("/products");
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    req.session.user = req.user;
    req.session.isLogged = true;
    res.redirect('/products');
  }
);

router.post('/logout', async (req, res) => {
  req.session.destroy(err => {
    if(!err) {
      res.redirect("/login")
    } else {
      res.send({ status: "error", body: err })
    }
  })
});

export default router;