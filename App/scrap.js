let btnscrap = document.getElementById("btnscrap");

btnscrap.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab !== null) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapingProfile,
    });
  }
});

const scrapingProfile = async () => {
  const wait = function (milliseconds) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, milliseconds);
    });
  };

  const autoscrollToElement = async function (cssSelector) {
    let exits = document.querySelector(cssSelector);
    console.log(exits);
    let oldScrollY = -1;
    while (exits) {
      let currentScrollY = window.scrollY;
      if (oldScrollY === currentScrollY) break;

      await wait(50);

      window.scrollTo(0, currentScrollY + 20);
      oldScrollY = currentScrollY;
    }

    console.log(`Scroll finalizado:  ${exits}`);

    return new Promise((res) => {
      res();
    });
  };

  const elementNameProfile = document.querySelector(
    "div.ph5.pb5 > div.display-flex.mt2 ul li"
  );
  const elementNameTitle = document.querySelector(
    "div.ph5.pb5 > div.display-flex.mt2 h2"
  );
  const elementUbication = document.querySelector(
    "div.ph5.pb5 > div.display-flex.mt2 > div.flex-1 > ul.mt1 > li"
  );
  const name = elementNameProfile ? elementNameProfile.innerText : "";
  const title = elementNameTitle ? elementNameTitle.innerText : "";
  const ubication = elementUbication ? elementUbication.innerText : "";

  await wait(2000);
  const elementMoreResume = document.getElementById(
    "line-clamp-show-more-button"
  );
  if (elementMoreResume) elementMoreResume.click();
  const elementResume = document.querySelector("section.pv-about-section > p");
  const resume = elementResume ? elementResume.innerText : "";
  await autoscrollToElement("body");

  // Para obtener la experiencia :
  const elementExperience = document.querySelectorAll(
    ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item div.pv-entity__summary-info"
  );

  const experience = elementExperience
    ? Array.from(elementExperience).map((e) => {
        return {
          empresa: e.children[2].innerText,
          periodo: e.children[3].innerText,
          funcion: e.children[0].innerText,
        };
      })
    : "";

  const elementEducation = document.querySelectorAll(
    ".pv-profile-section-pager section.education-section  ul li.pv-profile-section__list-item div.pv-entity__summary-info"
  );

  const education = elementEducation
    ? Array.from(elementEducation).map((e) => {
        let [carrera, ...grado] = Array.from(e.children[0].children).map(
          (el) => el.innerText
        );
        let grados = Array.from(grado);

        return {
          centro_estudio: carrera,
          nivel_estudio: grados,
          periodo: e.children[1].innerText,
        };
      })
    : "";
  let personal = { name, title, resume, ubication };
  console.log({ personal, experience, education });
};
