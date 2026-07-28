document.addEventListener("DOMContentLoaded", function () {
  try {
  } catch (e) {}
});

window.addEventListener("load", function () {
  try {
    if (typeof checkInstallation === "function") checkInstallation();
  } catch (e) {}
});

async function cacheProfileImage(imageData) {
  try {
    localStorage.setItem("profileImage", imageData);

    const cache = await caches.open("profile-images-v1");
    const blob = await fetch(imageData).then((r) => r.blob());
    await cache.put(
      "profile-image",
      new Response(blob, {
        headers: { "Content-Type": "image/jpeg" },
      })
    );
  } catch (err) {
  }
}

async function loadCachedProfileImage() {
  try {
    var img = document.getElementById("profileImage");
    if (!img) return;

    try {
      const cache = await caches.open("profile-images-v1");
      const cachedResponse = await cache.match("profile-image");
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const objectURL = URL.createObjectURL(blob);
        img.src = objectURL;
        img.style.opacity = "1";
        return;
      }
    } catch (cacheErr) {
    }

    var savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      img.src = savedImage;
      img.style.opacity = "1";

      await cacheProfileImage(savedImage);
    }
  } catch (e) {
  }
}

(function () {
  try {
    var imageInput = document.getElementById("imageInput");
    if (imageInput) {
      imageInput.addEventListener("change", function (event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = async function (e) {
          var imageUrl = e.target && e.target.result;
          var img = document.getElementById("profileImage");
          if (img && imageUrl) {
            img.src = imageUrl;
            img.style.opacity = "1";
            await cacheProfileImage(imageUrl);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (e) {}
})();

window.addEventListener("load", function () {
  if (document.getElementById("profileImage")) {
    loadCachedProfileImage();
  }
});

function bindProfilePhotoPicker() {
  var img = document.getElementById("profileImage");
  var input = document.getElementById("imageInput");
  var hint = document.getElementById("photoHint");
  if (hint) hint.hidden = false;
  if (!img || !input || img.dataset.pickerBound === "1") return;
  img.dataset.pickerBound = "1";
  img.style.cursor = "pointer";
  img.addEventListener("click", function () {
    input.click();
  });
  img.setAttribute("role", "button");
  img.setAttribute("tabindex", "0");
  img.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });
}

window.bindProfilePhotoPicker = bindProfilePhotoPicker;

function initProfileDataEditor() {
  if (!document.getElementById("name")) return;
  if (window.__profileDataEditorInited) return;
  window.__profileDataEditorInited = true;

  try {
    var fieldMap = [
      ["name", "name"],
      ["surname", "surname"],
      ["nationality", "nationality"],
      ["birthDate", "birthDate"],
      ["pesel", "pesel"],
      ["lastName", "lastName"],
      ["gender", "gender"],
      ["fatherSurname", "fatherSurname"],
      ["motherSurname", "motherSurname"],
      ["placeOfBirth", "placeOfBirth"],
      ["address", "address"],
      ["postalcode", "postalcode"],
      ["registrationDate", "registrationDate"],
      ["idSeries", "md_idSeries"],
      ["expiryDate", "md_expiryDate"],
      ["issueDate", "md_issueDate"],
      ["idSeries_do", "do_idSeries"],
      ["issuingAuthority_do", "do_issuingAuthority"],
      ["expiryDate_do", "do_expiryDate"],
      ["issueDate_do", "do_issueDate"],
      ["fathername", "fathername"],
      ["mothername", "mothername"],
      ["name_diia", "diia_name"],
      ["surname_diia", "diia_surname"],
      ["birthDate_diia", "diia_birthDate"],
      ["pesel_diia", "diia_pesel"],
      ["placeOfBirth_diia", "diia_placeOfBirth"],
      ["countryOfOrigin_diia", "diia_countryOfOrigin"],
      ["nationality_diia", "diia_nationality"],
      ["display-name_legszk", "display-name_legszk"],
      ["display-surname_legszk", "display-surname_legszk"],
      ["display-birthDate_legszk", "display-birthDate_legszk"],
      ["display-pesel_legszk", "display-pesel_legszk"],
      ["display-cardNumber_legszk", "display-cardNumber_legszk"],
      ["display-issueDate_legszk", "display-issueDate_legszk"],
      ["display-expiryDate_legszk", "display-expiryDate_legszk"],
      ["display-schoolName_legszk", "display-schoolName_legszk"],
      ["display-schoolAddress_legszk", "display-schoolAddress_legszk"],
      ["display-schoolPhone_legszk", "display-schoolPhone_legszk"],
      ["display-schoolDirector_legszk", "display-schoolDirector_legszk"],
      ["display-name_legstu", "display-name_legstu"],
      ["display-surname_legstu", "display-surname_legstu"],
      ["display-birthDate_legstu", "display-birthDate_legstu"],
      ["display-pesel_legstu", "display-pesel_legstu"],
      ["display-dataWydania_legstu", "display-dataWydania_legstu"],
      ["display-uczelnia_legstu", "display-uczelnia_legstu"],
      ["display-albumNumber_legstu", "display-albumNumber_legstu"],
      ["display-name_prawojazdy", "display-name_prawojazdy"],
      ["display-surname_prawojazdy", "display-surname_prawojazdy"],
      ["display-birthDate_prawojazdy", "display-birthDate_prawojazdy"],
      ["display-birthPlace_prawojazdy", "display-birthPlace_prawojazdy"],
      ["display-pesel_prawojazdy", "display-pesel_prawojazdy"],
      ["display-category_prawojazdy", "display-category_prawojazdy"],
      ["display-expiryDate_prawojazdy", "display-expiryDate_prawojazdy"],
      ["display-issueDate_prawojazdy", "display-issueDate_prawojazdy"],
      ["display-blanketStatus_prawojazdy", "display-blanketStatus_prawojazdy"],
      [
        "display-documentNumber_prawojazdy",
        "display-documentNumber_prawojazdy",
      ],
      ["display-blanketNumber_prawojazdy", "display-blanketNumber_prawojazdy"],
      [
        "display-issuingAuthority_prawojazdy",
        "display-issuingAuthority_prawojazdy",
      ],
      ["display-restrictions_prawojazdy", "display-restrictions_prawojazdy"],
    ];

    var up = function (s) {
      if (s == null) return s;
      try {
        return String(s).toLocaleUpperCase("pl");
      } catch (_) {
        return String(s).toUpperCase();
      }
    };

    fieldMap.forEach(function (pair) {
      var id = pair[0],
        key = pair[1];
      var el = document.getElementById(id);
      if (!el) return;
      var val = localStorage.getItem(key);
      if (val != null && String(val).trim() !== "") el.value = val;
    });

    var saveField = function (key, val) {
      var s = String(val || "").trim();
      try {
        if (s) localStorage.setItem(key, s);
        else localStorage.removeItem(key);
      } catch (_) {}
    };

    fieldMap.forEach(function (pair) {
      var id = pair[0],
        key = pair[1];
      var el = document.getElementById(id);
      if (!el) return;
      var tag = (el.tagName || "").toLowerCase();
      if (tag === "select") {
        el.addEventListener("change", function () {
          saveField(key, up(el.value));
        });
      } else if (tag === "input") {
        var type = (el.getAttribute("type") || "").toLowerCase();
        if (type === "text") {
          el.addEventListener("input", function () {
            convertToUpperCase(el);
            saveField(key, el.value);
          });
        } else {
          el.addEventListener("change", function () {
            saveField(key, el.value);
          });
        }
      }
    });

    var fixedPrawoJazdy = [
      {
        id: "display-expiryDate_prawojazdy",
        key: "display-expiryDate_prawojazdy",
        value: "Bezterminowo",
      },
      {
        id: "display-blanketStatus_prawojazdy",
        key: "display-blanketStatus_prawojazdy",
        value: "Wydany",
      },
      {
        id: "display-restrictions_prawojazdy",
        key: "display-restrictions_prawojazdy",
        value: "Brak",
      },
    ];

    fixedPrawoJazdy.forEach(function (item) {
      var el = document.getElementById(item.id);
      if (!el) return;
      try {
        el.value = item.value;
        el.readOnly = true;
        el.setAttribute("aria-readonly", "true");
        var type = (el.getAttribute("type") || "").toLowerCase();
        if (type === "date") el.setAttribute("type", "text");
      } catch (_) {}
      saveField(item.key, item.value);
    });

    bindProfilePhotoPicker();
    if (typeof switchTab === "function") switchTab("mdowod");
  } catch (e) {}
}

window.initProfileDataEditor = initProfileDataEditor;

document.addEventListener("DOMContentLoaded", function () {
  initProfileDataEditor();
});

function convertToUpperCase(input) {
  if (!input) return;
  input.value = String(input.value || "").toUpperCase();
}

window.convertToUpperCase = convertToUpperCase;

function saveData(options) {
  var silent = options && options.silent;
  var ok = true;
  var lastError = "";
  try {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value : "";
    };
    var put = function (key, val) {
      var s = String(val || "").trim();
      try {
        if (s) localStorage.setItem(key, s);
        else localStorage.removeItem(key);
      } catch (e) {
        ok = false;
        lastError = e && e.message ? e.message : "";
      }
    };

    put("name", get("name"));
    put("surname", get("surname"));
    put("nationality", get("nationality"));
    put("birthDate", get("birthDate"));
    put("pesel", get("pesel"));
    put("lastName", get("lastName"));
    put("gender", get("gender"));
    put("fatherSurname", get("fatherSurname"));
    put("motherSurname", get("motherSurname"));
    put("placeOfBirth", get("placeOfBirth"));
    put("address", get("address"));
    put("postalcode", get("postalcode"));
    put("registrationDate", get("registrationDate"));
    put("md_idSeries", get("idSeries"));
    put("md_expiryDate", get("expiryDate"));
    put("md_issueDate", get("issueDate"));
    put("do_idSeries", get("idSeries_do"));
    put("do_issuingAuthority", get("issuingAuthority_do"));
    put("do_expiryDate", get("expiryDate_do"));
    put("do_issueDate", get("issueDate_do"));
    put("fathername", get("fathername"));
    put("mothername", get("mothername"));
    put("diia_name", get("name_diia"));
    put("diia_surname", get("surname_diia"));
    put("diia_birthDate", get("birthDate_diia"));
    put("diia_pesel", get("pesel_diia"));
    put("diia_placeOfBirth", get("placeOfBirth_diia"));
    put("diia_countryOfOrigin", get("countryOfOrigin_diia"));
    put("diia_nationality", get("nationality_diia"));
    put("display-name_legszk", get("display-name_legszk"));
    put("display-surname_legszk", get("display-surname_legszk"));
    put("display-birthDate_legszk", get("display-birthDate_legszk"));
    put("display-pesel_legszk", get("display-pesel_legszk"));
    put("display-cardNumber_legszk", get("display-cardNumber_legszk"));
    put("display-issueDate_legszk", get("display-issueDate_legszk"));
    put("display-expiryDate_legszk", get("display-expiryDate_legszk"));
    put("display-schoolName_legszk", get("display-schoolName_legszk"));
    put("display-schoolAddress_legszk", get("display-schoolAddress_legszk"));
    put("display-schoolPhone_legszk", get("display-schoolPhone_legszk"));
    put("display-schoolDirector_legszk", get("display-schoolDirector_legszk"));
    put("display-name_legstu", get("display-name_legstu"));
    put("display-surname_legstu", get("display-surname_legstu"));
    put("display-birthDate_legstu", get("display-birthDate_legstu"));
    put("display-pesel_legstu", get("display-pesel_legstu"));
    put("display-dataWydania_legstu", get("display-dataWydania_legstu"));
    put("display-uczelnia_legstu", get("display-uczelnia_legstu"));
    put("display-albumNumber_legstu", get("display-albumNumber_legstu"));
    put("display-name_prawojazdy", get("display-name_prawojazdy"));
    put("display-surname_prawojazdy", get("display-surname_prawojazdy"));
    put("display-birthDate_prawojazdy", get("display-birthDate_prawojazdy"));
    put(
      "display-birthPlace_prawojazdy",
      get("display-birthPlace_prawojazdy")
    );
    put("display-pesel_prawojazdy", get("display-pesel_prawojazdy"));
    put("display-category_prawojazdy", get("display-category_prawojazdy"));
    put("display-expiryDate_prawojazdy", "Bezterminowo");
    put("display-issueDate_prawojazdy", get("display-issueDate_prawojazdy"));
    put(
      "display-blanketStatus_prawojazdy",
      "Wydany"
    );
    put(
      "display-documentNumber_prawojazdy",
      get("display-documentNumber_prawojazdy")
    );
    put(
      "display-blanketNumber_prawojazdy",
      get("display-blanketNumber_prawojazdy")
    );
    put(
      "display-issuingAuthority_prawojazdy",
      get("display-issuingAuthority_prawojazdy")
    );
    put(
      "display-restrictions_prawojazdy",
      "Brak"
    );

  } catch (e) {
    ok = false;
    lastError = e && e.message ? e.message : "";
  }

  if (!silent) {
    if (ok) {
      alert("Zapisano dane.");
    } else if (lastError) {
      alert("Nie zapisano danych: " + lastError);
    } else {
      alert("Nie zapisano danych. Sprawdź ustawienia przeglądarki.");
    }
  }
}

window.saveData = saveData;

function generatePesel() {
  const birthDate = document.getElementById("birthDate").value;
  const gender = document.getElementById("gender").value;

  if (!birthDate || !gender) {
    alert("Wypełnij datę urodzenia i płeć");
    return;
  }

  const [year, month, day] = birthDate.split("-");
  let yy = year.slice(2);
  let mm = parseInt(month);

  if (parseInt(year) >= 2000) mm += 20;

  const serial = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const genderDigit =
    gender === "MĘŻCZYZNA"
      ? String(1 + Math.floor(Math.random() * 5) * 2) 

      : String(0 + Math.floor(Math.random() * 5) * 2); 

  const base = yy + String(mm).padStart(2, "0") + day + serial + genderDigit;

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(base[i]) * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;

  const pesel = base + checksum;
  document.getElementById("pesel").value = pesel;
}

window.generatePesel = generatePesel;

function generatePeselDiia() {
  const birthDate = document.getElementById("birthDate_diia").value;
  const gender = document.getElementById("gender_diia").value;

  if (!birthDate) {
    alert("Wypełnij datę urodzenia");
    return;
  }

  const [year, month, day] = birthDate.split("-");
  let yy = year.slice(2);
  let mm = parseInt(month);

  if (parseInt(year) >= 2000) mm += 20;

  const serial = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  let genderDigit;
  if (gender === "MĘŻCZYZNA") {
    genderDigit = String(1 + Math.floor(Math.random() * 5) * 2);
  } else if (gender === "KOBIETA") {
    genderDigit = String(0 + Math.floor(Math.random() * 5) * 2);
  } else {
    genderDigit = String(Math.floor(Math.random() * 10));
  }

  const base = yy + String(mm).padStart(2, "0") + day + serial + genderDigit;

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(base[i]) * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;

  const pesel = base + checksum;
  document.getElementById("pesel_diia").value = pesel;
window.generatePeselDiia = generatePeselDiia;

}

function generateMDowodNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += letters[Math.floor(Math.random() * 26)];
  }
  for (let i = 0; i < 5; i++) {
    result += Math.floor(Math.random() * 10);
  }
  document.getElementById("idSeries").value = result;
window.generateMDowodNumber = generateMDowodNumber;

}

function generateDowodNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += letters[Math.floor(Math.random() * 26)];
  }
  for (let i = 0; i < 6; i++) {
    result += Math.floor(Math.random() * 10);
window.generateDowodNumber = generateDowodNumber;

  }
  document.getElementById("idSeries_do").value = result;
}

