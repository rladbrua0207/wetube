import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "join" });
};

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username or email is already taken",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });

    return res.redirect("login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => res.render("login");

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  const pageTitle = "Login";
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
  // check if account exists
  // check if password correct
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "http://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  //console.log(1,tokenRequest);
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    //const access_token = json.access_token;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //console.log("userData", userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //console.log("emailData", emailData);

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    //console.log("existingUser", existingUser);
    // 해당 이메일을 가진 user가 이미 있는지
    if (!user) {
      //회원가입
      user = await User.create({
        name: userData.name ? userData.name : "Unknown",
        //github 프로필 설정 안하면 name이 없어서 name path를 찾을 수 없다고 에러나서 예외처리
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      }); //로그인
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

/**  미친짓, 위의방식이 훨신 알아보기편하다
fetch(finalUrl, {
  method: "POST",
  headers: {
    Accept: "application/json",
  },
})
.then((response)=> response.json())
.then((json) => {
  if("access_token" in json) {
    const{ access_token } = toeknRequest;
    const apiUrl = "https://api.github.com";
    fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })
    .then((response) => response.json())
    .then((josn)=> {
      fetch(`${apiUrl}/user/emails`,{
        headers: {
          Authorization: `token ${access_token}`
        },
      });
    });
  }
});
**/

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  //console.log(file);
  //const id = req.session.user.id
  //const { username, email, name, location} = req.body;

  const findUsername = await User.findOne({ username });
  const findEmail = await User.findOne({ email });
  if (
    (findUsername !== null && findUsername._id.valueOf() !== _id) ||
    (findEmail !== null && findEmail._id.valueOf() !== _id)
  ) {
    console.log("123");
    return res.render("edit-Profile", {
      pageTitle: "Edit profile",
      errorMessage: "User is exists",
    });
  } //바꾸기
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      username,
      email,
      name,
      location,
    },
    { new: true }
  );
  //console.log(1, updatedUser);
  req.session.user = updatedUser;
  
  /*
  req.session.user ={
    ...req.session.user,
    name,
    email,
    username,
0    location
  } */

  return res.redirect("/");
};
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }

  return res.render("users/change-password", {
    pageTitle: "Change Password",
  });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const ok = await bcrypt.compare(oldPassword, password);

  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }

  const user = await User.findById(_id);
  console.log("Old password", user.password);
  user.password = newPassword;
  console.log("new unhashed pw", user.password);
  await user.save();
  console.log("hashed pw", user.password);

  req.session.user.password = user.password; //세션도 같이 변경해줘야함

  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path:"videos",
    populate: {
      path: "owner",
      model: "User",
    }
  });
  console.log(user);
  if(!user){
    return res.status(404).render("404", {pageTitle: "User not found."});
  }
  //const videos = await Video.find({owner: user._id});
  return res.render("users/profile", { pageTitle: user.name, user });
};
