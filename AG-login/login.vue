<template>
  <div class="page login-page" ref="loginPage">
    <audio id="bgm" autoplay loop src="./assets/bgm.mp3"></audio>
    <img class="rt-light" src="./assets/light.jpg" alt="">
    <img class="lb-light" src="./assets/lights.jpg" alt="">
    <div class="service">
      <img src="./assets/coner.png" alt="">
      <button>
        <img src="./assets/service.svg" alt="">
        <p>在线客服</p>
      </button>
    </div>
    <div class="main">
      <img class="logo" src="./assets/logo.svg">
      <p class="slogan">VIP系统 特权专享 私人桌功能 强势推出!</p>
      <div class="login_form">
        <div>
          <img src="./assets/username.svg">
          <input type="text" v-model="formData.username" placeholder="输入用户名" />
          <transition>
            <!-- <p class="tip">您输入的用户名和密码不正确</p> -->
          </transition>
        </div>
        <div>
          <img src="./assets/password.svg">
          <input :type="isPasswordIsShow ? 'text' : 'password'" placeholder="输入密码" v-model="formData.password" />
          <div class="showPassword" @click="isPasswordIsShow = !isPasswordIsShow">
            <img v-if="isPasswordIsShow" src="./assets/hidePassword.svg" alt="">
            <img v-else src="./assets/showPassword.svg" alt="">
          </div>
          <transition>
            <p class="tip">您输入的用户名和密码不正确</p>
          </transition>
        </div>
        <button @click="showPasswordHandler()">
          <p>登入</p>
        </button>
      </div>
    </div>
    <div class="download">
      <img src="./assets/qrcode.png" alt="">
      <button>
        <img src="./assets/download.svg" alt="">
        <div>
          <h4>立即下载APP</h4>
          <p>随时随地 无线投注</p>
        </div>
      </button>
    </div>
    <video id="bgv" autoplay loop poster="./assets/video-pre.jpg" src="./assets/bg.mp4"></video>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPasswordIsShow: false,
      formData: {
        username: "",
        password: "",
      },
    }
  },
  methods: {
    playVideoAndAudio() {
      // 播放视频
      document.getElementById('bgv').play();
      // 播放音乐
      document.getElementById('bgm').play();
    }
  },
  mounted() {
    // 获取.login-page元素的引用
    const loginPage = this.$refs.loginPage;

    // 添加点击事件监听器
    loginPage.addEventListener('click', this.playVideoAndAudio);
  },
}
</script>

<style scoped lang="less">
@formWidth: 17rem;
@formHeight: 2.5rem;
@goldGradient: linear-gradient(135deg, #ffe8a3, #edbe77, #b28452, #edbe77, #ffe8a3);

* {
  padding: 0;
  margin: 0;
}

.login-page {
  font-family: Microsoft YaHei, PingFang SC, HarmonyOS_Regular, Helvetica Neue, sans-serif;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}

.flex(@direction: row) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: @direction;
}

p {
  font-size: 0.9rem;
  color: #fff;
}

button {
  outline: none;
  border: 0;
  border-radius: 10rem;
}

.rt-light {
  position: absolute;
  width: 45rem;
  top: 0;
  right: 0;
  mix-blend-mode: screen;
}

.lb-light {
  position: absolute;
  width: 80rem;
  left: 0;
  bottom: 0;
  mix-blend-mode: screen;
}

.service {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  font-size: 0;
  .flex(column);
  justify-content: unset;

  >img {
    position: absolute;
    width: 16rem;
    z-index: -1;
  }

  button {
    position: relative;
    top: 0.4rem;
    right: 0.4rem;
    .flex();
    padding: 0.3rem 0.7rem;
    margin: 0.4rem;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10rem;

    &:active {
      filter: brightness(1);

      img,
      p {
        filter: brightness(0.4);
      }
    }

    &::after {
      content: '';
      position: absolute;
      inset: -0.08rem;
      border-radius: 10rem;
      background: linear-gradient(#ffd8a1 30%, #d9a064);
      z-index: -1;
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4);
    }

    img {
      width: 1.3rem;
    }

    p {
      font-size: 1.1rem;
      line-height: 1;
      font-weight: bold;
      background: linear-gradient(#ffd8a1 30%, #d9a064);
      color: transparent;
      background-clip: text;
      margin: -0.1rem 0.3rem 0;
    }
  }
}


#bgv {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100vw;
  min-height: 100vh;
  z-index: -1;
  filter: brightness(0.8);
  transition: filter 0.4s ease-in-out;
}