function generateAllData() {
  const maleNames = [
    "JAN",
    "PIOTR",
    "KRZYSZTOF",
    "ANDRZEJ",
    "TOMASZ",
    "PAWEŁ",
    "MARCIN",
    "MICHAŁ",
    "JAKUB",
    "MATEUSZ",
    "ADAM",
    "ŁUKASZ",
    "KAMIL",
    "ROBERT",
    "MAREK",
    "WOJCIECH",
    "DANIEL",
    "SEBASTIAN",
    "BARTOSZ",
    "GRZEGORZ",
  ];
  const femaleNames = [
    "ANNA",
    "MARIA",
    "KATARZYNA",
    "MAŁGORZATA",
    "JOANNA",
    "EWA",
    "BARBARA",
    "AGNIESZKA",
    "MAGDALENA",
    "MONIKA",
    "KAROLINA",
    "NATALIA",
    "ALEKSANDRA",
    "JULIA",
    "PAULINA",
    "MARTYNA",
    "ZOFIA",
    "WIKTORIA",
    "ZUZANNA",
    "ALEKSANDRA",
  ];
  const maleSurnames = [
    "NOWAK",
    "KOWALSKI",
    "WIŚNIEWSKI",
    "WÓJCIK",
    "KOWALCZYK",
    "KAMIŃSKI",
    "LEWANDOWSKI",
    "ZIELIŃSKI",
    "SZYMAŃSKI",
    "WOŹNIAK",
    "DĄBROWSKI",
    "KOZŁOWSKI",
    "JANKOWSKI",
    "MAZUR",
    "KWIATKOWSKI",
    "KRAWCZYK",
    "KACZMAREK",
    "PIOTROWSKI",
    "GRABOWSKI",
    "NOWAKOWSKI",
  ];
  const femaleSurnames = [
    "NOWAK",
    "KOWALSKA",
    "WIŚNIEWSKA",
    "WÓJCIK",
    "KOWALCZYK",
    "KAMIŃSKA",
    "LEWANDOWSKA",
    "ZIELIŃSKA",
    "SZYMAŃSKA",
    "WOŹNIAK",
    "DĄBROWSKA",
    "KOZŁOWSKA",
    "JANKOWSKA",
    "MAZUR",
    "KWIATKOWSKA",
    "KRAWCZYK",
    "KACZMAREK",
    "PIOTROWSKA",
    "GRABOWSKA",
    "NOWAKOWSKA",
  ];
  const cities = [
    "WARSZAWA",
    "KRAKÓW",
    "POZNAŃ",
    "WROCŁAW",
    "GDAŃSK",
    "ŁÓDŹ",
    "KATOWICE",
    "SZCZECIN",
    "LUBLIN",
    "BYDGOSZCZ",
  ];
  const streets = [
    "GŁÓWNA",
    "KRÓTKA",
    "DŁUGA",
    "POLNA",
    "SŁONECZNA",
    "KWIATOWA",
    "LEŚNA",
    "PARKOWA",
    "OGRODOWA",
    "SPACEROWA",
  ];

  const gender = document.getElementById("gender").value;
  if (!gender) {
    alert("⚠ Najpierw wybierz płeć!");
    return;
  }

  const isMale = gender === "MĘŻCZYZNA";

  const firstName = isMale
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];

  const surname = isMale
    ? maleSurnames[Math.floor(Math.random() * maleSurnames.length)]
    : femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];

  document.getElementById("name").value = firstName;
  document.getElementById("surname").value = surname;
  document.getElementById("lastName").value = surname;

  document.getElementById("nationality").value = "POLSKIE";

  const today = new Date();
  const birthDateObj1 = new Date(today);
  birthDateObj1.setFullYear(birthDateObj1.getFullYear() - 18);
  const daysBack = 30 + Math.floor(Math.random() * (320 - 30 + 1));
  birthDateObj1.setDate(birthDateObj1.getDate() - daysBack);
  const birthDate = birthDateObj1.toISOString().split("T")[0];
  document.getElementById("birthDate").value = birthDate;

  generatePesel();

  const doIssueDate = new Date(today);
  doIssueDate.setDate(
    doIssueDate.getDate() - Math.floor(Math.random() * 365 + 365)
  );
  const doIssueDateStr = doIssueDate.toISOString().split("T")[0];
  document.getElementById("issueDate_do").value = doIssueDateStr;

  const doExpiryDate = new Date(doIssueDate);
  doExpiryDate.setFullYear(doExpiryDate.getFullYear() + 10);
  document.getElementById("expiryDate_do").value = doExpiryDate
    .toISOString()
    .split("T")[0];

  const mdIssueDate = new Date(today);
  mdIssueDate.setDate(mdIssueDate.getDate() - Math.floor(Math.random() * 365));
  const mdIssueDateStr = mdIssueDate.toISOString().split("T")[0];
  document.getElementById("issueDate").value = mdIssueDateStr;

  const mdExpiryDate = new Date(mdIssueDate);
  mdExpiryDate.setFullYear(mdExpiryDate.getFullYear() + 5);
  document.getElementById("expiryDate").value = mdExpiryDate
    .toISOString()
    .split("T")[0];

  generateMDowodNumber();

  generateDowodNumber();

  const city = cities[Math.floor(Math.random() * cities.length)];
  document.getElementById(
    "issuingAuthority_do"
  ).value = `PREZYDENT MIASTA ${city}`;

  const fatherName = maleNames[Math.floor(Math.random() * maleNames.length)];
  const motherName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
  document.getElementById("fathername").value = fatherName;
  document.getElementById("mothername").value = motherName;

  const fatherSurname =
    maleSurnames[Math.floor(Math.random() * maleSurnames.length)];
  const motherSurname =
    femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];
  document.getElementById("fatherSurname").value = fatherSurname;
  document.getElementById("motherSurname").value = motherSurname;

  document.getElementById("placeOfBirth").value = city;

  const street = streets[Math.floor(Math.random() * streets.length)];
  const houseNum = Math.floor(Math.random() * 100) + 1;
  const flatNum =
    Math.random() < 0.7 ? "/" + (Math.floor(Math.random() * 50) + 1) : "";
  document.getElementById(
    "address"
  ).value = `UL. ${street} ${houseNum}${flatNum}`;

  const postalFirst = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  const postalSecond = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  document.getElementById(
    "postalcode"
  ).value = `${postalFirst}-${postalSecond} ${city}`;

  const birthDateObj2 = new Date(birthDate);
  const endOfYear2024 = new Date(2024, 11, 31);
  const registrationTimestamp =
    birthDateObj2.getTime() +
    Math.random() * (endOfYear2024.getTime() - birthDateObj2.getTime());
  const registrationDate = new Date(registrationTimestamp);
  document.getElementById("registrationDate").value = registrationDate
    .toISOString()
    .split("T")[0];
