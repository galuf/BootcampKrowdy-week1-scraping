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

    console.log(`Scroll end:  ${exits}`);

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

  // boton cargar mas info experiencia
  const buttonMoreExp = document.querySelectorAll(
    ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item button.pv-profile-section__see-more-inline"
  );
  if (buttonMoreExp) buttonMoreExp.forEach((e) => e.click());

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

  // Para el segundo formato de experiencia
  const elementCompany = document.querySelectorAll(
    ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item div.pv-entity__company-summary-info h3"
  );
  const companies = elementCompany
    ? Array.from(elementCompany).map((e) => {
        return e.children[1].innerText;
      })
    : [];

  const elementCompanyDate = document.querySelectorAll(
    ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item div.pv-entity__company-summary-info h4"
  );
  const companiesDate = elementCompanyDate
    ? Array.from(elementCompanyDate).map((e) => {
        return e.children[1].innerText;
      })
    : [];

  const elementWorksCompany = document.querySelectorAll(
    ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item ul.pv-entity__position-group.mt2"
  );

  const worksCompany = elementWorksCompany
    ? Array.from(elementWorksCompany).map((element, i) => {
        let positionWork = Array.from(element.children).map((e) => {
          let position =
            e.children[0].children[0].children[1].children[0].children[0]
              .children[0];
          if (Array.from(position.children).length == 3) {
            // Verificar la estructura de los nodos
            return {
              cargo: position.children[0].children[1].innerText,
              periodo: position.children[1].children[1].children[1].innerText,
              lugar: position.children[2].children[1].innerText,
            };
          } else {
            return {
              info: position.innerText.split("\n"),
            };
          }
        });
        return {
          empresa: companies[i],
          periodo: companiesDate[i],
          cargos: positionWork,
        };
      })
    : "";

  const allExperience = [...experience, ...worksCompany];

  // Para obtener datos de educacion :
  const buttonMoreEducation = document.querySelectorAll(
    ".pv-profile-section-pager section.education-section  button.pv-profile-section__see-more-inline"
  );
  if (buttonMoreEducation) buttonMoreEducation.forEach((e) => e.click());

  const elementEducation = document.querySelectorAll(
    ".pv-profile-section-pager section.education-section  ul li.pv-profile-section__list-item div.pv-entity__summary-info"
  );
  const education = elementEducation
    ? Array.from(elementEducation).map((e) => {
        let [carer, ...grade] = Array.from(e.children[0].children).map(
          (el) => el.innerText
        );
        let grades = Array.from(grade);

        return {
          centro_estudio: carer,
          nivel_estudio: grades,
          periodo: e.children[1] ? e.children[1].innerText : "",
        };
      })
    : "";

  // Para obtener informacion de Contacto
  const elementContactInfo = document.querySelector(
    "div.ph5.pb5 > div.display-flex.mt2 ul.pv-top-card--list-bullet.mt1 a.ember-view"
  );

  if (elementContactInfo) elementContactInfo.click();

  await wait(2000);

  const elementLinkedinUrl = document.querySelector(
    "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-vanity-url a"
  );
  const linkedinUrl = elementLinkedinUrl ? elementLinkedinUrl.innerText : "";

  const elementEmailContact = document.querySelector(
    "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-email a"
  );
  const emailContact = elementEmailContact ? elementEmailContact.innerText : "";

  let personal = {
    name,
    title,
    resume,
    ubication,
    contact: { email: emailContact, linkedin: linkedinUrl },
  };

  // Datos :
  console.log({ personal, experience: allExperience, education });

  //Cerramos el modal
  const close = document.querySelector(
    "div.artdeco-modal > button.artdeco-modal__dismiss"
  );
  if (close) close.click();
};