.main {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .flex(column);

  .logo {
    width: 22rem;
  }

  .slogan {
    font-size: 1.1rem;
    font-weight: 1000;
    background: @goldGradient;
    background-size: 200%;
    animation: goldAni 2s linear infinite;
    color: transparent;
    background-clip: text;
    margin: 0.6rem 0 2rem;
  }

  &:hover~.bgv {
    filter: brightness(0.4);
  }
}

.login_form {
  .flex(column);

  button {
    width: @formWidth;
    height: @formHeight;
    transition: transform 0.1s ease-in-out;
    background: @goldGradient;
    background-size: 200%;
    animation: goldAni 1s linear infinite;
    animation-play-state: paused;

    &:hover {
      animation-play-state: running;
      transform: scale(1.05);
    }

    &:active {
      animation-play-state: running;
      transform: scale(0.95);

    }

    p {
      font-size: 1.2rem;
      line-height: 1;
      font-weight: bold;
      color: #2c1e0c;
    }
  }

  >div {
    width: @formWidth;
    height: @formHeight;
    position: relative;
    font-size: 0;

    &:nth-child(1) {
      margin-bottom: 1.4rem;
    }

    &:nth-child(2) {
      margin-bottom: 2rem;
    }

    input {
      width: 100%;
      height: 100%;
      font-size: 0.9rem;
      padding-left: 2rem;
      box-sizing: border-box;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgb(250, 220, 151);
      border-radius: 10rem;
      color: #fff;
      transition: 0.3s ease-in-out;

      &::placeholder {
        color: #fff;
      }

      &:focus {
        outline: none;
        border: 1px solid rgb(250, 220, 151);
      }

      &[type="password"]::-ms-reveal {
        display: none;
      }
    }

    .tip {
      font-size: 0.8rem;
      color: #ff4c34;
      margin-top: 0.2rem;
    }

    >img {
      position: absolute;
      height: 1.1rem;
      top: 50%;
      left: 0.6rem;
      transform: translateY(-50%);
    }

    .showPassword {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;

      img {
        height: 1.3rem;
      }
    }
  }
}

.download {
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  .flex(column);

  >img {
    width: 80%;
    margin-bottom: 0.5rem;
    border-radius: 0.5rem;
  }

  button {
    border-radius: 10rem;
    .flex();
    padding: 0.2rem;
    background: @goldGradient;
    background-size: 200%;
    animation: goldAni 1s linear infinite;
    animation-play-state: paused;
    transition: transform 0.3s ease-in-out;

    img {
      width: 2rem;
    }

    &:hover {
      animation-play-state: running;
      transform: scale(1.06);
    }

    &:active {
      transform: scale(1);
      transition: 0.03s ease-in-out;
    }

    div {
      margin: 0 0.4rem 0 0.2rem;

      h4 {
        font-size: 1rem;
        line-height: 1;
        text-align: center;
        margin-bottom: 0.22rem;
      }

      p {
        font-size: 0.65rem;
        line-height: 1;
        text-align: center;
        color: #2c1e0c;
      }
    }
  }
}

@keyframes goldAni {
  0% {
    background-position: 200% 0%;
  }

  100% {
    background-position: 0% 0%;
  }
}

@media screen and (max-width:640px) {
  html {
    font-size: 4.6vw;
  }

  .download {
    left: 0;
    right: 0;
    bottom: 0;

    >img {
      display: none;
    }

    button {
      padding: 0.4rem 0 0.5rem;
      margin: 0;
      width: 106%;
      border-radius: 0;
      animation-play-state: running;

      &:hover {
        transform: scale(1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .main {
    .logo {
      width: 17rem;
    }

    .slogan {
      font-size: 0.9rem;
      margin-bottom: 1.4rem;
    }
  }

  .rt-light {
    width: 90vw;
  }

  .lb-light {
    width: 150vw;
  }

  .service {
    >img {
      width: 12rem;
    }

    button {
      top: 0.2rem;
      right: 0;
      padding: 0.2rem;

      p {
        // font-size: 1rem;
        margin: 0 0.2rem 0 0.1rem;
      }
    }
  }

  .login_form {
    button {
      animation-play-state: running;

      &:hover {
        transform: scale(1);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    >div {
      input {
        font-size: 0.9rem;
      }

      .tip {
        font-size: 0.8rem;
      }
    }
  }
}
</style>
