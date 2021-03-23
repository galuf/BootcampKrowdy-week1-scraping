const wait = function (milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
};

const clickMore = async (tagList) => {
  const button = document.querySelector(tagList);
  if (button) {
    button.click();
    await wait(2000);
  }
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

const createPopup = () => {
  const styleDiv =
    "position: fixed;z-index: 2000;width:100%; top: 0px;left: 0px;overflow: visible;display: flex;align-items: flex-end;background-color: lightgray;font-size: 10px;padding: 10px;";
  const stylePre =
    "position: relative;max-height: 400px;overflow: scroll;width: 100%;";
  const div = document.createElement("div");
  div.id = "krowdy-message";
  div.style = styleDiv;

  const pre = document.createElement("pre");
  pre.id = "krowdy-pre";
  pre.style = stylePre;

  const button = document.createElement("button");
  button.id = "krowdy-button";
  button.style = "background: gray;border: 2px solid;padding: 8px;";
  button.innerText = "Aceptar";

  const bodyElement = document.querySelector("body");

  bodyElement.appendChild(div);
  div.appendChild(pre);
  div.appendChild(button);
  return { div, pre, button };
};

const scrapingProfile = async () => {
  //Logic
  const selectorProfile = {
    personalInformation: {
      name: "div.ph5.pb5 > div.display-flex.mt2 ul li",
      title: "div.ph5.pb5 > div.display-flex.mt2 h2",
      resume: "section.pv-about-section > p",
      email:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-email a",
      webSite:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-websites a",
      urlLinkedin:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-vanity-url a",
      contactButton:
        "div.ph5.pb5 > div.display-flex.mt2 ul.pv-top-card--list-bullet.mt1 a.ember-view",
      closeContact: "div.artdeco-modal > button.artdeco-modal__dismiss",
    },
    experienceInformation: {
      list: "#experience-section > ul > li",
      showAll:
        ".pv-profile-section-pager section.experience-section  ul li.pv-profile-section__list-item button.pv-profile-section__see-more-inline",
      groupByCompany: {
        identify: ".pv-entity__position-group",
        company: "div.pv-entity__company-summary-info > h3 > span:nth-child(2)",
        list: "section > ul > li",
        title: "div > div > div > div > div > div > h3 > span:nth-child(2)",
        date:
          "div > div > div > div > div > div > div > h4 > span:nth-child(2)",
        description: ".pv-entity__description",
      },
      default: {
        title: "section > div > div > a > div.pv-entity__summary-info > h3",
        company:
          "section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title",
        date:
          "section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)",
        description: "section > div > div > div > p",
      },
    },
    educationInformation: {
      showAll:
        ".pv-profile-section-pager section.education-section  button.pv-profile-section__see-more-inline",
      list: "#education-section > ul > li",
      institution: "div > div > a > div.pv-entity__summary-info > div > h3",
      career:
        "div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)",
      date:
        "div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)",
    },
  };

  const clickOnMoreResume = async () => {
    const elementMoreResume = document.getElementById(
      "line-clamp-show-more-button"
    );
    if (elementMoreResume) elementMoreResume.click();
  };

  const getPersonalInformation = async () => {
    const { personalInformation: selector } = selectorProfile;
    const elementNameProfile = document.querySelector(selector.name);
    const elementNameTitle = document.querySelector(selector.title);
    const elementResume = document.querySelector(selector.resume);

    const name = elementNameProfile?.innerText;
    const title = elementNameTitle?.innerText;
    const resume = elementResume?.innerText;

    await clickMore(selector.contactButton);
    await wait(500);

    const elementEmail = document.querySelector(selector.email);
    const elementUrlLinkedin = document.querySelector(selector.urlLinkedin);
    //const elementWebSite = document.querySelector(selector.webSite);
    const email = elementEmail?.innerText;
    const urlLinkedin = elementUrlLinkedin?.innerText;
    //const webSite = elementWebSite?.innerHTML;

    return { name, title, email, urlLinkedin, resume };
  };

  const getExperienceInformation = async () => {
    const { experienceInformation: selector } = selectorProfile;
    //get information
    await clickMore(selector.showAll);
    await wait(1000);

    let experiencesRawList = document.querySelectorAll(selector.list);
    let experiencesRawArray = Array.from(experiencesRawList);

    const groupCompaniesList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length > 0;
    });

    const uniqueExperienceList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length == 0;
    });

    const experiences = uniqueExperienceList.map((el) => {
      const title = el.querySelector(selector.default.title)?.innerText;
      const date = el.querySelector(selector.default.date)?.innerText;
      const company = el.querySelector(selector.default.company)?.innerText;
      const description = el.querySelector(selector.default.description)
        ?.innerText;

      return { title, date, company, description };
    });

    for (let i = 0; i < groupCompaniesList.length; i++) {
      const item = groupCompaniesList[i];
      const company = item.querySelector(selector.groupByCompany.company)
        ?.innerText;
      const itemsCompanyGroupList = item.querySelectorAll(
        selector.groupByCompany.list
      );
      const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList);

      const experiencesData = itemsCompanyGroupArray.map((el) => {
        const title = el.querySelector(selector.groupByCompany.title)
          ?.innerText;
        const date = el.querySelector(selector.groupByCompany.date)?.innerText;
        const description = el.querySelector(
          selector.groupByCompany.description
        )?.innerText;

        return { title, date, company, description };
      });

      experiences.push(...experiencesData);
    }

    return experiences;
  };

  const getEducationInformation = async () => {
    const { educationInformation: selector } = selectorProfile;

    await clickMore(selector.showAll);
    await wait(1000);

    const educationItems = document.querySelectorAll(selector.list);
    const educationArray = Array.from(educationItems);
    const educations = educationArray.map((el) => {
      const institution = el.querySelector(selector.institution)?.innerText;
      const career = el.querySelector(selector.career)?.innerText;
      const date = el.querySelector(selector.date)?.innerText;
      return { institution, career, date };
    });
    return educations;
  };

  const createPopup = () => {
    const styleDiv =
      "position: fixed;z-index: 2000;width:100%; top: 0px;left: 0px;overflow: visible;display: flex;align-items: flex-end;background-color: lightgray;font-size: 10px;padding: 10px;";
    const stylePre =
      "position: relative;max-height: 400px;overflow: scroll;width: 100%;";
    const div = document.createElement("div");
    div.id = "krowdy-message";
    div.style = styleDiv;

    const pre = document.createElement("pre");
    pre.id = "krowdy-pre";
    pre.style = stylePre;

    // const button = document.createElement("button");

    // button.id = "krowdy-button";
    // button.style = "background: gray;border: 2px solid;padding: 8px;";
    // button.innerText = "Aceptar";

    const bodyElement = document.querySelector("div.body");

    bodyElement.appendChild(div);

    pre.innerText = "Estamos extrayendo la información!!!!";
    div.appendChild(pre);
    //div.appendChild(button);
    return { div, pre };
  };

  //Scroll to all information
  const { div, pre } = createPopup();

  pre.innerText = "Scaneando el perfil";
  await autoscrollToElement("body");
  await clickOnMoreResume();

  //Scraping Complete Profile
  const personalInformation = await getPersonalInformation();
  const experienceInformation = await getExperienceInformation();
  const educationInformation = await getEducationInformation();

  pre.innerText = "Ya tenemos las información del perfil";
  await wait(1000);

  //Setting data to send information
  const profile = {
    ...personalInformation,
    experiences: experienceInformation,
    educations: educationInformation,
  };

  return profile;
  // pre.innerText = JSON.stringify(profile, null, 2);

  // button.addEventListener("click", () => {
  //   //Necesito el fetch

  //   div.remove();
  // });
};

