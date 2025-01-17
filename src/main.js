import './style.css'

// The Auth0 client, initialized in configureClient()
let auth0Client = null;

/**
 * Initializes the Auth0 client
 */
const configureClient = async function(domain, clientId) {
  auth0Client = await auth0.createAuth0Client({
    domain,
    clientId,
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
async function requireAuth(fn, targetUrl) {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

/**
 * Starts the authentication flow
 */
async function login(targetUrl) {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
async function logout() {
  try {
    console.log("Logging out");
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

async function openUserhub() {
  const url = "https://dev-3dn3cbtsrcxpdz.userhub.app"
  window.open(url, '_blank');
}

const updateUI = async () => {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }
  console.log("UI updated");
};

// Will run when page finishes loading
window.onload = async () => {
  const domain = "dev-ceq8afbg7kbv2sgi.us.auth0.com";
  const clientId = "icJMaJ6OkAmybzgUt3KwnBRIv0RpIVAI";

  await configureClient(domain, clientId);
  const isAuthenticated = await auth0Client.isAuthenticated();

  $('#login').click(() => login());
  $('#logout').click(() => logout());
  $('#upgrade').click(() => openUserhub());
  $('#manage').click(() => openUserhub());

  if (isAuthenticated) {
    updateUI();
    console.log('User is authenticated');
    return;
  }

  console.log('User not authenticated');

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    try {
      await auth0Client.handleRedirectCallback();
      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }
  }

  updateUI();
};

