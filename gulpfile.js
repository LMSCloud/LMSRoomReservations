const gulp = require("gulp");
const release = require("gulp-github-release");
const fs = require("fs");
const run = require("gulp-run");
const dateTime = require("node-datetime");
const po2json = require("po2json");

const dt = dateTime.create();
const today = dt.format("Y-m-d");

const packageJson = JSON.parse(fs.readFileSync("./package.json"));
const releaseFilename = `${packageJson.name}-v${packageJson.version}.kpz`;

const pmFile = "RoomReservations.pm";
const pmFilePath = "Koha/Plugin/Com/LMSCloud/";
// const pmFilePathFull = pmFilePath + pmFile;
const pmFilePathDist = `dist/${pmFilePath}`;
const pmFilePathFullDist = pmFilePathDist + pmFile;

const localeNamespace = "com.lmscloud.roomreservations";

console.log(releaseFilename);
console.log(pmFilePathFullDist);

gulp.task("translations", (done) => {
  /** First we create json files for all locales under locales/ using po2json  */
  try {
    fs.readdir("locales", (err, files) => {
      if (err) {
        throw Error(err);
      }
      /** We move the mo files to the bundle's locales dir for perl */
      files
        .filter((file) => file.endsWith(".mo"))
        .forEach((file) => {
          const [locale] = file.split(".");
          fs.copyFileSync(
            `locales/${file}`,
            `${pmFilePath}/${pmFile.replace(".pm", "")}/locales/${locale}/LC_MESSAGES/${localeNamespace}.mo`
          );
        });

      /** Then we need to parse the po files and convert them to json
       *  before we can use them with gettext.js*/
      files
        .filter((file) => file.endsWith(".po"))
        .forEach((file) => {
          const locale = file.split(".")[0];
          const localesPath = `${pmFilePath}/${pmFile.replace(
            ".pm",
            ""
          )}/locales`;
          if (!fs.existsSync(localesPath)) {
            fs.mkdirSync(localesPath);
          }
          const jsonFile = `${localesPath}/${locale}.json`;
          po2json.parseFile(
            `locales/${file}`,
            { format: "mf" },
            (err, data) => {
              if (err) {
                throw Error(err);
              }
              /** We need to add metadata to the jsonFile for
               *  compatibility with gettext.js:
               * "": {
               *  "language": "locale",
               *  "plural-forms": "nplurals=2; plural=n>1"
               * }
               */
              data[""] = {
                language: locale,
                "plural-forms": "nplurals=2; plural=n>1",
              };
              fs.writeFile(jsonFile, JSON.stringify(data), (err) => {
                if (err) {
                  throw Error(err);
                }
              });
            }
          );
        });
    });
    done();
  } catch (err) {
    throw Error(err);
  }
});

gulp.task(
  "build",
  () =>
    new Promise((resolve) => {
      run(`
      mkdir dist ;
      cp -r Koha dist/. ;
      sed -i -e "s/{MINIMUM_VERSION}/${packageJson.minimum_koha_version}/g" ${pmFilePathFullDist} ;
      sed -i -e "s/{VERSION}/${packageJson.version}/g" ${pmFilePathFullDist} ;
      sed -i -e "s/1900-01-01/${today}/g" ${pmFilePathFullDist} ;
      cd dist ;
      zip -r ../${releaseFilename} ./Koha ;
      cd .. ;
      rm -rf dist ;
    `).exec();
      resolve();
    })
);

gulp.task("release", () => {
  gulp.src(releaseFilename).pipe(
    release({
      manifest: require("./package.json"), // package.json from which default values will be extracted if they're missing
    })
  );
});