window.generateAllData = generateAllData;


  saveData({ silent: true });

  alert("Dane wygenerowano!");
}

function generateAllDataDiia() {
  const maleNames = [
    "OLEKSANDR",
    "ANDRIY",
    "VASYL",
    "DMYTRO",
    "IVAN",
    "MAKSYM",
    "MYKHAILO",
    "OLEH",
    "PETRO",
    "SERHIY",
    "TARAS",
    "VIKTOR",
    "VOLODYMYR",
    "YURIY",
    "BOHDAN",
    "IHOR",
    "ARTEM",
    "DENYS",
    "YEVHEN",
    "ROMAN",
  ];
  const femaleNames = [
    "OLENA",
    "IRYNA",
    "NATALIA",
    "TETIANA",
    "OKSANA",
    "MARIA",
    "HANNA",
    "SVITLANA",
    "YULIA",
    "VALENTYNA",
    "LIUBOV",
    "HALYNA",
    "VIKTORIA",
    "KATERYNA",
    "ANASTASIA",
    "DARYNA",
    "SOFIA",
    "VIRA",
    "LARYSA",
    "LIUDMYLA",
  ];
  const maleSurnames = [
    "MELNYK",
    "SHEVCHENKO",
    "BOIKO",
    "KOVALENKO",
    "BONDARENKO",
    "TKACHENKO",
    "KRAVCHENKO",
    "KOVALCHUK",
    "OLIYNYK",
    "SHEVCHUK",
    "KOVAL",
    "POLISHCHUK",
    "PETRENKO",
    "LYTVYN",
    "MARCHENKO",
    "HONCHARENKO",
    "ROMANENKO",
    "SEMENENKO",
    "LYSENKO",
    "IVANENKO",
  ];
  const femaleSurnames = [
    "MELNYK",
    "SHEVCHENKO",
    "BOIKO",
    "KOVALENKO",
    "BONDARENKO",
    "TKACHENKO",
    "KRAVCHENKO",
    "KOVALCHUK",
    "OLIYNYK",
    "SHEVCHUK",
    "KOVAL",
    "POLISHCHUK",
    "PETRENKO",
    "LYTVYN",
    "MARCHENKO",
    "HONCHARENKO",
    "ROMANENKO",
    "SEMENENKO",
    "LYSENKO",
    "IVANENKO",
  ];
  const cities = [
    "KYIV",
    "KHARKIV",
    "ODESA",
    "DNIPRO",
    "DONETSK",
    "ZAPORIZHZHIA",
    "LVIV",
    "KRYVYI RIH",
    "MYKOLAIV",
    "MARIUPOL",
    "LUHANSK",
    "VINNYTSIA",
    "KHERSON",
    "POLTAVA",
    "CHERNIHIV",
  ];

  const gender = document.getElementById("gender_diia").value;
  if (!gender) {
    alert("⚠ Najpierw wybierz płeć!");
    return;
  }

  const isMale = gender === "MĘŻCZYZNA";

  const firstName = isMale
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];

  const surname = isMale
    ? maleSurnames[Math.floor(Math.random() * maleSurnames.length)]
    : femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];

  document.getElementById("name_diia").value = firstName;
  document.getElementById("surname_diia").value = surname;

  const today = new Date();
  const birthDateObj = new Date(today);
  birthDateObj.setFullYear(birthDateObj.getFullYear() - 18);
  const daysBack = 30 + Math.floor(Math.random() * (320 - 30 + 1));
  birthDateObj.setDate(birthDateObj.getDate() - daysBack);
  const birthDate = birthDateObj.toISOString().split("T")[0];
  document.getElementById("birthDate_diia").value = birthDate;

  generatePeselDiia();

  const city = cities[Math.floor(Math.random() * cities.length)];
  document.getElementById("placeOfBirth_diia").value = city;

  document.getElementById("countryOfOrigin_diia").value = "UKRAINA";
  document.getElementById("nationality_diia").value = "UKRAIŃSKIE";

  saveData({ silent: true });

  alert("Dane wygenerowano!");
}

