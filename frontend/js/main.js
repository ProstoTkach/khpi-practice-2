import { initManagerPage } from "./managerPage.js";
import { initUsersPage } from "./usersPage.js";
import { initWelcomePage } from "./welcomePage.js";

function initByPage() {
  const page = document.body.dataset.page;
  switch (page) {
    case "welcome":
      initWelcomePage();
      break;
    case "users":
      initUsersPage();
      break;
    case "user-manager":
      initManagerPage();
      break;
    default:
      break;
  }
}

initByPage();