const scrapingManyProfiles = async () => {
  let results = document.querySelectorAll(
    "div.search-results-container div.pv2.artdeco-card.ph0.mb2 ul li div.entity-result__content span.entity-result__title-text a"
  );

  const buttonMore = "div.search-results__cluster-bottom-banner a";
  await clickMore(buttonMore);

  const profiles = [];

  for (let i = 0; i < results.length; i++) {
    //for (let i = 0; i < 1; i++) {
    await clickMore(buttonMore);
    let results = document.querySelectorAll(
      "div.search-results-container div.pv2.artdeco-card.ph0.mb2 ul li div.entity-result__content span.entity-result__title-text a"
    );
    await wait(500);

    results[i].click();
    await wait(1000);

    let elementNoAcces = document.querySelector(
      ".fr.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view"
    );
    if (elementNoAcces) {
      elementNoAcces.click();
      console.log("entro al no acces");
    } else {
      await wait(1000);
      let profile = await scrapingProfile();
      await wait(2000);
      profiles.push(profile);
      window.history.go(-2);
      await wait(2000);
    }
  }

  console.log(profiles);

  const { div, pre, button } = createPopup();

  pre.innerText = "Scraping Completado !!! ";
  await wait(500);

  pre.innerText = JSON.stringify(profiles, null, 2);

  button.addEventListener("click", () => {
    //Necesito el fetch

    div.remove();
  });
};

scrapingManyProfiles();