window.generateAllDataDiia = generateAllDataDiia;

function generatePeselFromDate(birthDateStr, gender) {
  const [year, month, day] = birthDateStr.split("-");
  let yy = year.slice(2);
  let mm = parseInt(month);

  if (parseInt(year) >= 2000) mm += 20;

  const serial = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const genderDigit =
    gender === "MĘŻCZYZNA"
      ? String(1 + Math.floor(Math.random() * 5) * 2) 

      : String(0 + Math.floor(Math.random() * 5) * 2); 

  const base = yy + String(mm).padStart(2, "0") + day + serial + genderDigit;

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(base[i]) * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;

  return base + checksum;
}

function generatePeselLegszk() {
  const birthDate = document.getElementById("display-birthDate_legszk").value;
  const gender = document.getElementById("gender_legszk").value;

  if (!birthDate || !gender) {
    alert("Wypełnij datę urodzenia i płeć");
    return;
  }

  const pesel = generatePeselFromDate(birthDate, gender);
  document.getElementById("display-pesel_legszk").value = pesel;
}

window.generatePeselLegszk = generatePeselLegszk;

function generatePeselLegstu() {
  const birthDate = document.getElementById("display-birthDate_legstu").value;
  const gender = document.getElementById("gender_legstu").value;

  if (!birthDate || !gender) {
    alert("Wypełnij datę urodzenia i płeć");
    return;
  }

  const pesel = generatePeselFromDate(birthDate, gender);
  document.getElementById("display-pesel_legstu").value = pesel;
}

