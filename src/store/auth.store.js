export default {
  state: {
    userId: undefined,
    sessionId: undefined,
    profile: {}
  },
  mutations: {
    setUserId(state, id) {
      state.userId = id;
    },
    setSessionId(state, id) {
      state.sessionId = id;
    },
    setProfile(state, profile) {
      state.profile = {...state.profile, ...profile};
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.sessionId !== undefined;
    },
    userProfile(state) {
      return state.profile;
    }
  },
  actions: {
    login: async function (context, {username, password}) {
      const response = await fetch(`/services/auth.php`, {
        method: "post",
        body: `login=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}&admin_login=true`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        }
      });
      const body = await response.json();
      if ((body.success === true || body.success === "true") && (body.role === "admin" || body.role === "sysadmin")) {
        context.commit("setUserId", 1);
        context.commit("setSessionId", body["sid"]);
        context.commit("setProfile", {
          username: username,
          realName: ""
        });
        const profileResponse = await fetch(`/services/users.php?user=${username}`, {
          method: "get",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
          }
        });
        const data = await profileResponse.json();
        if (data.success === true || data.success === "true") {
          context.commit("setProfile", {
            realName: data.data.realname
          });
        }
        return true;
      } else {
        return false;
      }
    }
  }
};
