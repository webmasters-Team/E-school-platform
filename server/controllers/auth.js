import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validation
    if (!name) return res.status(400).send("이름을 입력하세요.");
    if (!password || password.length < 6) {
      return res.status(400).send("비밀번호는 최소 6글자여야 합니다.");
    }
    let userInDb = await User.findOne({ email }).exec();
    if (userInDb) return res.status(400).send("이미 사용중인 이메일입니다.");

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("에러가 발생했습니다. 다시 시도하여 주세요.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userInDb = await User.findOne({ email }).exec();
    if (!userInDb) return res.status(400).send("존재하지 않는 유저입니다.");

    const match = await comparePassword(password, userInDb.password);

    if (!match) return res.status(400).send("비밀번호가 일치하지 않습니다.");

    // create signed jwt
    const token = jwt.sign({ _id: userInDb._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    userInDb.password = undefined;
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    res.json(userInDb);
  } catch (err) {
    console.log(err);
    return res.status(400).send("에러가 발생했습니다. 다시 시도하여 주세요.");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "로그아웃되었습니다." });
  } catch (err) {
    console.log(err);
    return res.status(400).send("에러가 발생했습니다. 다시 시도하여 주세요.");
  }
};

export const currentUser = async (req, res) => {
  try {
    const userInDb = await User.findById(req.user._id)
      .select("-password")
      .exec();
    if (userInDb) {
      return res.json({ ok: true });
    }
    return res.status(400).send("잘못된 요청입니다.");
  } catch (err) {
    console.log(err);
  }
};

export const sendTestEmail = async (req, res) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["mayerjeon0116@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <html>
              <h1>비밀번호 재설정 링크</h1>
              <p>비밀번호 재설정을 위해 다음 링크를 사용하세요.</p>
            </html>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "비밀번호 재설정",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(8).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );

    if (!user) return res.status(400).send("해당하는 유저를 찾을 수 없습니다.");

    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1>비밀번호 재설정</h1>
                <p>비밀번호 재설정을 위해 다음 코드를 복사하여 사용하세요.</p>
                <h2 style="color:red;">${shortCode}</h2>
                <i>eshool.com</i>
              </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "비밀번호 재설정",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const hashedPassword = await hashPassword(newPassword);
    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("에러가 발생했습니다. 다시 시도하여 주세요.");
  }
};