window.generatePeselLegstu = generatePeselLegstu;

function generatePeselPrawojazdy() {
  const birthDate = document.getElementById("display-birthDate_prawojazdy")
    .value;
  const gender = document.getElementById("gender_prawojazdy").value;

  if (!birthDate || !gender) {
    alert("Wypełnij datę urodzenia i płeć");
    return;
  }

  const pesel = generatePeselFromDate(birthDate, gender);
  document.getElementById("display-pesel_prawojazdy").value = pesel;
}

window.generatePeselPrawojazdy = generatePeselPrawojazdy;

function generateAllDataLegszk() {
  const maleNames = ["JAN", "PIOTR", "PAWEŁ", "TOMASZ", "MICHAŁ", "KRZYSZTOF"];
  const femaleNames = ["ANNA", "MARIA", "KATARZYNA", "EWA", "ZOFIA", "MONIKA"];
  const maleSurnames = ["KOWALSKI", "NOWAK", "WIŚNIEWSKI", "WÓJCIK", "KAMIŃSKI"];
  const femaleSurnames = ["KOWALSKA", "NOWAK", "WIŚNIEWSKA", "WÓJCIK", "KAMIŃSKA"];
  const directorNames = maleNames.concat(femaleNames);
  const directorSurnames = maleSurnames.concat(femaleSurnames);
  const schools = ["SZKOŁA PODSTAWOWA NR 1", "SZKOŁA PODSTAWOWA NR 5", "GIMNAZJUM NR 3"];
  const cities = ["WARSZAWA", "KRAKÓW", "GDAŃSK", "WROCŁAW", "POZNAŃ"];

  const genderSelect = document.getElementById("gender_legszk");
  let gender =
    (genderSelect && genderSelect.value) ||
    (Math.random() > 0.5 ? "MĘŻCZYZNA" : "KOBIETA");
  if (genderSelect) genderSelect.value = gender;

  const selectedNames = gender === "MĘŻCZYZNA" ? maleNames : femaleNames;
  const selectedSurnames = gender === "MĘŻCZYZNA" ? maleSurnames : femaleSurnames;

  document.getElementById("display-name_legszk").value =
    selectedNames[Math.floor(Math.random() * selectedNames.length)];
  document.getElementById("display-surname_legszk").value =
    selectedSurnames[Math.floor(Math.random() * selectedSurnames.length)];

  const today = new Date();
  const birthDate = new Date(today);
  birthDate.setFullYear(birthDate.getFullYear() - 18);
  const daysBack = 30 + Math.floor(Math.random() * (320 - 30 + 1));
  birthDate.setDate(birthDate.getDate() - daysBack);
  const birthDateStr = birthDate.toISOString().split("T")[0];
  document.getElementById("display-birthDate_legszk").value = birthDateStr;

  const pesel = generatePeselFromDate(birthDateStr, gender);
  document.getElementById("display-pesel_legszk").value = pesel;

  const num1 = String(Math.floor(1000 + Math.random() * 9000));
  const num2 = String(Math.floor(10 + Math.random() * 90));
  document.getElementById("display-cardNumber_legszk").value = `${num1}/${num2}`;

  const issueDate = new Date();
  document.getElementById("display-issueDate_legszk").value = issueDate
    .toISOString()
    .split("T")[0];

  const todayForExpiry = new Date();
  let expiryDate = new Date(todayForExpiry.getFullYear(), 8, 30);

  if (todayForExpiry > expiryDate) {
    expiryDate = new Date(todayForExpiry.getFullYear() + 1, 8, 30);
  }

  document.getElementById("display-expiryDate_legszk").value = expiryDate
    .toISOString()
    .split("T")[0];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const postalCode = `${String(Math.floor(Math.random() * 90) + 10).padStart(
    2,
    "0"
  )}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
  document.getElementById("display-schoolName_legszk").value =
    schools[Math.floor(Math.random() * schools.length)];
  document.getElementById("display-schoolAddress_legszk").value = `UL. SZKOLNA ${Math.floor(
    1 + Math.random() * 50
  )}, ${postalCode} ${city}`;
  const phoneArea = ["22", "12", "58", "61", "71", "81", "91"][
    Math.floor(Math.random() * 7)
  ];
  const phoneMid = `${Math.floor(Math.random() * 900 + 100)}`;
  const phoneTail = `${Math.floor(Math.random() * 90 + 10)} ${Math.floor(
    Math.random() * 90 + 10
  )}`;
  document.getElementById("display-schoolPhone_legszk").value = `${phoneArea} ${phoneMid} ${phoneTail}`;
  document.getElementById("display-schoolDirector_legszk").value =
    directorNames[Math.floor(Math.random() * directorNames.length)] +
    " " +
    directorSurnames[Math.floor(Math.random() * directorSurnames.length)];

  saveData({ silent: true });
  alert("Dane wygenerowano!");
}

window.generateAllDataLegszk = generateAllDataLegszk;

function generateAllDataLegstu() {
  const maleNames = ["JAN", "PIOTR", "PAWEŁ", "TOMASZ", "MICHAŁ", "ADAM"];
  const femaleNames = ["ANNA", "MARIA", "KATARZYNA", "EWA", "ZOFIA", "NATALIA"];
  const maleSurnames = ["KOWALSKI", "NOWAK", "WIŚNIEWSKI", "WÓJCIK", "KAMIŃSKI"];
  const femaleSurnames = ["KOWALSKA", "NOWAK", "WIŚNIEWSKA", "WÓJCIK", "KAMIŃSKA"];
  const universities = [
    "UNIWERSYTET WARSZAWSKI",
    "POLITECHNIKA WARSZAWSKA",
    "UNIWERSYTET JAGIELLOŃSKI",
    "AGH",
  ];

  const genderSelect = document.getElementById("gender_legstu");
  let gender =
    (genderSelect && genderSelect.value) ||
    (Math.random() > 0.5 ? "MĘŻCZYZNA" : "KOBIETA");
  if (genderSelect) genderSelect.value = gender;

  const selectedNames = gender === "MĘŻCZYZNA" ? maleNames : femaleNames;
  const selectedSurnames = gender === "MĘŻCZYZNA" ? maleSurnames : femaleSurnames;

  document.getElementById("display-name_legstu").value =
    selectedNames[Math.floor(Math.random() * selectedNames.length)];
  document.getElementById("display-surname_legstu").value =
    selectedSurnames[Math.floor(Math.random() * selectedSurnames.length)];

  const today = new Date();
  const birthDate = new Date(today);
  birthDate.setFullYear(birthDate.getFullYear() - 18);
  const daysBack = 30 + Math.floor(Math.random() * (320 - 30 + 1));
  birthDate.setDate(birthDate.getDate() - daysBack);
  const birthDateStr = birthDate.toISOString().split("T")[0];
  document.getElementById("display-birthDate_legstu").value = birthDateStr;

  const pesel = generatePeselFromDate(birthDateStr, gender);
  document.getElementById("display-pesel_legstu").value = pesel;

  const issueDate = new Date();
  document.getElementById("display-dataWydania_legstu").value = issueDate
    .toISOString()
    .split("T")[0];

  document.getElementById("display-uczelnia_legstu").value =
    universities[Math.floor(Math.random() * universities.length)];
  document.getElementById("display-albumNumber_legstu").value = String(
    Math.floor(Math.random() * 1000000)
  ).padStart(6, "0");

  saveData({ silent: true });
  alert("Dane wygenerowano!");
}

window.generateAllDataLegstu = generateAllDataLegstu;

function generateAllDataPrawojazdy() {
  const maleNames = ["JAN", "PIOTR", "PAWEŁ", "TOMASZ", "MICHAŁ", "ADAM"];
  const femaleNames = ["ANNA", "MARIA", "KATARZYNA", "EWA", "ZOFIA", "AGNIESZKA"];
  const maleSurnames = ["KOWALSKI", "NOWAK", "WIŚNIEWSKI", "WÓJCIK", "KAMIŃSKI"];
  const femaleSurnames = ["KOWALSKA", "NOWAK", "WIŚNIEWSKA", "WÓJCIK", "KAMIŃSKA"];
  const birthCities = [
    "WARSZAWA",
    "KRAKÓW",
    "POZNAŃ",
    "LUBLIN",
    "ŁÓDŹ",
    "GDAŃSK",
    "SZCZECIN",
    "BYDGOSZCZ",
    "RZESZÓW",
    "OPOLE",
  ];

  const genderSelect = document.getElementById("gender_prawojazdy");
  let gender =
    (genderSelect && genderSelect.value) ||
    (Math.random() > 0.5 ? "MĘŻCZYZNA" : "KOBIETA");
  if (genderSelect) genderSelect.value = gender;

  const selectedNames = gender === "MĘŻCZYZNA" ? maleNames : femaleNames;
  const selectedSurnames = gender === "MĘŻCZYZNA" ? maleSurnames : femaleSurnames;

  document.getElementById("display-name_prawojazdy").value =
    selectedNames[Math.floor(Math.random() * selectedNames.length)];
  document.getElementById("display-surname_prawojazdy").value =
    selectedSurnames[Math.floor(Math.random() * selectedSurnames.length)];

  const today = new Date();
  const birthDate = new Date(today);
  birthDate.setFullYear(birthDate.getFullYear() - 18);
  const daysBack = 30 + Math.floor(Math.random() * (320 - 30 + 1));
  birthDate.setDate(birthDate.getDate() - daysBack);
  const birthDateStr = birthDate.toISOString().split("T")[0];
  document.getElementById("display-birthDate_prawojazdy").value = birthDateStr;
  document.getElementById("display-birthPlace_prawojazdy").value =
    birthCities[Math.floor(Math.random() * birthCities.length)];

  const pesel = generatePeselFromDate(birthDateStr, gender);
  document.getElementById("display-pesel_prawojazdy").value = pesel;

  const issueDate = new Date();
  issueDate.setFullYear(issueDate.getFullYear() - Math.floor(Math.random() * 5));
  document.getElementById("display-issueDate_prawojazdy").value = issueDate
    .toISOString()
    .split("T")[0];

  const docNumber = `${String(Math.floor(Math.random() * 100000)).padStart(
    5,
    "0"
  )}/${String(Math.floor(Math.random() * 100)).padStart(2, "0")}/${String(
    Math.floor(Math.random() * 10000)
  ).padStart(4, "0")}`;
  document.getElementById("display-documentNumber_prawojazdy").value = docNumber;
  document.getElementById("display-blanketNumber_prawojazdy").value = `${String.fromCharCode(
    65 + Math.floor(Math.random() * 26)
  )}${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`;
  const authorityCities = [
    "Warszawie",
    "Lublinie",
    "Poznaniu",
    "Krakowie",
    "Gdańsku",
    "Wrocławiu",
    "Szczecinie",
  ];
  const authorityCity =
    authorityCities[Math.floor(Math.random() * authorityCities.length)];
  document.getElementById(
    "display-issuingAuthority_prawojazdy"
  ).value = `Starostwo Powiatowe w ${authorityCity}`;
  saveData({ silent: true });
  try {
    localStorage.setItem("pj_generatedAt", String(Date.now()));
  } catch (_) {}
  alert("Dane wygenerowano!");
}

window.generateAllDataPrawojazdy = generateAllDataPrawojazdy;

function switchTab(tab) {
  const tabs = ["mdowod", "diia", "legszk", "legstu", "prawojazdy"];

  tabs.forEach((t) => {
    const tabBtn = document.getElementById(`${t}-tab`);
    if (tabBtn) {
      const active = tab === t;
      tabBtn.classList.toggle("tab-active", active);
      tabBtn.setAttribute("aria-selected", active ? "true" : "false");
    }
    const content = document.getElementById(`${t}-content`);
    if (content) content.style.display = tab === t ? "block" : "none";
  });
}

window.switchTab = switchTab;
